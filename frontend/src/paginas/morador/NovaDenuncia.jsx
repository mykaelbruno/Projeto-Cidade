import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import cliente from '../../api/cliente';
import { useAuth } from '../../contextos/AuthContext';

// Correção para ícone do marcador Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Coordenadas padrão (Mamanguape, PB)
const COORDS_PADRAO = [-6.8379, -35.1264];

const schemaDenuncia = zod.object({
  titulo: zod.string().min(5, 'O título deve ter no mínimo 5 caracteres').max(120, 'Máximo de 120 caracteres'),
  descricao: zod.string().min(20, 'A descrição detalhada deve ter no mínimo 20 caracteres').max(2000, 'Máximo de 2000 caracteres'),
  categoriaId: zod.string().min(1, 'Selecione uma categoria'),
  anonima: zod.boolean().default(false),
  cidade: zod.string().min(1, 'Cidade é obrigatória').max(100),
  bairro: zod.string().min(1, 'Bairro é obrigatório').max(100),
  rua: zod.string().max(150).optional().or(zod.literal('')),
  pontoReferencia: zod.string().max(200).optional().or(zod.literal('')),
  latitude: zod.number().nullable().optional(),
  longitude: zod.number().nullable().optional(),
});

// Componente para capturar cliques no mapa
const SeletorMapa = ({ aoSelecionarCoords }) => {
  useMapEvents({
    click(e) {
      aoSelecionarCoords(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const NovaDenuncia = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coordsSelecionadas, setCoordsSelecionadas] = useState(null);
  const [imagens, setImagens] = useState([]);
  const [semelhantes, setSemelhantes] = useState([]);
  const [verificouSemelhantes, setVerificouSemelhantes] = useState(false);

  const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schemaDenuncia),
    defaultValues: {
      cidade: usuario?.cidade || 'Mamanguape',
      anonima: false,
    }
  });

  useEffect(() => {
    if (usuario?.cidade) {
      setValue('cidade', usuario.cidade);
    }
  }, [usuario, setValue]);

  const categoriaIdWatch = watch('categoriaId');
  const bairroWatch = watch('bairro');

  // Carregar categorias
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await cliente.get('/api/categorias');
      return response.data;
    },
  });

  // Carregar prefeituras ativas para obter UF
  const { data: prefeituras = [] } = useQuery({
    queryKey: ['prefeiturasAtivasPublicas'],
    queryFn: async () => {
      const response = await cliente.get('/api/organizacoes/prefeituras');
      return response.data;
    },
  });

  // Atualizar latitude/longitude no formulário quando selecionado no mapa e reverse geocoding
  const handleSelecionarCoords = async (lat, lng) => {
    setCoordsSelecionadas({ lat, lng });
    setValue('latitude', lat);
    setValue('longitude', lng);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const { road, suburb, neighbourhood, city, town, village, municipality } = data.address;
          const nomeRua = road || '';
          const nomeBairro = suburb || neighbourhood || '';
          const nomeCidade = city || town || village || municipality || '';

          if (nomeRua) setValue('rua', nomeRua);
          if (nomeBairro) setValue('bairro', nomeBairro);
          if (nomeCidade) setValue('cidade', nomeCidade);
        }
      }
    } catch (err) {
      console.error('Erro na geocodificação reversa:', err);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5); // Máximo de 5
      setImagens(filesArray);
    }
  };

  // Buscar denúncias semelhantes de forma debouncada
  useEffect(() => {
    if (!categoriaIdWatch || !bairroWatch) {
      setSemelhantes([]);
      setVerificouSemelhantes(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const executarBusca = async () => {
        setErro(null);
        setLoading(true);
        try {
          const payload = {
            titulo: getValues('titulo') || 'Busca automática',
            descricao: getValues('descricao') || 'Descrição automática temporária para consulta.',
            categoriaId: Number(categoriaIdWatch),
            anonima: getValues('anonima'),
            cidade: getValues('cidade'),
            bairro: bairroWatch,
            rua: getValues('rua') || '',
            pontoReferencia: getValues('pontoReferencia') || '',
            latitude: coordsSelecionadas?.lat || null,
            longitude: coordsSelecionadas?.lng || null,
          };

          const response = await cliente.post('/api/denuncias/semelhantes', payload);
          setSemelhantes(response.data);
          setVerificouSemelhantes(true);
        } catch (err) {
          console.error('Erro ao buscar denúncias semelhantes automaticamente:', err);
        } finally {
          setLoading(false);
        }
      };
      executarBusca();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [categoriaIdWatch, bairroWatch, coordsSelecionadas, getValues]);

  const onSubmit = async (dados) => {
    setErro(null);
    setLoading(true);
    try {
      const payload = {
        ...dados,
        categoriaId: Number(dados.categoriaId),
        latitude: coordsSelecionadas?.lat || null,
        longitude: coordsSelecionadas?.lng || null,
      };

      // 1. Criar denúncia
      const response = await cliente.post('/api/denuncias', payload);
      const denunciaCriada = response.data;

      // 2. Upload de imagens
      if (imagens.length > 0) {
        for (const img of imagens) {
          const formData = new FormData();
          formData.append('arquivo', img);
          await cliente.post(`/api/denuncias/${denunciaCriada.id}/anexos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao registrar denúncia. Verifique regras anti-spam e campos obrigatórios.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Relatar Novo Problema Urbano</h2>
          <p className="text-sm text-gray-500 mt-1">Preencha os campos abaixo com o máximo de informações possíveis.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 md:p-8">
        {erro && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-medium">
            ⚠️ {erro}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Título da Denúncia</label>
            <input
              type="text"
              {...register('titulo')}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Ex: Vazamento de água limpa na rua principal"
            />
            {errors.titulo && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.titulo.message}</p>}
          </div>

          {/* Categoria & Anonimato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Categoria do Problema</label>
              <select
                {...register('categoriaId')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 cursor-pointer"
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
              {errors.categoriaId && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.categoriaId.message}</p>}
            </div>

            <div className="flex items-center pt-6">
              <input
                id="anonima"
                type="checkbox"
                {...register('anonima')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-sm cursor-pointer"
              />
              <label htmlFor="anonima" className="ml-2 block text-sm font-semibold text-gray-700 cursor-pointer">
                Relatar anonimamente (🤐 Esconder meu nome do público)
              </label>
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Descrição Detalhada</label>
            <textarea
              rows={4}
              {...register('descricao')}
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-xs focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Descreva o problema de forma detalhada, incluindo tamanho, impactos na vizinhança ou há quanto tempo ele ocorre."
            />
            {errors.descricao && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.descricao.message}</p>}
          </div>

          {/* Endereço */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <span>📍</span> Endereço e Localização
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Cidade</label>
                <input
                  type="text"
                  value={(() => {
                    const cidadePura = usuario?.cidade || '';
                    const pref = prefeituras.find(p => p.cidade.toLowerCase() === cidadePura.toLowerCase());
                    return pref ? `${pref.cidade} - ${pref.estado}` : cidadePura;
                  })()}
                  className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 text-gray-900 bg-gray-100 cursor-not-allowed"
                  readOnly
                  disabled
                />
                <input type="hidden" {...register('cidade')} />
                {errors.cidade && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cidade.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">Bairro</label>
                <input
                  type="text"
                  {...register('bairro')}
                  className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Seu bairro"
                />
                {errors.bairro && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.bairro.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600">Rua (Opcional)</label>
                <input
                  type="text"
                  {...register('rua')}
                  className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Nome da rua"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600">Ponto de Referência (Opcional)</label>
                <input
                  type="text"
                  {...register('pontoReferencia')}
                  className="mt-1 w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ex: Próximo à padaria"
                />
              </div>
            </div>

            {/* Mapa Interativo para Geolocalização */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Selecione o local aproximado no mapa (Opcional)
              </label>
              <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 z-0">
                <MapContainer center={COORDS_PADRAO} zoom={14} className="h-full w-full">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <SeletorMapa aoSelecionarCoords={handleSelecionarCoords} />
                  {coordsSelecionadas && (
                    <Marker position={[coordsSelecionadas.lat, coordsSelecionadas.lng]} />
                  )}
                </MapContainer>
              </div>
              {coordsSelecionadas && (
                <p className="text-xs text-gray-500 mt-1 font-semibold">
                  Coordenadas selecionadas: {coordsSelecionadas.lat.toFixed(6)}, {coordsSelecionadas.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Upload de Imagens */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Imagens do Problema (Máximo 5)</label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 file:cursor-pointer hover:file:bg-blue-100"
            />
            {imagens.length > 0 && (
              <ul className="mt-2 text-xs text-gray-500 font-medium list-disc list-inside">
                {imagens.map((img, i) => (
                  <li key={i}>{img.name} ({(img.size / (1024 * 1024)).toFixed(2)} MB)</li>
                ))}
              </ul>
            )}
          </div>

          {/* Verificação Anti-Spam Automática */}
          <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold">
                🛡️ Verificação automática de duplicidades ativa para o seu bairro.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-xs disabled:bg-blue-400 cursor-pointer"
              >
                {loading ? 'Processando...' : 'Enviar Denúncia'}
              </button>
            </div>
          </div>

        </form>

        {/* Listagem de Duplicadas Encontradas */}
        {verificouSemelhantes && semelhantes.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 p-5 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-yellow-800 flex items-center gap-1.5">
              <span>⚠️</span> Encontramos {semelhantes.length} relatos semelhantes nessa área:
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {semelhantes.map(sem => (
                <div key={sem.id} className="bg-white p-3 rounded-lg border border-yellow-100 text-xs flex justify-between items-center shadow-xs">
                  <div>
                    <p className="font-bold text-gray-900">{sem.titulo}</p>
                    <p className="text-gray-500 mt-0.5">Distância: <strong>{sem.distanciaMetros.toFixed(0)}m</strong> | Status: {sem.status}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/denuncias/${sem.id}`)}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold px-3 py-1.5 rounded-lg"
                  >
                    Visualizar e Apoiar →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {verificouSemelhantes && semelhantes.length === 0 && (
          <div className="mt-8 bg-green-50 border border-green-200 p-4 rounded-xl">
            <p className="text-sm font-semibold text-green-800">
              ✔️ Nenhuma denúncia semelhante ativa encontrada no seu bairro! Pode enviar seu relato com tranquilidade.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default NovaDenuncia;
