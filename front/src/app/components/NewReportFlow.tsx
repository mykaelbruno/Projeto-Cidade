import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bug,
  Camera,
  CheckCircle2,
  Droplet,
  Footprints,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  MapPin,
  Navigation,
  Trees,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button } from './ui/button';
import { categoriaService } from '../services/categoriaService';
import { denunciaService } from '../services/denunciaService';
import { organizacaoService } from '../services/organizacaoService';
import { getApiErrorMessage } from '../services/apiClient';
import { useUser } from '../contexts/UserContext';
import { compressImageFile } from '../utils/imageCompression';
import type { CategoriaResponseDTO } from '../types/categoria';
import type { DenunciaCreateRequestDTO, DenunciaSemelhanteResponseDTO } from '../types/denuncia';
import type { BairroResponseDTO, OrganizacaoResponseDTO } from '../types/organizacao';

interface NewReportFlowProps {
  onClose: () => void;
  onComplete: (denunciaId: number) => void;
}

const categoryIcons = [AlertCircle, Lightbulb, Trash2, Droplet, Bug, Footprints, Heart, Trees, Wrench];

const statusLabels: Record<string, string> = {
  ABERTO: 'Aberto',
  EM_ANALISE: 'Em analise',
  ENCAMINHADO: 'Encaminhado',
  EM_ANDAMENTO: 'Em andamento',
  PROGRAMADO: 'Programado',
  CONCLUIDO: 'Concluido',
  REABERTO: 'Reaberto',
  ARQUIVADO: 'Arquivado',
};

function distanceLabel(distance: number | null) {
  if (distance === null) {
    return 'Distancia nao calculada';
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }

  return `${(distance / 1000).toFixed(1)} km`;
}

