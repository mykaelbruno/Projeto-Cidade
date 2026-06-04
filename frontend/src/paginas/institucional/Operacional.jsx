import { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cliente from '../../api/cliente';
import { useAuth } from '../../contextos/AuthContext';

const ORGANIZACAO_ATIVA_STORAGE_KEY = 'cidadeAtiva_organizacaoIdAtiva';

const selecionarVinculoOperacional = (vinculos = []) => {
  const ativos = vinculos.filter(v => v.ativo);
  return ativos.find(v => v.papel === 'ADMIN_PREFEITURA')
    || ativos.find(v => v.papel === 'ADMIN_SECRETARIA')
    || ativos.find(v => v.papel === 'ATENDENTE_SECRETARIA')
    || ativos[0]
    || null;
};

const agruparPorResponsavel = (denuncias = []) => {
  const grupos = new Map();

  denuncias.forEach((denuncia) => {
    const chave = denuncia.organizacaoResponsavelId || 'sem-responsavel';
    const nome = denuncia.organizacaoResponsavelNome || 'Sem secretaria definida';

    if (!grupos.has(chave)) {
      grupos.set(chave, { chave, nome, denuncias: [] });
    }
    grupos.get(chave).denuncias.push(denuncia);
  });

  return Array.from(grupos.values()).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
};

const Operacional = () => {
  const { usuario } = useAuth();
  const queryClient = useQueryClient();

  // O usuário digita ou seleciona seu ID de organização ativo para carregar os dados
  const [organizacaoIdInput, setOrganizacaoIdInput] = useState(() => {
    return localStorage.getItem(ORGANIZACAO_ATIVA_STORAGE_KEY) || '';
  });
  const [organizacaoIdAtiva, setOrganizacaoIdAtiva] = useState(() => {
    const salvo = localStorage.getItem(ORGANIZACAO_ATIVA_STORAGE_KEY);
    return salvo ? Number(salvo) : null;
  });
  const vinculosDaSessao = usuario?.vinculosOperacionais || [];

  // Buscar os vínculos do próprio usuário para travar a organização ativa de forma autônoma
  const {
    data: meusVinculosApi = [],
    isLoading: carregandoMeusVinculos,
    isError: erroMeusVinculos,
  } = useQuery({
    queryKey: ['meus-vinculos', usuario?.id],
    queryFn: async () => {
      try {
        const response = await cliente.get('/api/vinculos/me');
        return response.data.filter(v => v.ativo);
      } catch (erro) {
        if (usuario?.perfilGlobal === 'ADMIN_PREFEITURA') {
          const response = await cliente.get('/api/vinculos');
          return response.data.filter(v => v.ativo && v.usuarioId === usuario.id);
        }
        throw erro;
      }
    },
    enabled: !!usuario && usuario.perfilGlobal !== 'ADMIN_APP' && vinculosDaSessao.length === 0,
  });
  const meusVinculos = vinculosDaSessao.length > 0 ? vinculosDaSessao : meusVinculosApi;

  useEffect(() => {
    if (!usuario || usuario.perfilGlobal === 'ADMIN_APP') return;

    const vinculoOperacional = selecionarVinculoOperacional(meusVinculos);
    if (vinculoOperacional && organizacaoIdAtiva !== vinculoOperacional.organizacaoId) {
      const organizacaoId = vinculoOperacional.organizacaoId.toString();
      queueMicrotask(() => {
        setOrganizacaoIdAtiva(vinculoOperacional.organizacaoId);
        setOrganizacaoIdInput(organizacaoId);
      });
      localStorage.setItem(ORGANIZACAO_ATIVA_STORAGE_KEY, organizacaoId);
    }
  }, [usuario, meusVinculos, organizacaoIdAtiva]);

  // Filtros de listagem
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroBairro, setFiltroBairro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCategoriaId, setFiltroCategoriaId] = useState('');

  // Estados de controle para atualizar status
  const [denunciaSelecionada, setDenunciaSelecionada] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [motivoStatus, setMotivoStatus] = useState('');
  const [erroStatus, setErroStatus] = useState(null);

  // Estados de controle para transferência (Secretaria)
  const [transferirDenunciaId, setTransferirDenunciaId] = useState(null);
  const [sugeridoDestinoId, setSugeridoDestinoId] = useState('');
  const [motivoTransferencia, setMotivoTransferencia] = useState('');

  // Estados de controle para aprovação de transferência (Prefeitura)
  const [aprovarSolicitacaoId, setAprovarSolicitacaoId] = useState(null);
  const [finalDestinoId, setFinalDestinoId] = useState('');
  const [recusarSolicitacaoId, setRecusarSolicitacaoId] = useState(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');

  // Estados de controle para reatribuição direta (Admin Prefeitura)
  const [reatribuirDenunciaId, setReatribuirDenunciaId] = useState(null);
  const [novoResponsavelId, setNovoResponsavelId] = useState('');

  // Carregar todas as organizações para referência de IDs/nomes no protótipo
  const { data: organizacoes = [] } = useQuery({
    queryKey: ['organizacoes'],
    queryFn: async () => {
      try {
        const response = await cliente.get('/api/organizacoes');
        return response.data;
      } catch {
        return [];
      }
    },
    enabled: !!usuario,
  });

  // Carregar categorias para filtros
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      try {
        const response = await cliente.get('/api/categorias');
        return response.data;
      } catch {
        return [];
      }
    },
    enabled: !!usuario,
  });

  // 1. Listar Denúncias da Organização Selecionada com filtros ativos
  const { data: denunciasData, isLoading: carregandoDenuncias, refetch: recarregarDenuncias } = useQuery({
    queryKey: ['operacional-denuncias', organizacaoIdAtiva, filtroCidade, filtroBairro, filtroStatus, filtroCategoriaId],
    queryFn: async () => {
      const params = {};
      if (filtroCidade) params.cidade = filtroCidade;
      if (filtroBairro) params.bairro = filtroBairro;
      if (filtroStatus) params.status = filtroStatus;
      if (filtroCategoriaId) params.categoriaId = Number(filtroCategoriaId);

      const response = await cliente.get(`/api/operacional/organizacoes/${organizacaoIdAtiva}/denuncias`, { params });
      return response.data;
    },
    enabled: !!organizacaoIdAtiva,
  });
  const denuncias = denunciasData?.content || [];

  // 2. Resumo Métrico do Painel Operacional
  const { data: resumoData, isLoading: carregandoResumo } = useQuery({
    queryKey: ['operacional-resumo', organizacaoIdAtiva],
    queryFn: async () => {
      const response = await cliente.get(`/api/paineis/operacional/organizacoes/${organizacaoIdAtiva}/resumo`);
      return response.data;
    },
    enabled: !!organizacaoIdAtiva,
  });

  // 3. Listar Solicitações de Transferência (Apenas se for Prefeitura/AdminPrefeitura)
  const { data: transferenciasData, refetch: recarregarTransferencias } = useQuery({
    queryKey: ['operacional-transferencias', organizacaoIdAtiva],
    queryFn: async () => {
      const response = await cliente.get(`/api/operacional/prefeituras/${organizacaoIdAtiva}/solicitacoes-transferencia`);
      return response.data;
    },
    enabled: !!organizacaoIdAtiva && (usuario?.perfilGlobal === 'ADMIN_PREFEITURA' || usuario?.perfilGlobal === 'ADMIN_APP'),
  });
  const transferencias = transferenciasData?.content || [];

  // Exportar relatório em CSV
  const handleExportarCsv = async () => {
    try {
      const params = {};
      if (filtroCidade) params.cidade = filtroCidade;
      if (filtroBairro) params.bairro = filtroBairro;
      if (filtroStatus) params.status = filtroStatus;
      if (filtroCategoriaId) params.categoriaId = Number(filtroCategoriaId);

      const response = await cliente.get(
        `/api/relatorios/operacional/organizacoes/${organizacaoIdAtiva}/denuncias.csv`,
        {
          params,
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_denuncias_org_${organizacaoIdAtiva}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Erro ao exportar relatório CSV. Verifique se possui permissão de acesso.');
    }
  };

  // MUTAÇÃO: Atualizar Status
  const statusMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.patch(`/api/denuncias/${denunciaSelecionada.id}/status`, dados);
    },
    onSuccess: () => {
      setDenunciaSelecionada(null);
      setNovoStatus('');
      setMotivoStatus('');
      recarregarDenuncias();
    },
    onError: (err) => {
      setErroStatus(err.response?.data?.mensagem || 'Erro ao atualizar status. Verifique se seu vínculo está ativo.');
    }
  });

  // MUTAÇÃO: Solicitar Transferência (Secretaria)
  const solicitarTransferenciaMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post(`/api/operacional/denuncias/${transferirDenunciaId}/solicitacoes-transferencia`, dados);
    },
    onSuccess: () => {
      setTransferirDenunciaId(null);
      setSugeridoDestinoId('');
      setMotivoTransferencia('');
      recarregarDenuncias();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Falha ao solicitar transferência.');
    }
  });

  // MUTAÇÃO: Aprovar Transferência (Prefeitura)
  const aprovarTransferenciaMutacao = useMutation({
    mutationFn: async ({ id, dados }) => {
      await cliente.post(`/api/operacional/solicitacoes-transferencia/${id}/aprovacao`, dados);
    },
    onSuccess: () => {
      setAprovarSolicitacaoId(null);
      setFinalDestinoId('');
      recarregarTransferencias();
      recarregarDenuncias();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Falha ao aprovar.');
    }
  });

  // MUTAÇÃO: Recusar Transferência (Prefeitura)
  const recusarTransferenciaMutacao = useMutation({
    mutationFn: async ({ id, dados }) => {
      await cliente.post(`/api/operacional/solicitacoes-transferencia/${id}/recusa`, dados);
    },
    onSuccess: () => {
      setRecusarSolicitacaoId(null);
      setMotivoRecusa('');
      recarregarTransferencias();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Falha ao recusar.');
    }
  });

  // MUTAÇÃO: Reatribuir Responsável Direto (ADMIN_PREFEITURA / ADMIN_APP)
  const reatribuirResponsavelMutacao = useMutation({
    mutationFn: async ({ denunciaId, organizacaoId }) => {
      await cliente.patch(`/api/operacional/denuncias/${denunciaId}/responsavel`, { organizacaoId });
    },
    onSuccess: () => {
      setReatribuirDenunciaId(null);
      setNovoResponsavelId('');
      queryClient.invalidateQueries({ queryKey: ['operacional-denuncias'] });
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Falha ao reatribuir responsável.');
    }
  });

  const handleEntrarPainel = (e) => {
    e.preventDefault();
    if (!organizacaoIdInput) return;
    setOrganizacaoIdAtiva(Number(organizacaoIdInput));
    localStorage.setItem(ORGANIZACAO_ATIVA_STORAGE_KEY, organizacaoIdInput);
  };

  const handleSalvarStatus = (e) => {
    e.preventDefault();
    setErroStatus(null);
    if (!novoStatus) {
      setErroStatus('Selecione o novo status');
      return;
    }
    statusMutacao.mutate({
      status: novoStatus,
      organizacaoId: organizacaoIdAtiva,
      motivo: motivoStatus,
    });
  };

  const handleEnviarTransferencia = (e) => {
    e.preventDefault();
    if (!sugeridoDestinoId || !motivoTransferencia.trim()) return;
    solicitarTransferenciaMutacao.mutate({
      organizacaoDestinoSugeridaId: Number(sugeridoDestinoId),
      motivo: motivoTransferencia,
    });
  };

  const handleEnviarAprovacao = (e) => {
    e.preventDefault();
    if (!finalDestinoId) return;
    aprovarTransferenciaMutacao.mutate({
      id: aprovarSolicitacaoId,
      dados: { organizacaoDestinoId: Number(finalDestinoId) },
    });
  };

  const handleEnviarRecusa = (e) => {
    e.preventDefault();
    if (!motivoRecusa.trim()) return;
    recusarTransferenciaMutacao.mutate({
      id: recusarSolicitacaoId,
      dados: { motivo: motivoRecusa },
    });
  };

  const handleEnviarReatribuicao = (e) => {
    e.preventDefault();
    if (!novoResponsavelId) return;
    reatribuirResponsavelMutacao.mutate({
      denunciaId: reatribuirDenunciaId,
      organizacaoId: Number(novoResponsavelId),
    });
  };

  const isAdminPrefeitura = usuario?.perfilGlobal === 'ADMIN_PREFEITURA' || usuario?.perfilGlobal === 'ADMIN_APP';

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
    if (!dataStr) return 'N/A';
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Se a organização não foi selecionada ainda
  const orgAtual = organizacoes.find(o => o.id === organizacaoIdAtiva);
  const isPainelPrefeitura = orgAtual?.tipo === 'PREFEITURA' || usuario?.perfilGlobal === 'ADMIN_PREFEITURA';
  const denunciasAgrupadas = isPainelPrefeitura
    ? agruparPorResponsavel(denuncias)
    : [{ chave: 'lista-unica', nome: orgAtual?.nome || 'Organização', denuncias }];
  const opcoesVinculosOperacionais = meusVinculos.map(vinculo => {
    const organizacao = organizacoes.find(org => org.id === vinculo.organizacaoId);
    return {
      id: vinculo.organizacaoId,
      nome: vinculo.nomeOrganizacao,
      tipo: organizacao?.tipo || (vinculo.papel === 'ADMIN_PREFEITURA' ? 'PREFEITURA' : 'SECRETARIA'),
      papel: vinculo.papel,
    };
  });

  if (!organizacaoIdAtiva) {
    if (usuario?.perfilGlobal !== 'ADMIN_APP') {
      return (
        <div className="max-w-md mx-auto space-y-6 font-sans py-12">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Painel Operacional</h2>
            {carregandoMeusVinculos ? (
              <p className="text-sm text-gray-500">Carregando seu vinculo operacional...</p>
            ) : erroMeusVinculos ? (
              <p className="text-sm text-red-600">
                Nao foi possivel carregar seu vinculo operacional. Tente atualizar a pagina ou fazer login novamente.
              </p>
            ) : (
              <p className="text-sm text-red-600">
                Seu usuario nao possui vinculo operacional ativo com prefeitura ou secretaria.
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-md mx-auto space-y-6 font-sans py-12">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">⚙️ Acesso ao Painel Operacional</h2>
          <p className="text-sm text-gray-500 mb-6">
            Para gerenciar e responder às denúncias atribuídas à sua organização, informe seu ID institucional ativo.
          </p>

          <form onSubmit={handleEntrarPainel} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Selecione sua Organização</label>
              <select
                value={organizacaoIdInput}
                onChange={(e) => setOrganizacaoIdInput(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 text-gray-900 cursor-pointer focus:outline-hidden"
              >
                <option value="">Selecione...</option>
                {usuario?.perfilGlobal === 'ADMIN_APP' ? (
                  Object.keys(
                    organizacoes.reduce((acc, org) => {
                      const cid = org.cidade || 'Outros';
                      if (!acc[cid]) acc[cid] = [];
                      acc[cid].push(org);
                      return acc;
                    }, {})
                  ).map(cidade => {
                    const orgs = organizacoes.filter(org => (org.cidade || 'Outros') === cidade);
                    return (
                      <optgroup key={cidade} label={cidade}>
                        {orgs.map(org => (
                          <option key={org.id} value={org.id}>
                            {org.nome} ({org.tipo} - ID: {org.id})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })
                ) : (
                  opcoesVinculosOperacionais.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.nome} ({org.tipo} - {org.papel} - ID: {org.id})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={!organizacaoIdInput}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm disabled:bg-indigo-400 cursor-pointer shadow-xs"
              >
                Entrar no Painel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 font-sans">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            ⚙️ Gestão Operacional — {orgAtual ? orgAtual.nome : `Organização ID: ${organizacaoIdAtiva}`}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Dashboard institucional para atendimento, atualização de status e transferências.
          </p>
        </div>
        {usuario?.perfilGlobal === 'ADMIN_APP' && (
          <button
            onClick={() => { setOrganizacaoIdAtiva(null); setOrganizacaoIdInput(''); }}
            className="text-xs font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Trocar de Organização
          </button>
        )}
      </div>

      {/* Painel de Métricas Operacionais */}
      {carregandoResumo ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-xs text-gray-500">
          Carregando indicadores...
        </div>
      ) : resumoData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total de Relatos</span>
              <span className="text-2xl font-extrabold text-gray-900 block mt-1">{resumoData.denuncias?.total || 0}</span>
              <span className="text-[10px] text-gray-400 font-medium">atribuídos no total</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Taxa de Conclusão</span>
              <span className="text-2xl font-extrabold text-green-600 block mt-1">
                {resumoData.indicadores?.taxaConclusaoConfirmada?.toFixed(1) || '0.0'}%
              </span>
              <span className="text-[10px] text-gray-400 font-medium">confirmadas pelo morador</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Taxa de Reabertura</span>
              <span className="text-2xl font-extrabold text-red-600 block mt-1">
                {resumoData.indicadores?.taxaReabertura?.toFixed(1) || '0.0'}%
              </span>
              <span className="text-[10px] text-gray-400 font-medium">contestadas/reabertas</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Tempo Médio Solução</span>
              <span className="text-xl font-extrabold text-indigo-600 block mt-1.5 truncate">
                {resumoData.indicadores?.tempoMedioConfirmacaoHoras
                  ? `${resumoData.indicadores.tempoMedioConfirmacaoHoras.toFixed(1)}h`
                  : 'N/A'}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">até confirmação final</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">📍 Bairros com Mais Demandas</h4>
              {resumoData.bairrosMaisDemandados?.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sem demandas no momento.</p>
              ) : (
                <div className="space-y-2">
                  {resumoData.bairrosMaisDemandados?.map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700">{b.nome}</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">{b.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">🏷️ Categorias mais Demandadas</h4>
              {resumoData.categoriasMaisDemandadas?.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sem demandas no momento.</p>
              ) : (
                <div className="space-y-2">
                  {resumoData.categoriasMaisDemandadas?.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700">{c.nome}</span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold">{c.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Caixa de Ação: Atualizar Status */}
      {denunciaSelecionada && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl space-y-4 max-w-xl">
          <h4 className="text-sm font-bold text-indigo-950">
            Atualizar Status do Relato: "{denunciaSelecionada.titulo}"
          </h4>
          {erroStatus && <p className="text-xs text-red-600 font-semibold">⚠️ {erroStatus}</p>}

          <form onSubmit={handleSalvarStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-indigo-950 mb-1">Novo Status</label>
              <select
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden"
              >
                <option value="">Selecione...</option>
                <option value="EM_ANALISE">Em Análise</option>
                <option value="ENCAMINHADO">Encaminhado</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="PROGRAMADO">Programado</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="ARQUIVADO">Arquivado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-950 mb-1">Motivo / Ação Realizada (Opcional)</label>
              <textarea
                rows={2}
                value={motivoStatus}
                onChange={(e) => setMotivoStatus(e.target.value)}
                placeholder="Ex: Equipe enviada para reparo local"
                className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDenunciaSelecionada(null)}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Atualizar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Caixa de Ação: Solicitar Transferência */}
      {transferirDenunciaId && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl space-y-4 max-w-xl">
          <h4 className="text-sm font-bold text-indigo-950">Solicitar Transferência de Responsabilidade</h4>
          <form onSubmit={handleEnviarTransferencia} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-indigo-950 mb-1">Órgão de Destino Sugerido</label>
              <select
                value={sugeridoDestinoId}
                onChange={(e) => setSugeridoDestinoId(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden cursor-pointer"
              >
                <option value="">Selecione...</option>
                {organizacoes.map(org => (
                  <option key={org.id} value={org.id}>{org.nome} ({org.tipo})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-950 mb-1">Motivo da Transferência</label>
              <textarea
                rows={2}
                value={motivoTransferencia}
                onChange={(e) => setMotivoTransferencia(e.target.value)}
                placeholder="Justifique o motivo pelo qual este problema não é de competência de sua secretaria."
                className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setTransferirDenunciaId(null)}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Enviar Solicitação
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Caixa de Ação: Reatribuição Direta de Responsável (Admin Prefeitura) */}
      {reatribuirDenunciaId && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl space-y-4 max-w-xl">
          <h4 className="text-sm font-bold text-amber-950">
            🔁 Reatribuir Responsável — Denúncia #{reatribuirDenunciaId}
          </h4>
          <p className="text-xs text-amber-700">Selecione a secretaria ou prefeitura que deverá assumir a responsabilidade direta por este relato.</p>
          <form onSubmit={handleEnviarReatribuicao} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-950 mb-1">Novo Órgão Responsável</label>
              <select
                value={novoResponsavelId}
                onChange={(e) => setNovoResponsavelId(e.target.value)}
                className="w-full text-xs border border-amber-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden cursor-pointer"
                required
              >
                <option value="">Selecione o órgão...</option>
                {organizacoes.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.nome} ({org.tipo})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setReatribuirDenunciaId(null); setNovoResponsavelId(''); }}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={reatribuirResponsavelMutacao.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {reatribuirResponsavelMutacao.isPending ? 'Salvando...' : 'Confirmar Reatribuição'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Seção 1: Denúncias Atribuídas */}
      <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-150 pb-4">
          <h3 className="text-base font-bold text-gray-950 flex items-center gap-1.5 shrink-0">
            <span>📋</span> Relatos sob Responsabilidade da Organização
          </h3>
          
          <button
            onClick={handleExportarCsv}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>📥</span> Exportar Relatório CSV
          </button>
        </div>

        {/* Barra de Filtros Operacionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-xs">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Cidade</label>
            <input
              type="text"
              value={filtroCidade}
              onChange={(e) => setFiltroCidade(e.target.value)}
              placeholder="Filtrar por cidade..."
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Bairro</label>
            <input
              type="text"
              value={filtroBairro}
              onChange={(e) => setFiltroBairro(e.target.value)}
              placeholder="Filtrar por bairro..."
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 cursor-pointer font-semibold"
            >
              <option value="">Todos</option>
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
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Categoria</label>
            <select
              value={filtroCategoriaId}
              onChange={(e) => setFiltroCategoriaId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 cursor-pointer font-semibold"
            >
              <option value="">Todas</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {carregandoDenuncias ? (
          <p className="text-xs text-gray-500 py-6 text-center">Buscando relatos...</p>
        ) : denuncias.length === 0 ? (
          <p className="text-xs text-gray-500 italic py-6 text-center">Nenhum relato atribuído a esta organização no momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left text-gray-600">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                <tr>
                  <th className="px-4 py-3">ID / Título</th>
                  <th className="px-4 py-3">Bairro</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Relevância</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {denunciasAgrupadas.map(grupo => (
                  <Fragment key={grupo.chave}>
                    {isPainelPrefeitura && (
                      <tr className="bg-indigo-50/70">
                        <td colSpan={6} className="px-4 py-2 text-[11px] font-extrabold uppercase text-indigo-900">
                          {grupo.nome} <span className="font-semibold text-indigo-500">({grupo.denuncias.length})</span>
                        </td>
                      </tr>
                    )}
                    {grupo.denuncias.map(den => (
                  <tr key={den.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/denuncias/${den.id}`} className="font-bold text-blue-600 hover:underline block">
                        #{den.id} {den.titulo}
                      </Link>
                      <span className="text-[10px] text-gray-400">Criado em: {formataData(den.criadoEm)}</span>
                    </td>
                    <td className="px-4 py-3">{den.bairro}</td>
                    <td className="px-4 py-3">{den.categoriaNome}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md font-semibold border ${getStatusColor(den.status)}`}>
                        {den.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">👍 {den.quantidadeConfirmacoes} | 🚨 {den.quantidadeUrgencias}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setDenunciaSelecionada(den)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md font-bold cursor-pointer"
                      >
                        Status
                      </button>
                      {orgAtual?.tipo === 'SECRETARIA' && (
                        <button
                          onClick={() => setTransferirDenunciaId(den.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-md font-bold cursor-pointer"
                        >
                          Transferir
                        </button>
                      )}
                      {isAdminPrefeitura && (
                        <button
                          onClick={() => { setReatribuirDenunciaId(den.id); setNovoResponsavelId(''); }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md font-bold cursor-pointer"
                        >
                          Reatribuir
                        </button>
                      )}
                    </td>
                  </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seção 2: Solicitações de Transferência (Prefeitura/Admin) */}
      {(orgAtual?.tipo === 'PREFEITURA' || usuario?.perfilGlobal === 'ADMIN_APP') && (
        <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6">
          <h3 className="text-base font-bold text-gray-950 mb-4 flex items-center gap-1.5">
            <span>🔄</span> Solicitações de Transferência de Secretarias Filhas
          </h3>

          {/* Fluxo de Decisão de Transferência */}
          {aprovarSolicitacaoId && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mb-4 space-y-3 max-w-md">
              <h4 className="text-xs font-bold text-indigo-950">Aprovar Transferência e Definir Destino</h4>
              <form onSubmit={handleEnviarAprovacao} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600">Definir Órgão de Destino Real</label>
                  <select
                    value={finalDestinoId}
                    onChange={(e) => setFinalDestinoId(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900 cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {organizacoes.map(org => (
                      <option key={org.id} value={org.id}>{org.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setAprovarSolicitacaoId(null)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded-md">Cancelar</button>
                  <button type="submit" className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md">Aprovar</button>
                </div>
              </form>
            </div>
          )}

          {recusarSolicitacaoId && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl mb-4 space-y-3 max-w-md">
              <h4 className="text-xs font-bold text-indigo-950">Recusar Transferência</h4>
              <form onSubmit={handleEnviarRecusa} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600">Motivo da Recusa</label>
                  <textarea
                    rows={2}
                    value={motivoRecusa}
                    onChange={(e) => setMotivoRecusa(e.target.value)}
                    placeholder="Justifique a recusa..."
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setRecusarSolicitacaoId(null)} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded-md">Cancelar</button>
                  <button type="submit" className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md">Recusar</button>
                </div>
              </form>
            </div>
          )}

          {transferencias.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-4 text-center">Nenhuma solicitação pendente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-gray-600">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500">
                  <tr>
                    <th className="px-4 py-3">ID / Origem</th>
                    <th className="px-4 py-3">Denúncia</th>
                    <th className="px-4 py-3">Sugerido</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ação Prefeitura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transferencias.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-950">#{t.id} de {t.organizacaoOrigemNome}</td>
                      <td className="px-4 py-3">#{t.denunciaId}</td>
                      <td className="px-4 py-3">{t.organizacaoDestinoSugeridaNome}</td>
                      <td className="px-4 py-3 text-gray-500 italic max-w-xs truncate">{t.motivo}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          t.status === 'PENDENTE' ? 'bg-yellow-50 text-yellow-800' : 
                          t.status === 'APROVADO' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {t.status === 'PENDENTE' && (
                          <>
                            <button
                              onClick={() => setAprovarSolicitacaoId(t.id)}
                              className="bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => setRecusarSolicitacaoId(t.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold cursor-pointer"
                            >
                              Recusar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Operacional;
