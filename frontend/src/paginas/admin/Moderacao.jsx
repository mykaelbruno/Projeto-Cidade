import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import cliente from '../../api/cliente';
import { useAuth } from '../../contextos/AuthContext';

const Moderacao = () => {
  const { usuario } = useAuth();

  // Estados de Controle de Ações de Moderação
  const [sinalizacaoSelecionada, setSinalizacaoSelecionada] = useState(null);
  const [motivoAcao, setMotivoAcao] = useState('');
  const [erroAcao, setErroAcao] = useState(null);

  // Estados para moderação de usuário
  const [usuarioIdModeracao, setUsuarioIdModeracao] = useState('');
  const [historicoUsuario, setHistoricoUsuario] = useState([]);
  const [exibirHistoricoId, setExibirHistoricoId] = useState(null);

  // 1. Buscar resumo de moderação
  const { data: resumoModeracaoData, refetch: recarregarResumo } = useQuery({
    queryKey: ['moderacao-resumo'],
    queryFn: async () => {
      const response = await cliente.get('/api/paineis/moderacao/resumo');
      return response.data;
    },
    enabled: !!usuario,
  });

  // 2. Listar Sinalizações Pendentes
  const { data: sinalizacoesData, isLoading: carregandoSinalizacoes, refetch: recarregarSinalizacoes } = useQuery({
    queryKey: ['sinalizacoes'],
    queryFn: async () => {
      const response = await cliente.get('/api/moderacoes/sinalizacoes-denuncia', {
        params: { status: 'PENDENTE' }
      });
      return response.data;
    },
    enabled: !!usuario,
  });
  const sinalizacoes = sinalizacoesData?.content || [];

  // 3. Carregar Usuários do Sistema para moderação (FB-18)
  const { data: usuarios = [] } = useQuery({
    queryKey: ['moderacao-usuarios'],
    queryFn: async () => {
      const response = await cliente.get('/api/usuarios');
      return response.data;
    },
    enabled: !!usuario,
  });

  // MUTAÇÃO: Analisar/Arquivar Denúncia
  const arquivarDenunciaMutacao = useMutation({
    mutationFn: async ({ id, motivo }) => {
      await cliente.post(`/api/moderacoes/denuncias/${id}/arquivamento`, { motivo });
    },
    onSuccess: () => {
      setSinalizacaoSelecionada(null);
      setMotivoAcao('');
      recarregarSinalizacoes();
      recarregarResumo();
    },
    onError: (err) => {
      setErroAcao(err.response?.data?.mensagem || 'Erro ao arquivar denúncia.');
    }
  });

  // MUTAÇÃO: Marcar Sinalização como Analisada
  const analisarSinalizacaoMutacao = useMutation({
    mutationFn: async (id) => {
      await cliente.post(`/api/moderacoes/sinalizacoes-denuncia/${id}/analise`);
    },
    onSuccess: () => {
      recarregarSinalizacoes();
      recarregarResumo();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao analisar sinalização.');
    }
  });

  // MUTAÇÃO: Advertir Usuário
  const advertirUsuarioMutacao = useMutation({
    mutationFn: async ({ id, motivo }) => {
      await cliente.post(`/api/moderacoes/usuarios/${id}/advertencia`, { motivo });
    },
    onSuccess: () => {
      alert('Advertência aplicada com sucesso!');
      setMotivoAcao('');
      setUsuarioIdModeracao('');
      recarregarResumo();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao advertir usuário.');
    }
  });

  // MUTAÇÃO: Suspender Usuário
  const suspenderUsuarioMutacao = useMutation({
    mutationFn: async ({ id, motivo }) => {
      await cliente.post(`/api/moderacoes/usuarios/${id}/suspensao`, { motivo });
    },
    onSuccess: () => {
      alert('Usuário suspenso (conta desativada) com sucesso!');
      setMotivoAcao('');
      setUsuarioIdModeracao('');
      recarregarResumo();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao suspender usuário.');
    }
  });

  // MUTAÇÃO: Reativar Usuário
  const reativarUsuarioMutacao = useMutation({
    mutationFn: async ({ id, motivo }) => {
      await cliente.post(`/api/moderacoes/usuarios/${id}/reativacao`, { motivo });
    },
    onSuccess: () => {
      alert('Usuário reativado com sucesso!');
      setMotivoAcao('');
      setUsuarioIdModeracao('');
      recarregarResumo();
    },
    onError: (err) => {
      alert(err.response?.data?.mensagem || 'Erro ao reativar usuário.');
    }
  });

  const handleArquivar = (e) => {
    e.preventDefault();
    setErroAcao(null);
    if (motivoAcao.length < 10) {
      setErroAcao('O motivo de arquivamento deve conter no mínimo 10 caracteres.');
      return;
    }
    arquivarDenunciaMutacao.mutate({
      id: sinalizacaoSelecionada.denunciaId,
      motivo: motivoAcao,
    });
  };

  const handleAplicarAdvertencia = () => {
    if (!usuarioIdModeracao || motivoAcao.length < 10) {
      alert('Preencha o ID do usuário e o motivo (mínimo 10 caracteres)');
      return;
    }
    advertirUsuarioMutacao.mutate({ id: Number(usuarioIdModeracao), motivo: motivoAcao });
  };

  const handleAplicarSuspensao = () => {
    if (!usuarioIdModeracao || motivoAcao.length < 10) {
      alert('Preencha o ID do usuário e o motivo (mínimo 10 caracteres)');
      return;
    }
    suspenderUsuarioMutacao.mutate({ id: Number(usuarioIdModeracao), motivo: motivoAcao });
  };

  const handleAplicarReativacao = () => {
    if (!usuarioIdModeracao || motivoAcao.length < 10) {
      alert('Preencha o ID do usuário e o motivo (mínimo 10 caracteres)');
      return;
    }
    reativarUsuarioMutacao.mutate({ id: Number(usuarioIdModeracao), motivo: motivoAcao });
  };

  const handleBuscarHistorico = async () => {
    if (!usuarioIdModeracao) return;
    try {
      const response = await cliente.get(`/api/moderacoes/usuarios/${usuarioIdModeracao}/historico`);
      setHistoricoUsuario(response.data.content);
      setExibirHistoricoId(usuarioIdModeracao);
    } catch {
      alert('Erro ao buscar histórico de moderação do usuário.');
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

  return (
    <div className="space-y-8 font-sans">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Painel de Moderação Geral</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Moderação global de relatos sinalizados, remoção de abusos e suspensão de contas de infratores.
        </p>
      </div>

      {/* Painel de Métricas de Moderação */}
      {resumoModeracaoData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Sinalizações Pendentes</span>
            <span className={`text-2xl font-extrabold block mt-1 ${
              resumoModeracaoData.sinalizacoesPendentes > 0 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {resumoModeracaoData.sinalizacoesPendentes}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">aguardando moderação</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Relatos Arquivados</span>
            <span className="text-2xl font-extrabold text-gray-900 block mt-1">
              {resumoModeracaoData.denunciasArquivadasModeracao}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">conteúdo ofensivo removido</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Usuários Advertidos</span>
            <span className="text-2xl font-extrabold text-yellow-600 block mt-1">
              {resumoModeracaoData.usuariosAdvertidosModeracao}
            </span>
            <span className="text-[10px] text-gray-400 font-medium font-semibold">infrações leves registradas</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Contas Suspensas</span>
            <span className="text-2xl font-extrabold text-red-600 block mt-1">
              {resumoModeracaoData.usuariosSuspensosModeracao}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">infratores bloqueados</span>
          </div>
        </div>
      )}

      {/* Grid: Sinalizações Pendentes vs Moderação de Usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sinalizações (Coluna Grande) */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-gray-950 mb-2 flex items-center gap-1.5">
            <span>🚨</span> Sinalizações Pendentes para Análise
          </h3>

          {/* Modal/Caixa de Arquivamento Rápido */}
          {sinalizacaoSelecionada && (
            <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl space-y-4 mb-4">
              <h4 className="text-sm font-bold text-purple-950">
                Arquivar Denúncia #{sinalizacaoSelecionada.denunciaId} por Moderação
              </h4>
              {erroAcao && <p className="text-xs text-red-600 font-semibold">⚠️ {erroAcao}</p>}
              
              <form onSubmit={handleArquivar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-950 mb-1">Motivo do Arquivamento (Visível para moderação)</label>
                  <textarea
                    rows={3}
                    value={motivoAcao}
                    onChange={(e) => setMotivoAcao(e.target.value)}
                    placeholder="Explique o motivo do arquivamento permanente deste conteúdo (mínimo 10 caracteres)"
                    className="w-full text-xs border border-gray-300 rounded-lg p-2 bg-white text-gray-900 focus:outline-hidden"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setSinalizacaoSelecionada(null)}
                    className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Arquivar Permanentemente
                  </button>
                </div>
              </form>
            </div>
          )}

          {carregandoSinalizacoes ? (
            <p className="text-xs text-gray-500 py-6 text-center">Buscando sinalizações...</p>
          ) : sinalizacoes.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-6 text-center">Nenhuma sinalização pendente! Cidade Limpa. 🌟</p>
          ) : (
            <div className="space-y-3">
              {sinalizacoes.map(sin => (
                <div key={sin.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs space-y-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-bold text-gray-500">
                      <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-100 uppercase">
                        {sin.motivo}
                      </span>
                      <span>Sinalizado em: {formataData(sin.criadoEm)}</span>
                      <span>Denúncia ID: #{sin.denunciaId}</span>
                    </div>

                    <p className="text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                      <strong>Feedback do denunciante:</strong> {sin.descricao}
                    </p>

                    <div className="text-[10px] text-gray-400">
                      Denunciante ID: #{sin.autorId} | Nome: {sin.autorNome}
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2 justify-end sm:justify-start min-w-[120px]">
                    <button
                      onClick={() => analisarSinalizacaoMutacao.mutate(sin.id)}
                      className="bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-2 rounded-lg text-center w-full transition-colors cursor-pointer"
                    >
                      ✔️ Descartar / Analisada
                    </button>
                    <button
                      onClick={() => setSinalizacaoSelecionada(sin)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-2 rounded-lg text-center w-full transition-colors cursor-pointer"
                    >
                      🛡️ Arquivar Relato
                    </button>
                    <Link
                      to={`/denuncias/${sin.denunciaId}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-lg text-center w-full transition-colors"
                    >
                      Ver Relato Original
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Moderação de Usuários (Coluna Pequena) */}
        <div className="bg-white border border-gray-200 shadow-xs rounded-xl p-6 space-y-4 h-fit">
          <h3 className="text-base font-bold text-gray-950 flex items-center gap-1.5">
            <span>👤</span> Moderar Contas de Usuários
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ID do Usuário Alvo</label>
              <div className="flex gap-2">
                <select
                  value={usuarioIdModeracao}
                  onChange={(e) => setUsuarioIdModeracao(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 cursor-pointer"
                >
                  <option value="">Selecione o usuário...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.username} - {u.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBuscarHistorico}
                  disabled={!usuarioIdModeracao}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 cursor-pointer shrink-0"
                >
                  Histórico
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Motivo da Moderação / Justificativa</label>
              <textarea
                rows={2}
                value={motivoAcao}
                onChange={(e) => setMotivoAcao(e.target.value)}
                placeholder="Descreva o motivo (mínimo 10 caracteres)..."
                className="w-full text-xs border border-gray-300 rounded-lg p-2 text-gray-900 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleAplicarAdvertencia}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 font-bold py-2 rounded-lg text-[10px] text-center transition-colors cursor-pointer"
              >
                ⚠️ Advertir
              </button>
              <button
                onClick={handleAplicarSuspensao}
                className="bg-red-50 hover:bg-red-100 text-red-800 font-bold py-2 rounded-lg text-[10px] text-center transition-colors cursor-pointer"
              >
                🚫 Suspender
              </button>
              <button
                onClick={handleAplicarReativacao}
                className="bg-green-50 hover:bg-green-100 text-green-800 font-bold py-2 rounded-lg text-[10px] text-center transition-colors cursor-pointer"
              >
                ✔️ Reativar
              </button>
            </div>

          </div>

          {/* Histórico do Usuário */}
          {exibirHistoricoId && (
            <div className="pt-4 border-t border-gray-150 space-y-3">
              <h4 className="text-xs font-bold text-gray-800">
                Histórico do Usuário #{exibirHistoricoId}:
              </h4>

              {historicoUsuario.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic">Nenhum evento registrado no histórico.</p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {historicoUsuario.map(h => (
                    <div key={h.id} className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-[10px] space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-red-700 uppercase">{h.tipoAcao}</span>
                        <span className="text-gray-400">{formataData(h.criadoEm)}</span>
                      </div>
                      <p className="text-gray-600 italic">"{h.motivo}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Moderacao;
