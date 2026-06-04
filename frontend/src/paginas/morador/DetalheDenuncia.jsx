import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import cliente from '../../api/cliente';
import { useAuth } from '../../contextos/AuthContext';
import ImagemDenuncia from '../../componentes/ImagemDenuncia';

const DetalheDenuncia = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // MUTAÇÃO: Excluir/Arquivar Denúncia
  const excluirDenunciaMutacao = useMutation({
    mutationFn: async () => {
      await cliente.delete(`/api/denuncias/${id}`);
    },
    onSuccess: () => {
      alert('Sua denúncia foi excluída com sucesso.');
      navigate('/');
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao excluir denúncia.');
    }
  });

  const [novoComentario, setNovoComentario] = useState('');
  
  // Estados para fluxo de conclusão
  const [feedbackConclusao, setFeedbackConclusao] = useState('');
  const [erroFeedback, setErroFeedback] = useState(null);
  
  // Estado para fluxo de denúncia de abuso (sinalização)
  const [motivoSinalizacao, setMotivoSinalizacao] = useState('');
  const [descSinalizacao, setDescSinalizacao] = useState('');
  const [sinalizando, setSinalizando] = useState(false);
  const [sucessoSinalizacao, setSucessoSinalizacao] = useState(false);

  // Estado da Resposta Oficial
  const [orgIdResposta, setOrgIdResposta] = useState(localStorage.getItem('cidadeAtiva_organizacaoIdAtiva') || '');

  // Estados para o Painel de Gestão da Denúncia (Operadores)
  const [mostrarPainelStatus, setMostrarPainelStatus] = useState(false);
  const [mostrarPainelTransferir, setMostrarPainelTransferir] = useState(false);
  const [mostrarPainelReatribuir, setMostrarPainelReatribuir] = useState(false);
  const [gestaoNovoStatus, setGestaoNovoStatus] = useState('');
  const [gestaoMotivoStatus, setGestaoMotivoStatus] = useState('');
  const [gestaoSugeridoDestinoId, setGestaoSugeridoDestinoId] = useState('');
  const [gestaoMotivoTransferencia, setGestaoMotivoTransferencia] = useState('');
  const [gestaoNovoResponsavelId, setGestaoNovoResponsavelId] = useState('');

  // Estados para remoção de comentário (moderação)
  const [comentarioIdSobModificacao, setComentarioIdSobModificacao] = useState(null);
  const [motivoRemocao, setMotivoRemocao] = useState('');

  // Query: Status das Interações (apoiado / urgente) do Morador logado
  const { data: statusInteracao, refetch: refetchStatusInteracao } = useQuery({
    queryKey: ['statusInteracao', id],
    queryFn: async () => {
      const response = await cliente.get(`/api/denuncias/${id}/interacoes/status`);
      return response.data;
    },
    enabled: !!usuario && usuario.perfilGlobal === 'MORADOR',
  });

  // Query: Vínculos/Organizações do operador logado
  const { data: organizacoesParaOficial = [] } = useQuery({
    queryKey: ['organizacoesParaOficial', usuario?.perfilGlobal],
    queryFn: async () => {
      if (usuario?.perfilGlobal === 'ADMIN_APP') {
        const response = await cliente.get('/api/organizacoes');
        return response.data;
      } else if (usuario?.perfilGlobal === 'ADMIN_PREFEITURA') {
        const response = await cliente.get('/api/organizacoes');
        return response.data.filter(org => org.cidade?.toLowerCase() === usuario.cidade?.toLowerCase() && org.ativo !== false);
      } else {
        const response = await cliente.get('/api/vinculos/me');
        return response.data.map(v => ({ id: v.organizacaoId, nome: v.nomeOrganizacao }));
      }
    },
    enabled: !!usuario && (
      usuario.perfilGlobal === 'ADMIN_PREFEITURA' ||
      usuario.perfilGlobal === 'ADMIN_SECRETARIA' ||
      usuario.perfilGlobal === 'ATENDENTE_SECRETARIA' ||
      usuario.perfilGlobal === 'ADMIN_APP'
    ),
  });

  useEffect(() => {
    if (organizacoesParaOficial.length > 0 && !orgIdResposta) {
      const timer = setTimeout(() => {
        setOrgIdResposta(organizacoesParaOficial[0].id.toString());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [organizacoesParaOficial, orgIdResposta]);

  // Mutação para Confirmar Relevância / Apoiar
  const apoiarMutacao = useMutation({
    mutationFn: async (apoiado) => {
      if (apoiado) {
        await cliente.delete(`/api/denuncias/${id}/confirmacoes`);
      } else {
        await cliente.post(`/api/denuncias/${id}/confirmacoes`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      if (refetchStatusInteracao) refetchStatusInteracao();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao processar apoio.');
    }
  });

  // Mutação para Marcar Urgência
  const urgenteMutacao = useMutation({
    mutationFn: async (urgente) => {
      if (urgente) {
        await cliente.delete(`/api/denuncias/${id}/urgencias`);
      } else {
        await cliente.post(`/api/denuncias/${id}/urgencias`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      if (refetchStatusInteracao) refetchStatusInteracao();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao marcar urgência.');
    }
  });

  // 1. Detalhar Denúncia
  const { data: denuncia, isLoading, isError } = useQuery({
    queryKey: ['denuncia', id],
    queryFn: async () => {
      const response = await cliente.get(`/api/denuncias/${id}`);
      return response.data;
    },
  });

  // 2. Carregar Anexos/Imagens
  const { data: anexosData } = useQuery({
    queryKey: ['anexos', id],
    queryFn: async () => {
      const response = await cliente.get(`/api/denuncias/${id}/anexos`);
      return response.data; // Page
    },
  });
  const anexos = anexosData?.content || [];

  // 3. Carregar Comentários
  const { data: comentariosData } = useQuery({
    queryKey: ['comentarios', id],
    queryFn: async () => {
      const response = await cliente.get(`/api/denuncias/${id}/comentarios`);
      return response.data;
    },
  });
  const comentarios = comentariosData?.content || [];

  // 4. Carregar Timeline
  const { data: timelineData } = useQuery({
    queryKey: ['timeline', id],
    queryFn: async () => {
      const response = await cliente.get(`/api/denuncias/${id}/timeline`);
      return response.data;
    },
  });
  const timeline = timelineData?.content || [];

  // MUTAÇÃO: Comentar
  const comentarMutacao = useMutation({
    mutationFn: async (conteudo) => {
      await cliente.post(`/api/denuncias/${id}/comentarios`, { conteudo });
    },
    onSuccess: () => {
      setNovoComentario('');
      queryClient.invalidateQueries({ queryKey: ['comentarios', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
    },
  });

  // MUTAÇÃO: Confirmar Resolução
  const confirmarConclusaoMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post(`/api/denuncias/${id}/conclusao/confirmacao`, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
    },
  });

  // MUTAÇÃO: Contestar Resolução
  const contestarConclusaoMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post(`/api/denuncias/${id}/conclusao/contestacao`, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
    },
  });

  // MUTAÇÃO: Sinalizar Abuso
  const sinalizarMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post(`/api/denuncias/${id}/sinalizacoes`, dados);
    },
    onSuccess: () => {
      setSucessoSinalizacao(true);
      setMotivoSinalizacao('');
      setDescSinalizacao('');
      setTimeout(() => {
        setSinalizando(false);
        setSucessoSinalizacao(false);
      }, 3000);
    },
  });

  // MUTAÇÃO: Resposta Oficial (Agente Institucional)
  const responderOficialmenteMutacao = useMutation({
    mutationFn: async ({ organizacaoId, conteudo }) => {
      await cliente.post(`/api/denuncias/${id}/respostas-oficiais`, { organizacaoId, conteudo });
    },
    onSuccess: () => {
      setNovoComentario('');
      queryClient.invalidateQueries({ queryKey: ['comentarios', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      alert('Resposta oficial publicada com sucesso!');
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao publicar resposta oficial. Verifique se seu vínculo com esta organização está ativo.');
    }
  });

  // Query: Todas as Organizações do Sistema (para operadores reatribuírem/transferirem)
  const { data: todasOrganizacoes = [] } = useQuery({
    queryKey: ['todasOrganizacoes'],
    queryFn: async () => {
      const response = await cliente.get('/api/organizacoes');
      return response.data;
    },
    enabled: !!usuario && (
      usuario.perfilGlobal === 'ADMIN_PREFEITURA' ||
      usuario.perfilGlobal === 'ADMIN_SECRETARIA' ||
      usuario.perfilGlobal === 'ATENDENTE_SECRETARIA' ||
      usuario.perfilGlobal === 'ADMIN_APP'
    ),
  });

  const isOperador = usuario && (
    usuario.perfilGlobal === 'ADMIN_PREFEITURA' ||
    usuario.perfilGlobal === 'ADMIN_SECRETARIA' ||
    usuario.perfilGlobal === 'ATENDENTE_SECRETARIA' ||
    usuario.perfilGlobal === 'ADMIN_APP'
  );

  const podeGerenciarOperacional = isOperador && denuncia && (
    usuario.perfilGlobal === 'ADMIN_APP' ||
    (usuario.perfilGlobal === 'ADMIN_PREFEITURA' && denuncia.cidade?.toLowerCase() === usuario.cidade?.toLowerCase()) ||
    (denuncia.organizacaoResponsavelId && organizacoesParaOficial.some(org => org.id === denuncia.organizacaoResponsavelId))
  );

  // MUTAÇÃO: Atualizar Status pelo Painel de Gestão
  const statusMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.patch(`/api/denuncias/${id}/status`, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      queryClient.invalidateQueries({ queryKey: ['comentarios', id] });
      alert('Status atualizado com sucesso!');
      setMostrarPainelStatus(false);
      setGestaoNovoStatus('');
      setGestaoMotivoStatus('');
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao atualizar status.');
    }
  });

  // MUTAÇÃO: Solicitar Transferência pelo Painel de Gestão
  const solicitarTransferenciaMutacao = useMutation({
    mutationFn: async (dados) => {
      await cliente.post(`/api/operacional/denuncias/${id}/solicitacoes-transferencia`, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      alert('Solicitação de transferência enviada com sucesso!');
      setMostrarPainelTransferir(false);
      setGestaoSugeridoDestinoId('');
      setGestaoMotivoTransferencia('');
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Falha ao solicitar transferência.');
    }
  });

  // MUTAÇÃO: Reatribuir Responsável pelo Painel de Gestão (Prefeitura / ADMIN_APP)
  const reatribuirResponsavelMutacao = useMutation({
    mutationFn: async ({ organizacaoId }) => {
      await cliente.patch(`/api/operacional/denuncias/${id}/responsavel`, { organizacaoId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['denuncia', id] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      alert('Responsável alterado com sucesso!');
      setMostrarPainelReatribuir(false);
      setGestaoNovoResponsavelId('');
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Falha ao reatribuir responsável.');
    }
  });

  const handleComentar = (e) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;
    comentarMutacao.mutate(novoComentario);
  };

  const handleResponderOficialmente = (e) => {
    e.preventDefault();
    if (!orgIdResposta || !novoComentario.trim()) return;
    responderOficialmenteMutacao.mutate({
      organizacaoId: Number(orgIdResposta),
      conteudo: novoComentario
    });
  };

  // MUTAÇÃO: Remover comentário por moderação
  const removerComentarioMutacao = useMutation({
    mutationFn: async ({ comentarioId, motivo }) => {
      await cliente.post(`/api/moderacoes/comentarios/${comentarioId}/remocao`, { motivo });
    },
    onSuccess: () => {
      setComentarioIdSobModificacao(null);
      setMotivoRemocao('');
      queryClient.invalidateQueries({ queryKey: ['comentarios', id] });
      alert('Comentário removido por moderação com sucesso!');
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao remover comentário.');
    }
  });

  const handleAbrirModalRemocao = (comentarioId) => {
    setComentarioIdSobModificacao(comentarioId);
    setMotivoRemocao('');
  };

  const handleCancelarRemocao = () => {
    setComentarioIdSobModificacao(null);
    setMotivoRemocao('');
  };

  const handleConfirmarRemocao = (e, comentarioId) => {
    e.preventDefault();
    if (motivoRemocao.length < 10) {
      alert('O motivo deve conter no mínimo 10 caracteres.');
      return;
    }
    removerComentarioMutacao.mutate({ comentarioId, motivo: motivoRemocao });
  };

  const handleConfirmarConclusao = () => {
    setErroFeedback(null);
    if (feedbackConclusao.length < 10) {
      setErroFeedback('A justificativa de conclusão deve ter no mínimo 10 caracteres.');
      return;
    }
    confirmarConclusaoMutacao.mutate({ feedback: feedbackConclusao });
    setFeedbackConclusao('');
  };

  const handleContestarConclusao = () => {
    setErroFeedback(null);
    if (feedbackConclusao.length < 10) {
      setErroFeedback('A justificativa de contestação deve ter no mínimo 10 caracteres.');
      return;
    }
    contestarConclusaoMutacao.mutate({ feedback: feedbackConclusao });
    setFeedbackConclusao('');
  };

  const handleSinalizar = (e) => {
    e.preventDefault();
    if (!motivoSinalizacao || descSinalizacao.length < 10) {
      setErroFeedback('Preencha o motivo e dê uma descrição detalhada de no mínimo 10 caracteres.');
      return;
    }
    sinalizarMutacao.mutate({
      motivo: motivoSinalizacao,
      descricao: descSinalizacao,
    });
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

  const formatStatus = (statusStr) => {
    switch (statusStr) {
      case 'ABERTO': return 'Aberto';
      case 'EM_ANALISE': return 'Em Análise';
      case 'ENCAMINHADO': return 'Encaminhado';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'PROGRAMADO': return 'Programado';
      case 'CONCLUIDO': return 'Concluído';
      case 'REABERTO': return 'Reaberto';
      case 'ARQUIVADO': return 'Arquivado';
      default: return statusStr ? statusStr.replace('_', ' ') : '';
    }
  };

  const parseComentarioStatus = (conteudo) => {
    if (!conteudo) return { isStatusUpdate: false };
    const regex = /Alteracao de status para ([A-Z_a-z\s]+)(?:\.\s*Justificativa:\s*(.*))?/;
    const match = conteudo.match(regex);
    if (match) {
      const statusBruto = match[1].trim().replace(/\s/g, '_').toUpperCase();
      const justificativa = match[2] ? match[2].trim() : '';
      return {
        isStatusUpdate: true,
        status: statusBruto,
        justificativa
      };
    }
    return { isStatusUpdate: false };
  };

  const formataData = (dataStr) => {
    if (!dataStr) return '';
    return new Date(dataStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-500 font-semibold">Carregando detalhes do relato...</p>
      </div>
    );
  }

  if (isError || !denuncia) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-200 max-w-lg mx-auto">
        <p className="text-red-500 font-bold text-lg">⚠️ Relato não encontrado</p>
        <p className="text-sm text-gray-500 mt-1">Este relato pode ter sido removido por moderação ou arquivado.</p>
        <Link to="/" className="mt-4 inline-block bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Voltar ao Feed</Link>
      </div>
    );
  }

  const eAutor = usuario && denuncia.autorId === usuario.id;
  const podeExcluir = (eAutor && (denuncia.status === 'ABERTO' || denuncia.status === 'REABERTO')) || (usuario?.perfilGlobal === 'ADMIN_APP');

  // Verificar se o usuário logado é o autor para confirmar/contestar resolução
  // Como o autor id é ocultado no DTO se for anônimo (retorna null), o backend faz a validação por trás.
  // No front, mostraremos a caixa de feedback se status for CONCLUIDO e perfilGlobal for MORADOR.
  const mostrarResolucaoMorador = denuncia.status === 'CONCLUIDO' && usuario?.perfilGlobal === 'MORADOR';

  const mostrarFormOficial = usuario && (
    usuario.perfilGlobal === 'ADMIN_PREFEITURA' || 
    usuario.perfilGlobal === 'ADMIN_SECRETARIA' || 
    usuario.perfilGlobal === 'ATENDENTE_SECRETARIA' ||
    usuario.perfilGlobal === 'ADMIN_APP'
  );

  const esModerador = usuario && (
    usuario.perfilGlobal === 'MODERADOR' || 
    usuario.perfilGlobal === 'ADMIN_APP'
  );

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      
      {/* Voltar, Denunciar Abuso e Excluir */}
      <div className="flex justify-between items-center">
        <Link to="/" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
          &larr; Voltar para o Feed geral
        </Link>
        <div className="flex gap-2">
          {podeExcluir && (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza absoluta que deseja excluir/arquivar esta denúncia? Esta ação mudará o status para arquivada e ela sairá do feed público.')) {
                  excluirDenunciaMutacao.mutate();
                }
              }}
              disabled={excluirDenunciaMutacao.isPending}
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg cursor-pointer shadow-xs disabled:opacity-60 transition-colors"
            >
              {excluirDenunciaMutacao.isPending ? 'Excluindo...' : '🗑️ Excluir Denúncia'}
            </button>
          )}
          {!eAutor && (
            <button
              onClick={() => setSinalizando(!sinalizando)}
              className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              🚨 Reportar Abuso
            </button>
          )}
        </div>
      </div>

      {/* Banner de Arquivamento */}
      {denuncia.status === 'ARQUIVADO' && (() => {
        const eventoArquivado = timeline.find(e => 
          e.descricao?.toUpperCase().includes('ARQUIVADO') || 
          e.descricao?.toUpperCase().includes('ARQUIVADA') || 
          e.descricao?.toUpperCase().includes('EXCLUIDA') || 
          e.descricao?.toUpperCase().includes('EXCLUÍDA')
        );
        return (
          <div className="bg-purple-50 border border-purple-200 text-purple-950 p-5 rounded-xl space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-1.5 text-purple-900">
              <span>🗄️</span> Esta denúncia está arquivada
            </h4>
            <p className="text-xs leading-relaxed">
              {eventoArquivado 
                ? `Justificativa registrada no histórico: "${eventoArquivado.descricao}"` 
                : "Esta denúncia foi removida da discussão pública e arquivada pelo autor ou pela administração municipal."}
            </p>
          </div>
        );
      })()}

      {/* Painel de Gestão da Denúncia (Operadores Autorizados) */}
      {podeGerenciarOperacional && (
        <div className="bg-slate-100 border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛠️</span> Painel de Gestão da Denúncia
            </h4>
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase">
              Operador Jurisdicional
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setMostrarPainelStatus(!mostrarPainelStatus);
                setMostrarPainelTransferir(false);
                setMostrarPainelReatribuir(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                mostrarPainelStatus
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              🔄 Atualizar Status
            </button>

            {usuario?.perfilGlobal !== 'ADMIN_PREFEITURA' && usuario?.perfilGlobal !== 'ADMIN_APP' && (
              <button
                onClick={() => {
                  setMostrarPainelTransferir(!mostrarPainelTransferir);
                  setMostrarPainelStatus(false);
                  setMostrarPainelReatribuir(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  mostrarPainelTransferir
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                ➡️ Solicitar Transferência
              </button>
            )}

            {(usuario?.perfilGlobal === 'ADMIN_PREFEITURA' || usuario?.perfilGlobal === 'ADMIN_APP') && (
              <button
                onClick={() => {
                  setMostrarPainelReatribuir(!mostrarPainelReatribuir);
                  setMostrarPainelStatus(false);
                  setMostrarPainelTransferir(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  mostrarPainelReatribuir
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                🔁 Reatribuir Responsável
              </button>
            )}
          </div>

          {/* Sub-painel: Atualizar Status */}
          {mostrarPainelStatus && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!gestaoNovoStatus) return;
                statusMutacao.mutate({
                  status: gestaoNovoStatus,
                  organizacaoId: denuncia.organizacaoResponsavelId || orgIdResposta,
                  motivo: gestaoMotivoStatus,
                });
              }}
              className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5 text-xs max-w-lg"
            >
              <h5 className="font-bold text-slate-800">Atualizar Status do Relato</h5>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Novo Status</label>
                <select
                  value={gestaoNovoStatus}
                  onChange={(e) => setGestaoNovoStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 font-semibold focus:outline-hidden cursor-pointer"
                  required
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
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Motivo / Ação (Opcional - Gerará Resposta Oficial Automática)</label>
                <textarea
                  rows={2}
                  value={gestaoMotivoStatus}
                  onChange={(e) => setGestaoMotivoStatus(e.target.value)}
                  placeholder="Justifique a mudança de status..."
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarPainelStatus(false)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={statusMutacao.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  {statusMutacao.isPending ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          )}

          {/* Sub-painel: Solicitar Transferência */}
          {mostrarPainelTransferir && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!gestaoSugeridoDestinoId || !gestaoMotivoTransferencia.trim()) return;
                solicitarTransferenciaMutacao.mutate({
                  organizacaoDestinoSugeridaId: Number(gestaoSugeridoDestinoId),
                  motivo: gestaoMotivoTransferencia,
                });
              }}
              className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5 text-xs max-w-lg"
            >
              <h5 className="font-bold text-slate-800">Solicitar Transferência de Responsabilidade</h5>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Órgão de Destino Sugerido</label>
                <select
                  value={gestaoSugeridoDestinoId}
                  onChange={(e) => setGestaoSugeridoDestinoId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 cursor-pointer focus:outline-hidden"
                  required
                >
                  <option value="">Selecione...</option>
                  {todasOrganizacoes
                    .filter(o => o.cidade === denuncia.cidade && o.id !== denuncia.organizacaoResponsavelId && o.ativo !== false)
                    .map(org => (
                      <option key={org.id} value={org.id}>{org.nome} ({org.tipo})</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Motivo da Transferência</label>
                <textarea
                  rows={2}
                  value={gestaoMotivoTransferencia}
                  onChange={(e) => setGestaoMotivoTransferencia(e.target.value)}
                  placeholder="Justifique o motivo pelo qual este problema não é de competência de sua secretaria..."
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarPainelTransferir(false)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={solicitarTransferenciaMutacao.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  {solicitarTransferenciaMutacao.isPending ? 'Enviando...' : 'Solicitar Transferência'}
                </button>
              </div>
            </form>
          )}

          {/* Sub-painel: Reatribuir Responsável */}
          {mostrarPainelReatribuir && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!gestaoNovoResponsavelId) return;
                reatribuirResponsavelMutacao.mutate({
                  organizacaoId: Number(gestaoNovoResponsavelId),
                });
              }}
              className="bg-white border border-slate-200 rounded-lg p-4 space-y-3.5 text-xs max-w-lg"
            >
              <h5 className="font-bold text-slate-800">Reatribuir Órgão Responsável Direto</h5>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-1">Novo Órgão Responsável</label>
                <select
                  value={gestaoNovoResponsavelId}
                  onChange={(e) => setGestaoNovoResponsavelId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 bg-white text-gray-900 cursor-pointer focus:outline-hidden"
                  required
                >
                  <option value="">Selecione...</option>
                  {todasOrganizacoes
                    .filter(o => o.cidade === denuncia.cidade && o.ativo !== false)
                    .map(org => (
                      <option key={org.id} value={org.id}>{org.nome} ({org.tipo})</option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarPainelReatribuir(false)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reatribuirResponsavelMutacao.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-bold cursor-pointer"
                >
                  {reatribuirResponsavelMutacao.isPending ? 'Confirmando...' : 'Reatribuir'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Box de Sinalização */}
      {sinalizando && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-red-900">Sinalizar Conteúdo Inadequado</h4>
          {sucessoSinalizacao ? (
            <p className="text-sm font-semibold text-green-700">🎉 Sinalização registrada com sucesso! A moderação analisará este relato.</p>
          ) : (
            <form onSubmit={handleSinalizar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700">Motivo</label>
                <select
                  value={motivoSinalizacao}
                  onChange={(e) => setMotivoSinalizacao(e.target.value)}
                  className="mt-1 block w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                >
                  <option value="">Selecione um motivo...</option>
                  <option value="SPAM">Spam / Denúncia Repetida</option>
                  <option value="OFENSIVO">Linguagem Ofensiva / Ataque Pessoal</option>
                  <option value="FALSO">Informações Falsas / Trote</option>
                  <option value="CONTEUDO_IMPROPRIO">Imagens ou Conteúdo Impróprio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700">Explicação Adicional</label>
                <textarea
                  rows={2}
                  value={descSinalizacao}
                  onChange={(e) => setDescSinalizacao(e.target.value)}
                  placeholder="Explique resumidamente por que este conteúdo é inadequado (mínimo 10 caracteres)"
                  className="mt-1 block w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSinalizando(false)}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Conteúdo da Denúncia */}
      <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 md:p-8 space-y-6">
        
        {/* Cabeçalho */}
        <div className="border-b border-gray-100 pb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold border border-blue-100">
              {denuncia.categoriaNome}
            </span>
            <span className={`px-2.5 py-1 rounded-md font-bold border ${getStatusColor(denuncia.status)}`}>
              Status: {formatStatus(denuncia.status)}
            </span>
            {denuncia.anonima && (
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-semibold">
                🤐 Relato Anônimo
              </span>
            )}
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {denuncia.titulo}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pt-1">
            <span>👤 Relatado por: <strong>{denuncia.autorNomeExibido}</strong></span>
            <span>🗓️ Em: {formataData(denuncia.criadoEm)}</span>
            {denuncia.organizacaoResponsavelNome && (
              <span>🏢 Órgão Responsável: <strong>{denuncia.organizacaoResponsavelNome}</strong></span>
            )}
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Descrição do Problema</h4>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
            {denuncia.descricao}
          </p>
        </div>

        {/* Barra de Interações e Estatísticas */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-150">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              👍 <strong>{denuncia.quantidadeConfirmacoes}</strong> apoios
            </span>
            <span className="flex items-center gap-1">
              🚨 <strong>{denuncia.quantidadeUrgencias}</strong> marcaram urgente
            </span>
            <span className="flex items-center gap-1">
              💬 <strong>{denuncia.quantidadeComentarios}</strong> comentários
            </span>
          </div>

          {/* Botões de Ação (Apenas para outros Moradores, oculto se for o próprio autor) */}
          {usuario?.perfilGlobal === 'MORADOR' && usuario?.id !== denuncia.autorId && (
            <div className="flex gap-2">
              <button
                onClick={() => apoiarMutacao.mutate(!!statusInteracao?.confirmadaPeloUsuario)}
                disabled={apoiarMutacao.isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  statusInteracao?.confirmadaPeloUsuario
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                {statusInteracao?.confirmadaPeloUsuario ? '👍 Apoiado' : '👍 Apoiar'}
              </button>

              <button
                onClick={() => urgenteMutacao.mutate(!!statusInteracao?.marcadaUrgentePeloUsuario)}
                disabled={urgenteMutacao.isPending}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                  statusInteracao?.marcadaUrgentePeloUsuario
                    ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                    : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                }`}
              >
                {statusInteracao?.marcadaUrgentePeloUsuario ? '🚨 Urgente' : '🚨 Urgente'}
              </button>
            </div>
          )}
        </div>

        {/* Galeria de Anexos */}
        {anexos.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Evolução e Evidências Visuais</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {anexos.map(anexo => (
                <div key={anexo.id} className="relative group overflow-hidden rounded-lg aspect-square">
                  <ImagemDenuncia 
                    url={anexo.urlDownload} 
                    alt={anexo.nomeOriginal}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity text-center truncate">
                    {anexo.nomeOriginal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Localização e Mapa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Localização do Problema</h4>
            <div className="text-xs text-gray-600 space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p>📍 <strong>Cidade:</strong> {denuncia.cidade}</p>
              <p>📍 <strong>Bairro:</strong> {denuncia.bairro}</p>
              {denuncia.rua && <p>📍 <strong>Rua:</strong> {denuncia.rua}</p>}
              {denuncia.pontoReferencia && <p>🔍 <strong>Referência:</strong> {denuncia.pontoReferencia}</p>}
            </div>
          </div>

          {/* Leaflet Map */}
          {denuncia.latitude && denuncia.longitude && (
            <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-200 z-0">
              <MapContainer center={[denuncia.latitude, denuncia.longitude]} zoom={15} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[denuncia.latitude, denuncia.longitude]} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Fluxo de Validação de Conclusão para Morador */}
        {mostrarResolucaoMorador && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl space-y-4">
            <h4 className="text-sm font-bold text-green-950 flex items-center gap-1.5">
              <span>🎉</span> A Prefeitura/Secretaria concluiu este problema!
            </h4>
            <p className="text-xs text-green-800">
              Como autor do relato, você deve avaliar o resultado. Se o problema foi resolvido, confirme a conclusão. Se ainda persistir, conteste para reabrir o relato.
            </p>
            
            {erroFeedback && (
              <p className="text-xs text-red-600 font-semibold">⚠️ {erroFeedback}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-green-950 mb-1">
                Justificativa / Feedback de Avaliação (mínimo 10 caracteres)
              </label>
              <textarea
                rows={2}
                value={feedbackConclusao}
                onChange={(e) => setFeedbackConclusao(e.target.value)}
                placeholder="Explique o motivo de sua confirmação ou contestação da resolução."
                className="w-full text-xs border border-green-200 rounded-lg p-2.5 bg-white text-gray-900 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleContestarConclusao}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-xs"
              >
                ❌ Contestar e Reabrir
              </button>
              <button
                onClick={handleConfirmarConclusao}
                className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer shadow-xs"
              >
                ✔️ Confirmar Resolução
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Grid Lateral: Timeline vs Comentários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Timeline Histórica */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 md:p-6 md:col-span-1 space-y-4">
          <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>⏳</span> Histórico de Status
          </h4>
          
          <div className="flow-root">
            <ul className="-mb-8">
              {timeline.map((evento, index) => (
                <li key={evento.id}>
                  <div className="relative pb-8">
                    {index !== timeline.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white text-xs ${
                          evento.destaque ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          🔔
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="text-xs font-semibold text-gray-900 leading-tight">
                          {evento.descricao}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {formataData(evento.criadoEm)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Seção de Comentários / Discussão */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-5 md:p-6 md:col-span-2 space-y-4 flex flex-col justify-between">
          
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <span>💬</span> Espaço de Discussão ({comentarios.length})
            </h4>

            {/* Listagem */}
            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
              {comentarios.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center py-6">Nenhum comentário registrado ainda.</p>
              ) : (
                comentarios.map(c => (
                  <div 
                    key={c.id} 
                    className={`p-3.5 rounded-xl border ${
                      c.oficial 
                        ? 'bg-indigo-50 border-indigo-150 text-indigo-950' 
                        : 'bg-gray-50 border-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 mb-1.5">
                      <span className={c.oficial ? 'text-indigo-700 font-extrabold' : ''}>
                        {c.oficial ? `🏢 Resposta Oficial — ${c.organizacaoNome}` : `👤 ${c.autorNome}`}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span>{formataData(c.criadoEm)}</span>
                        {esModerador && (
                          <button
                            type="button"
                            onClick={() => handleAbrirModalRemocao(c.id)}
                            className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-1.5 transition-colors"
                            title="Remover comentário por moderação"
                          >
                            🗑️ Remover
                          </button>
                        )}
                      </div>
                    </div>
                    {comentarioIdSobModificacao === c.id ? (
                      <form onSubmit={(e) => handleConfirmarRemocao(e, c.id)} className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg space-y-2 text-xs">
                        <label className="block font-bold text-red-900">Motivo da Remoção (mínimo 10 caracteres):</label>
                        <input
                          type="text"
                          value={motivoRemocao}
                          onChange={(e) => setMotivoRemocao(e.target.value)}
                          placeholder="Justificativa da exclusão..."
                          className="w-full border border-gray-300 rounded-md p-1.5 bg-white text-gray-900 focus:outline-hidden"
                          required
                        />
                        <div className="flex justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={handleCancelarRemocao}
                            className="bg-white border border-gray-300 text-gray-700 px-2 py-0.5 rounded-md font-semibold text-[10px] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={removerComentarioMutacao.isPending || motivoRemocao.length < 10}
                            className="bg-red-600 text-white px-2 py-0.5 rounded-md font-semibold text-[10px] cursor-pointer disabled:bg-red-400"
                          >
                            {removerComentarioMutacao.isPending ? 'Excluindo...' : 'Confirmar'}
                          </button>
                        </div>
                      </form>
                    ) : (() => {
                      const parsed = parseComentarioStatus(c.conteudo);
                      if (parsed.isStatusUpdate) {
                        const coresStatus = {
                          ABERTO: 'border-l-4 border-gray-400 bg-gray-50/70',
                          EM_ANALISE: 'border-l-4 border-yellow-500 bg-yellow-50/40 text-yellow-950',
                          ENCAMINHADO: 'border-l-4 border-blue-500 bg-blue-50/40 text-blue-950',
                          EM_ANDAMENTO: 'border-l-4 border-orange-500 bg-orange-50/40 text-orange-950',
                          PROGRAMADO: 'border-l-4 border-indigo-500 bg-indigo-50/40 text-indigo-950',
                          CONCLUIDO: 'border-l-4 border-green-500 bg-green-50/40 text-green-950',
                          REABERTO: 'border-l-4 border-red-500 bg-red-50/40 text-red-950',
                          ARQUIVADO: 'border-l-4 border-purple-500 bg-purple-50/40 text-purple-950',
                        };
                        const iconesStatus = {
                          ABERTO: '📝',
                          EM_ANALISE: '🔍',
                          ENCAMINHADO: '➡️',
                          EM_ANDAMENTO: '🏗️',
                          PROGRAMADO: '📅',
                          CONCLUIDO: '🏁',
                          REABERTO: '🔄',
                          ARQUIVADO: '🗄️',
                        };
                        
                        const classeCor = coresStatus[parsed.status] || 'border-l-4 border-gray-400 bg-gray-50/50';
                        const icone = iconesStatus[parsed.status] || '🔄';
                        
                        return (
                          <div className={`p-3 rounded-lg ${classeCor} space-y-1.5 mt-1 border border-gray-200/50`}>
                            <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5 uppercase tracking-wide">
                              <span>{icone}</span> Status atualizado para: <span className="underline decoration-2">{formatStatus(parsed.status)}</span>
                            </p>
                            {parsed.justificativa && (
                              <p className="text-xs text-gray-700 italic leading-relaxed pl-1.5 border-l border-gray-300">
                                "{parsed.justificativa}"
                              </p>
                            )}
                          </div>
                        );
                      }
                      return <p className="text-xs leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>;
                    })()}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Adicionar Comentário (Apenas Morador) */}
          {usuario?.perfilGlobal === 'MORADOR' && (
            <form onSubmit={handleComentar} className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Escreva um comentário</label>
                <textarea
                  rows={2}
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Escreva uma mensagem construtiva sobre o problema..."
                  className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={comentarMutacao.isPending || !novoComentario.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs disabled:bg-blue-400 cursor-pointer shadow-xs"
                >
                  {comentarMutacao.isPending ? 'Enviando...' : 'Comentar'}
                </button>
              </div>
            </form>
          )}

          {/* Adicionar Resposta Oficial (Apenas Agentes Institucionais) */}
          {mostrarFormOficial && (
            <form onSubmit={handleResponderOficialmente} className="border-t border-gray-100 pt-4 space-y-3">
              {(() => {
                const isPrefeituraOuApp = usuario && (usuario.perfilGlobal === 'ADMIN_PREFEITURA' || usuario.perfilGlobal === 'ADMIN_APP');
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {isPrefeituraOuApp && (
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Órgão Publicador</label>
                        <select
                          value={orgIdResposta}
                          onChange={(e) => setOrgIdResposta(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:outline-hidden font-semibold cursor-pointer"
                          required
                        >
                          {organizacoesParaOficial.length === 0 && (
                            <option value="">Nenhum órgão ativo</option>
                          )}
                          {organizacoesParaOficial.map(org => (
                            <option key={org.id} value={org.id}>{org.nome}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className={isPrefeituraOuApp ? "sm:col-span-3" : "sm:col-span-4"}>
                      <label className="block text-xs font-semibold text-indigo-700 mb-1">
                        Escrever Resposta Oficial {isPrefeituraOuApp ? "(Como Órgão)" : `(Como ${organizacoesParaOficial[0]?.nome || 'Órgão'})`}
                      </label>
                      <textarea
                        rows={2}
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Justifique as ações do órgão responsável de forma clara e respeitosa..."
                        className="w-full text-xs border border-gray-300 rounded-lg p-2.5 text-gray-900 focus:outline-hidden"
                        required
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={responderOficialmenteMutacao.isPending || !novoComentario.trim() || !orgIdResposta}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs disabled:bg-indigo-400 cursor-pointer shadow-xs"
                >
                  {responderOficialmenteMutacao.isPending ? 'Enviando Resposta...' : 'Enviar Resposta Oficial'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};

export default DetalheDenuncia;
