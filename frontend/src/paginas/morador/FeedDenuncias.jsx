import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cliente from '../../api/cliente';
import { useAuth } from '../../contextos/AuthContext';
import ImagemDenuncia from '../../componentes/ImagemDenuncia';

const ImagemMiniatura = ({ denunciaId }) => {
  const { data: anexosData } = useQuery({
    queryKey: ['anexos', denunciaId],
    queryFn: async () => {
      const response = await cliente.get(`/api/denuncias/${denunciaId}/anexos`);
      return response.data;
    },
    staleTime: 60000,
  });

  const foto = anexosData?.content?.[0];
  if (!foto) {
    return (
      <div className="w-full h-40 bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center text-slate-300 border-b border-gray-100 relative">
        <span className="text-4xl select-none filter drop-shadow-xs">🏙️</span>
      </div>
    );
  }

  return (
    <div className="w-full h-40 overflow-hidden relative border-b border-gray-100">
      <ImagemDenuncia 
        url={foto.urlDownload} 
        alt={foto.nomeOriginal}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  );
};

const ControlePaginacao = ({ pagina, totalPaginas, setPagina, tamanho, setTamanho }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-6 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <span>Itens por página:</span>
        <select
          value={tamanho}
          onChange={(e) => { setTamanho(Number(e.target.value)); setPagina(0); }}
          className="border border-gray-200 rounded-lg p-1 bg-white text-gray-700 cursor-pointer focus:outline-hidden"
        >
          <option value={3}>3</option>
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
        </select>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center space-x-2">
          <button
            disabled={pagina === 0}
            onClick={() => setPagina(p => p - 1)}
            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold bg-white text-gray-600 disabled:opacity-50 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            &larr; Anterior
          </button>
          <span className="font-semibold text-gray-600">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <button
            disabled={pagina + 1 >= totalPaginas}
            onClick={() => setPagina(p => p + 1)}
            className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-bold bg-white text-gray-600 disabled:opacity-50 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Próxima &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

const CardDenuncia = ({ 
  denuncia, 
  apoiadaPeloUsuario, 
  urgentePeloUsuario, 
  usuario, 
  apoiarMutacao, 
  urgenteMutacao, 
  getStatusColor, 
  formataData 
}) => {
  return (
    <div className="group bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg rounded-xl overflow-hidden shadow-xs transition-all duration-300 flex flex-col justify-between h-full">
      <div className="flex flex-col flex-1">
        {/* Miniatura de Foto como Capa */}
        <ImagemMiniatura denunciaId={denuncia.id} />

        {/* Conteúdo Principal */}
        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Cabeçalho do Card (Badges) */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                {denuncia.categoriaNome}
              </span>
              
              <span className={`px-2 py-0.5 rounded-md font-semibold border ${getStatusColor(denuncia.status)}`}>
                {denuncia.status.replace('_', ' ')}
              </span>

              {usuario && denuncia.autorId === usuario.id && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold border border-slate-200">
                  👤 Meu Relato
                </span>
              )}
            </div>

            {/* Título & Descrição */}
            <div>
              <Link 
                to={`/denuncias/${denuncia.id}`} 
                className="text-base font-bold text-gray-900 hover:text-blue-600 block transition-colors mt-1 line-clamp-1"
              >
                {denuncia.titulo}
              </Link>
              <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                {denuncia.descricao}
              </p>
            </div>
          </div>

          {/* Localização e Data */}
          <div className="space-y-1 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 line-clamp-1">
              <span>📍</span>
              <span className="truncate">{denuncia.bairro}, {denuncia.cidade}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>{formataData(denuncia.criadoEm)}</span>
              <span className="truncate">Por: {denuncia.autorNomeExibido} {denuncia.anonima && '🤐'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações e Interações */}
      <div className="px-5 pb-5 pt-0 space-y-4">
        {/* Contadores Rápidos */}
        <div className="grid grid-cols-3 gap-1 py-2 px-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 text-center font-medium">
          <div>
            <span className="block text-sm">👍</span>
            <strong>{denuncia.quantidadeConfirmacoes}</strong> apoios
          </div>
          <div>
            <span className="block text-sm">🚨</span>
            <strong>{denuncia.quantidadeUrgencias}</strong> urgentes
          </div>
          <div>
            <span className="block text-sm">💬</span>
            <strong>{denuncia.quantidadeComentarios}</strong> coments
          </div>
        </div>

        <div className="space-y-2">
          {/* Botões Rápidos de Ação (Apenas para Morador, exceto se for o autor da própria denúncia) */}
          {usuario?.perfilGlobal === 'MORADOR' && usuario?.id !== denuncia.autorId && (
            <div className="grid grid-cols-2 gap-2">
              {/* Botão Apoiar */}
              <button
                onClick={() => apoiarMutacao.mutate({ id: denuncia.id, apoiado: !!apoiadaPeloUsuario })}
                disabled={apoiarMutacao.isPending}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border text-center ${
                  apoiadaPeloUsuario
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                {apoiadaPeloUsuario ? '👍 Apoiado' : '👍 Apoiar'}
              </button>
              
              {/* Botão Urgente */}
              <button
                onClick={() => urgenteMutacao.mutate({ id: denuncia.id, urgente: !!urgentePeloUsuario })}
                disabled={urgenteMutacao.isPending}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border text-center ${
                  urgentePeloUsuario
                    ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700 shadow-sm'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}
              >
                {urgentePeloUsuario ? '🚨 Urgente' : '🚨 Urgente'}
              </button>
            </div>
          )}

          <Link
            to={`/denuncias/${denuncia.id}`}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 py-2 rounded-lg text-xs font-bold block text-center w-full transition-all duration-200"
          >
            Ver Detalhes &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeedDenuncias = () => {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();

  // Estados de Filtros
  const [cidade, setCidade] = useState(usuario?.perfilGlobal === 'MORADOR' ? (usuario?.cidade || '') : '');
  const [bairro, setBairro] = useState('');
  const [status, setStatus] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [modo, setModo] = useState('MISTO');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('COMUNIDADE'); // 'COMUNIDADE' ou 'MINHAS'

  // Estados de Paginação
  const [paginaGeral, setPaginaGeral] = useState(0);
  const [tamanhoGeral, setTamanhoGeral] = useState(6);
  const [paginaMinhas, setPaginaMinhas] = useState(0);
  const [tamanhoMinhas, setTamanhoMinhas] = useState(6);

  // Listar Categorias para o Dropdown
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

  // Listar Feed de Denúncias com Filtros (Excluindo Minhas se morador)
  const { data: feedData, isLoading, isError, refetch } = useQuery({
    queryKey: ['feed', { cidade, bairro, status, categoriaId, modo, paginaGeral, tamanhoGeral }],
    queryFn: async () => {
      const params = {
        page: paginaGeral,
        size: tamanhoGeral,
        modo,
        excluirProprias: usuario?.perfilGlobal === 'MORADOR',
      };
      if (cidade) params.cidade = cidade;
      if (bairro) params.bairro = bairro;
      if (status) params.status = status;
      if (categoriaId) params.categoriaId = categoriaId;

      const response = await cliente.get('/api/feed/denuncias', { params });
      return response.data;
    },
  });

  // Listar Minhas Denúncias com Filtros
  const { data: minhasData, isLoading: loadingMinhas, isError: erroMinhas } = useQuery({
    queryKey: ['minhas-denuncias', { cidade, bairro, status, categoriaId, paginaMinhas, tamanhoMinhas }],
    queryFn: async () => {
      const params = {
        page: paginaMinhas,
        size: tamanhoMinhas,
      };
      if (cidade) params.cidade = cidade;
      if (bairro) params.bairro = bairro;
      if (status) params.status = status;
      if (categoriaId) params.categoriaId = categoriaId;

      const response = await cliente.get('/api/denuncias/minhas', { params });
      return {
        ...response.data,
        content: response.data.content.map(d => ({
          denuncia: d,
          apoiadaPeloUsuario: false,
          urgentePeloUsuario: false,
        })),
      };
    },
    enabled: usuario?.perfilGlobal === 'MORADOR',
  });

  // Mutação para Confirmar Relevância / Apoiar
  const apoiarMutacao = useMutation({
    mutationFn: async ({ id, apoiado }) => {
      if (apoiado) {
        await cliente.delete(`/api/denuncias/${id}/confirmacoes`);
      } else {
        await cliente.post(`/api/denuncias/${id}/confirmacoes`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-denuncias'] });
    },
  });

  // Mutação para Marcar Urgência
  const urgenteMutacao = useMutation({
    mutationFn: async ({ id, urgente }) => {
      if (urgente) {
        await cliente.delete(`/api/denuncias/${id}/urgencias`);
      } else {
        await cliente.post(`/api/denuncias/${id}/urgencias`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['minhas-denuncias'] });
    },
  });

  const handleLimparFiltros = () => {
    setCidade(usuario?.perfilGlobal === 'MORADOR' ? (usuario?.cidade || '') : '');
    setBairro('');
    setStatus('');
    setCategoriaId('');
    setModo('MISTO');
    setPaginaGeral(0);
    setPaginaMinhas(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ABERTO': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'EM_ANALISE': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'ENCAMINHADO': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'EM_ANDAMENTO': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'PROGRAMADO': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'CONCLUIDO': return 'bg-green-50 text-green-800 border-green-200';
      case 'REABERTO': return 'bg-red-50 text-red-800 border-red-200';
      case 'ARQUIVADO': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formataData = (dataStr) => {
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const denuncias = feedData?.content || [];
  const totalPaginas = feedData?.totalPages || 0;

  const pref = prefeituras.find(p => p.cidade?.toLowerCase() === usuario?.cidade?.toLowerCase());
  const localizacaoExibida = pref ? `${pref.cidade} - ${pref.estado}` : (usuario?.cidade || '');

  return (
    <div className="space-y-10 font-sans">

      {/* Cabeçalho Minimalista da Página */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
            Feed de Relatos
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Olá, {usuario?.nome}. Acompanhe, apoie e fiscalize os problemas urbanos da sua região.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pequeno Card de Localização */}
          {localizacaoExibida && (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 shadow-3xs whitespace-nowrap">
              <span>📍</span>
              <span>{localizacaoExibida}</span>
            </div>
          )}

          {/* Botão de Filtro Discreto */}
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${filtrosAbertos
                ? 'bg-slate-100 text-slate-800 border-slate-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
          >
            <span>🔍</span> {filtrosAbertos ? 'Ocultar Filtros' : 'Filtrar'}
          </button>

          {usuario?.perfilGlobal === 'MORADOR' && (
            <Link
              to="/denuncias/nova"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow-xs hover:shadow-sm transition-all text-xs whitespace-nowrap"
            >
              + Nova denúncia
            </Link>
          )}
        </div>
      </div>

      {/* Seção de Filtros Expansível */}
      {filtrosAbertos && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔍</span> Filtros Ativos
            </h3>
            {(cidade || bairro || status || categoriaId || modo !== 'MISTO') && (
              <button
                onClick={handleLimparFiltros}
                className="text-[10px] lowercase text-red-500 hover:text-red-700 font-bold px-2 py-0.5 border border-red-200 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">

            {/* Cidade - Exibido apenas para servidores ou Admin App */}
            {usuario?.perfilGlobal !== 'MORADOR' && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => { setCidade(e.target.value); setPaginaGeral(0); setPaginaMinhas(0); }}
                  placeholder="Ex: Mamanguape"
                  className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 focus:outline-hidden"
                />
              </div>
            )}

            {/* Bairro */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={(e) => { setBairro(e.target.value); setPaginaGeral(0); setPaginaMinhas(0); }}
                placeholder="Ex: Centro"
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 focus:outline-hidden"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Categoria</label>
              <select
                value={categoriaId}
                onChange={(e) => { setCategoriaId(e.target.value); setPaginaGeral(0); setPaginaMinhas(0); }}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="">Todas</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPaginaGeral(0); setPaginaMinhas(0); }}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-gray-800 focus:outline-hidden cursor-pointer"
              >
                <option value="">Qualquer status</option>
                <option value="ABERTO">Aberto</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="ENCAMINHADO">Encaminhado</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="PROGRAMADO">Programado</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="REABERTO">Reaberto</option>
                <option value="ARQUIVADO">Arquivado</option>
              </select>
            </div>

            {/* Modo de Ordenação */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Visualizar como</label>
              <select
                value={modo}
                onChange={(e) => { setModo(e.target.value); setPaginaGeral(0); setPaginaMinhas(0); }}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-505 focus:outline-hidden cursor-pointer"
              >
                <option value="MISTO">Misto (Novas + Engajadas)</option>
                <option value="RECENTES">Recentes</option>
                <option value="EM_ALTA">Em Alta (Populares)</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* Switch de Abas Premium */}
      {usuario?.perfilGlobal === 'MORADOR' && (
        <div className="flex justify-center md:justify-start pb-2">
          <div className="bg-slate-100 p-1.5 rounded-xl inline-flex items-center gap-1 border border-slate-200/60 shadow-xs relative">
            <button
              onClick={() => setAbaAtiva('COMUNIDADE')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                abaAtiva === 'COMUNIDADE'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50/50'
              }`}
            >
              🌍 Comunidade
            </button>
            <button
              onClick={() => setAbaAtiva('MINHAS')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                abaAtiva === 'MINHAS'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50/50'
              }`}
            >
              👤 Minhas denúncias
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo da Aba Ativa */}
      {abaAtiva === 'COMUNIDADE' ? (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-850 flex items-center gap-2">
            <span>🌍</span> Relatos da Comunidade
          </h3>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 font-semibold">Buscando relatos da comunidade...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-red-500 font-medium">Não foi possível carregar as denúncias.</p>
              <button onClick={() => refetch()} className="mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold">Tentar novamente</button>
            </div>
          ) : denuncias.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-sm font-bold text-gray-500">Nenhum relato de outros moradores encontrado nesta região 🍃</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {denuncias.map(({ denuncia, apoiadaPeloUsuario, urgentePeloUsuario }) => (
                  <CardDenuncia
                    key={denuncia.id}
                    denuncia={denuncia}
                    apoiadaPeloUsuario={apoiadaPeloUsuario}
                    urgentePeloUsuario={urgentePeloUsuario}
                    usuario={usuario}
                    apoiarMutacao={apoiarMutacao}
                    urgenteMutacao={urgenteMutacao}
                    getStatusColor={getStatusColor}
                    formataData={formataData}
                  />
                ))}
              </div>
              
              <ControlePaginacao 
                pagina={paginaGeral}
                totalPaginas={totalPaginas}
                setPagina={setPaginaGeral}
                tamanho={tamanhoGeral}
                setTamanho={setTamanhoGeral}
              />
            </div>
          )}
        </div>
      ) : (
        usuario?.perfilGlobal === 'MORADOR' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-850 flex items-center gap-2">
              <span>👤</span> Minhas denúncias
            </h3>

            {loadingMinhas ? (
              <div className="text-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500 font-semibold">Buscando minhas denúncias...</p>
              </div>
            ) : erroMinhas ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-red-500 font-medium">Não foi possível carregar suas denúncias.</p>
              </div>
            ) : (minhasData?.content || []).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-sm font-bold text-gray-500">Você ainda não relatou nenhum problema 🏙️</p>
                <p className="text-xs text-gray-400 mt-1">Quando você criar uma denúncia, ela aparecerá organizada aqui.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(minhasData?.content || []).map(({ denuncia, apoiadaPeloUsuario, urgentePeloUsuario }) => (
                    <CardDenuncia
                      key={denuncia.id}
                      denuncia={denuncia}
                      apoiadaPeloUsuario={apoiadaPeloUsuario}
                      urgentePeloUsuario={urgentePeloUsuario}
                      usuario={usuario}
                      apoiarMutacao={apoiarMutacao}
                      urgenteMutacao={urgenteMutacao}
                      getStatusColor={getStatusColor}
                      formataData={formataData}
                    />
                  ))}
                </div>
                
                <ControlePaginacao 
                  pagina={paginaMinhas}
                  totalPaginas={minhasData?.totalPages || 0}
                  setPagina={setPaginaMinhas}
                  tamanho={tamanhoMinhas}
                  setTamanho={setTamanhoMinhas}
                />
              </div>
            )}
          </div>
        )
      )}

    </div>
  );
};

export default FeedDenuncias;