export function NewReportFlow({ onClose, onComplete }: NewReportFlowProps) {
  const { usuario } = useUser();
  const [step, setStep] = useState(1);
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [prefeituras, setPrefeituras] = useState<OrganizacaoResponseDTO[]>([]);
  const [bairros, setBairros] = useState<BairroResponseDTO[]>([]);
  const [selectedPrefeituraId, setSelectedPrefeituraId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(usuario?.cidade ?? '');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState(usuario?.bairro ?? '');
  const [referencePoint, setReferencePoint] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [semelhantes, setSemelhantes] = useState<DenunciaSemelhanteResponseDTO[] | null>(null);
  const [semelhantesChecked, setSemelhantesChecked] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingPrefeituras, setIsLoadingPrefeituras] = useState(true);
  const [isLoadingBairros, setIsLoadingBairros] = useState(false);
  const [isCheckingSimilar, setIsCheckingSimilar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createdReportId, setCreatedReportId] = useState<number | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;
  const activeCategories = useMemo(() => categorias.filter((categoria) => categoria.ativa), [categorias]);
  const selectedCategory = activeCategories.find((categoria) => categoria.id === selectedCategoryId);
  const selectedPrefeitura = prefeituras.find((prefeitura) => prefeitura.id === selectedPrefeituraId);
  const selectedBairro = bairros.find((bairro) => bairro.nome === neighborhood);

  useEffect(() => {
    categoriaService.listar()
      .then(setCategorias)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoadingCategories(false));
  }, []);

  useEffect(() => {
    organizacaoService.listarPrefeiturasAtivas()
      .then((response) => {
        setPrefeituras(response);

        const prefeituraDaSessao = response.find((prefeitura) =>
          prefeitura.cidade.toLowerCase() === (usuario?.cidade ?? '').toLowerCase());

        if (prefeituraDaSessao) {
          setSelectedPrefeituraId(prefeituraDaSessao.id);
          setCity(prefeituraDaSessao.cidade);
          return;
        }

        if (response.length === 1) {
          setSelectedPrefeituraId(response[0].id);
          setCity(response[0].cidade);
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setIsLoadingPrefeituras(false));
  }, [usuario?.cidade]);

  useEffect(() => {
    if (!selectedPrefeituraId) {
      setBairros([]);
      return;
    }

    const prefeitura = prefeituras.find((item) => item.id === selectedPrefeituraId);
    if (prefeitura) {
      setCity(prefeitura.cidade);
    }

    setIsLoadingBairros(true);
    organizacaoService.listarBairrosAtivos(selectedPrefeituraId)
      .then((response) => {
        setBairros(response);
        setNeighborhood((current) => {
          const bairroAtualValido = response.some((bairro) => bairro.nome === current);
          if (bairroAtualValido) {
            return current;
          }

          const bairroDaSessao = response.find((bairro) =>
            bairro.nome.toLowerCase() === (usuario?.bairro ?? '').toLowerCase());
          return bairroDaSessao?.nome ?? '';
        });
      })
      .catch((err) => {
        setBairros([]);
        setNeighborhood('');
        setError(getApiErrorMessage(err));
      })
      .finally(() => setIsLoadingBairros(false));
  }, [prefeituras, selectedPrefeituraId, usuario?.bairro]);

  useEffect(() => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [files]);

  function resetSimilarCheck() {
    setSemelhantes(null);
    setSemelhantesChecked(false);
  }

  function buildPayload(): DenunciaCreateRequestDTO {
    return {
      titulo: title.trim(),
      descricao: description.trim(),
      categoriaId: selectedCategoryId as number,
      prefeituraId: selectedPrefeituraId,
      bairroId: selectedBairro?.id ?? null,
      anonima: isAnonymous,
      cidade: city.trim(),
      bairro: neighborhood.trim(),
      rua: street.trim() || null,
      pontoReferencia: referencePoint.trim() || null,
      latitude,
      longitude,
    };
  }

  function canContinue() {
    if (step === 1) {
      return Boolean(selectedCategoryId);
    }

    if (step === 2) {
      if (prefeituras.length > 0) {
        return Boolean(selectedPrefeituraId) && neighborhood.trim().length > 0;
      }

      return city.trim().length > 0 && neighborhood.trim().length > 0;
    }

    if (step === 3) {
      return title.trim().length >= 5 && description.trim().length >= 20;
    }

    return !isSubmitting && !isCheckingSimilar;
  }

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 6);

    setFiles(nextFiles);
    event.target.value = '';
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function useCurrentLocation() {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Seu navegador nao disponibilizou geolocalizacao.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => setLocationError('Nao foi possivel capturar sua localizacao. Voce ainda pode informar o endereco manualmente.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function checkSimilar() {
    setIsCheckingSimilar(true);
    setError(null);

    try {
      const response = await denunciaService.buscarSemelhantes(buildPayload());
      setSemelhantes(response);
      setSemelhantesChecked(true);
      return response;
    } catch (err) {
      setError(getApiErrorMessage(err));
      return null;
    } finally {
      setIsCheckingSimilar(false);
    }
  }

  async function submitReport() {
    setIsSubmitting(true);
    setError(null);

    try {
      const created = await denunciaService.criar(buildPayload());

      for (const file of files) {
        const compressed = await compressImageFile(file);
        await denunciaService.anexar(created.id, compressed);
      }

      setCreatedReportId(created.id);
      setStep(totalSteps + 1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNext() {
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    if (!semelhantesChecked) {
      const response = await checkSimilar();
      if (response && response.length > 0) {
        return;
      }
    }

    await submitReport();
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      return;
    }

    onClose();
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          O que voce quer informar?
        </h2>
        <p className="text-muted-foreground">
          Selecione uma categoria cadastrada no sistema.
        </p>
      </div>

      {isLoadingCategories ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
          Carregando categorias...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {activeCategories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length];
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  resetSimilarCheck();
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  selectedCategoryId === category.id
                    ? 'border-primary bg-secondary'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedCategoryId === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">{category.nome}</span>
                {category.descricao && (
                  <span className="text-xs text-muted-foreground line-clamp-2 text-center">
                    {category.descricao}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Onde esta o problema?
        </h2>
        <p className="text-muted-foreground">
          Informe cidade, bairro e endereco. A coordenada ajuda o mapa, mas nao e obrigatoria.
        </p>
      </div>

      <div className="aspect-[4/3] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden border border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <MapPin className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {latitude && longitude ? 'Coordenada capturada' : 'Localizacao manual'}
            </p>
            <p className="text-xs text-muted-foreground">
              {latitude && longitude
                ? 'O relato sera exibido no mapa da cidade.'
                : 'Use sua localizacao ou preencha o endereco.'}
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
      >
        <Navigation className="w-5 h-5" />
        Usar minha localizacao
      </button>

      {locationError && <p className="text-sm text-destructive">{locationError}</p>}

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
            {prefeituras.length > 0 ? (
              <select
                value={selectedPrefeituraId ?? ''}
                onChange={(event) => {
                  const prefeituraId = event.target.value ? Number(event.target.value) : null;
                  const prefeitura = prefeituras.find((item) => item.id === prefeituraId);
                  setSelectedPrefeituraId(prefeituraId);
                  setCity(prefeitura?.cidade ?? '');
                  setNeighborhood('');
                  resetSimilarCheck();
                }}
                disabled={isLoadingPrefeituras}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">
                  {isLoadingPrefeituras ? 'Carregando cidades...' : 'Selecione a cidade'}
                </option>
                {prefeituras.map((prefeitura) => (
                  <option key={prefeitura.id} value={prefeitura.id}>
                    {prefeitura.cidade} - {prefeitura.estado}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  resetSimilarCheck();
                }}
                placeholder="Ex: Mamanguape"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}
            {selectedPrefeitura && (
              <p className="text-xs text-muted-foreground mt-1">
                Prefeitura: {selectedPrefeitura.nome}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bairro</label>
            {prefeituras.length > 0 ? (
              <select
                value={neighborhood}
                onChange={(event) => {
                  setNeighborhood(event.target.value);
                  resetSimilarCheck();
                }}
                disabled={!selectedPrefeituraId || isLoadingBairros}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">
                  {!selectedPrefeituraId
                    ? 'Selecione a cidade primeiro'
                    : isLoadingBairros
                      ? 'Carregando bairros...'
                      : 'Selecione o bairro'}
                </option>
                {bairros.map((bairro) => (
                  <option key={bairro.id} value={bairro.nome}>
                    {bairro.nome}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={neighborhood}
                onChange={(event) => {
                  setNeighborhood(event.target.value);
                  resetSimilarCheck();
                }}
                placeholder="Digite o bairro"
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            )}
            {selectedPrefeituraId && !isLoadingBairros && bairros.length === 0 && (
              <p className="text-xs text-amber-700 mt-1">
                Nenhum bairro ativo cadastrado para esta cidade.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Rua</label>
          <input
            type="text"
            value={street}
            onChange={(event) => {
              setStreet(event.target.value);
              resetSimilarCheck();
            }}
            placeholder="Digite o nome da rua"
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Ponto de referencia</label>
          <input
            type="text"
            value={referencePoint}
            onChange={(event) => {
              setReferencePoint(event.target.value);
              resetSimilarCheck();
            }}
            placeholder="Ex: em frente a escola, perto da praca..."
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Conte mais detalhes
        </h2>
        <p className="text-muted-foreground">
          Descreva o problema e adicione fotos, se tiver.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Titulo do relato</label>
          <input
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              resetSimilarCheck();
            }}
            placeholder="Ex: Buraco grande na Rua das Flores"
            maxLength={120}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground mt-1">Minimo de 5 caracteres.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Descricao</label>
          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              resetSimilarCheck();
            }}
            placeholder="Descreva o problema em detalhes..."
            rows={5}
            maxLength={2000}
            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">Minimo de 20 caracteres.</p>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">Publicar como anonimo</label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Seu nome nao sera exibido publicamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isAnonymous ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isAnonymous ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <label className="border-2 border-dashed border-border rounded-2xl p-8 text-center block cursor-pointer hover:border-primary/40 transition-colors">
          <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Adicionar fotos</p>
          <p className="text-xs text-muted-foreground">
            Imagens grandes serao compactadas antes do envio.
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesChange}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                {filePreviews[index] ? (
                  <img src={filePreviews[index]} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-xs"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Revisar relato</h2>
        <p className="text-muted-foreground">
          Antes de enviar, o sistema verifica se ja existe algo parecido perto deste local.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Categoria</div>
          <div className="font-medium text-foreground">{selectedCategory?.nome}</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Localizacao</div>
          <div className="font-medium text-foreground">
            {street || 'Rua nao informada'}, {neighborhood}, {city}
          </div>
          {referencePoint && <div className="text-sm text-muted-foreground mt-1">{referencePoint}</div>}
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Titulo</div>
          <div className="font-medium text-foreground">{title}</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Descricao</div>
          <div className="text-sm text-foreground">{description}</div>
        </div>

        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="text-xs text-muted-foreground mb-1">Fotos</div>
          <div className="font-medium text-foreground">
            {files.length === 0 ? 'Nenhuma foto adicionada' : `${files.length} foto${files.length === 1 ? '' : 's'} selecionada${files.length === 1 ? '' : 's'}`}
          </div>
        </div>

        {isAnonymous && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-xs text-amber-700">Este relato sera publicado anonimamente.</div>
          </div>
        )}

        {semelhantesChecked && semelhantes && semelhantes.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-3">
            <div>
              <h3 className="font-display font-semibold text-blue-900">Relatos parecidos encontrados</h3>
              <p className="text-sm text-blue-800">
                Talvez seja melhor apoiar um relato existente em vez de criar outro.
              </p>
            </div>
            <div className="space-y-2">
              {semelhantes.slice(0, 3).map((item) => (
                <div key={item.denunciaId} className="bg-card border border-blue-100 rounded-xl p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{item.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.rua || 'Rua nao informada'}, {item.bairro} - {distanceLabel(item.distanciaMetros)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.percentualSemelhancaTexto}% parecido</span>
                    <span>{item.quantidadeConfirmacoes} apoios</span>
                    <span>{item.quantidadeUrgencias} urgencias</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onComplete(item.denunciaId)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Ver relato existente
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {semelhantesChecked && semelhantes && semelhantes.length === 0 && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-sm text-emerald-800">
            Nenhum relato semelhante foi encontrado. Pode enviar.
          </div>
        )}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-3">Relato enviado com sucesso!</h2>
        <p className="text-muted-foreground mb-8">
          Sua informacao foi registrada e sera analisada. Voce pode acompanhar cada etapa pelo detalhe do relato.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => createdReportId && onComplete(createdReportId)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            Acompanhar relato
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-muted text-foreground rounded-xl font-medium">
            Voltar ao feed
          </button>
        </div>
      </div>
    </div>
  );

  if (step > totalSteps) {
    return <div className="fixed inset-0 bg-background z-50 flex flex-col">{renderSuccess()}</div>;
  }

  const buttonLabel = step === totalSteps
    ? semelhantesChecked && semelhantes && semelhantes.length > 0
      ? 'Criar mesmo assim'
      : 'Verificar e enviar'
    : 'Continuar';

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-sm font-medium text-muted-foreground">
            Etapa {step} de {totalSteps}
          </div>
          <div className="w-9" />
        </div>
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>

      <div className="sticky bottom-0 bg-card border-t border-border p-4">
        <button
          onClick={handleNext}
          disabled={!canContinue()}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {(isCheckingSimilar || isSubmitting) && <Loader2 className="w-4 h-4 animate-spin" />}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
