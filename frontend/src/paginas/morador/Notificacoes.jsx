import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cliente from '../../api/cliente';

const Notificacoes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [somenteNaoLidas, setSomenteNaoLidas] = useState(false);
  const [pagina, setPagina] = useState(0);

  // 1. Carregar Notificações
  const { data: notificacoesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['notificacoes', somenteNaoLidas, pagina],
    queryFn: async () => {
      const response = await cliente.get('/api/notificacoes/minhas', {
        params: {
          somenteNaoLidas,
          page: pagina,
          size: 15,
        }
      });
      return response.data;
    }
  });

  // MUTAÇÃO: Marcar como lida
  const marcarLidaMutacao = useMutation({
    mutationFn: async (id) => {
      await cliente.patch(`/api/notificacoes/${id}/leitura`);
    },
    onSuccess: () => {
      // Invalida cache de contadores e listas
      queryClient.invalidateQueries(['notificacoes']);
      queryClient.invalidateQueries(['notificacoes-contador']);
    }
  });

  const handleMarcarComoLida = (e, id) => {
    e.stopPropagation(); // Evita navegar ao clicar apenas no botão
    marcarLidaMutacao.mutate(id);
  };

  const handleCliqueNotificacao = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarLidaMutacao.mutateAsync(notificacao.id);
    }
    
    // Redireciona de acordo com o link ou denúncia associada
    if (notificacao.denunciaId) {
      navigate(`/denuncias/${notificacao.denunciaId}`);
    } else if (notificacao.link) {
      navigate(notificacao.link);
    }
  };

  const getIconeNotificacao = (tipo) => {
    switch (tipo) {
      case 'DENUNCIA_ATRIBUIDA':
        return '📋';
      case 'DENUNCIA_CONCLUIDA_AGUARDANDO_CONFIRMACAO':
        return '✅';
      case 'TRANSFERENCIA_SOLICITADA':
      case 'TRANSFERENCIA_APROVADA':
      case 'TRANSFERENCIA_RECUSADA':
        return '🔄';
      case 'SINALIZACAO_DENUNCIA_RECEBIDA':
        return '🚨';
      default:
        return '🔔';
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

  const notificacoes = notificacoesData?.content || [];
  const totalPaginas = notificacoesData?.totalPages || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Notificações</h2>
          <p className="text-sm text-gray-500 mt-1">Acompanhe as atualizações e decisões sobre os relatos da sua cidade.</p>
        </div>
      </div>

      {/* Tabs / Filtros */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setSomenteNaoLidas(false); setPagina(0); }}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            !somenteNaoLidas
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => { setSomenteNaoLidas(true); setPagina(0); }}
          className={`py-2.5 px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            somenteNaoLidas
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Não Lidas
        </button>
      </div>

      {/* Listagem */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 font-semibold">Buscando suas notificações...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-red-500 font-medium">Erro ao carregar notificações.</p>
          <button onClick={() => refetch()} className="mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold">Tentar novamente</button>
        </div>
      ) : notificacoes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-xs">
          <p className="text-lg font-bold text-gray-700">Tudo em dia! 🎉</p>
          <p className="text-sm text-gray-500 mt-1">Você não tem novas notificações por aqui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleCliqueNotificacao(notif)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                notif.lida
                  ? 'bg-white border-gray-200 hover:border-gray-300'
                  : 'bg-blue-50/50 border-blue-100 hover:border-blue-200 shadow-2xs'
              }`}
            >
              {/* Ícone */}
              <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-lg shadow-2xs shrink-0">
                {getIconeNotificacao(notif.tipo)}
              </div>

              {/* Conteúdo */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h4 className={`text-sm font-bold text-gray-900 truncate ${!notif.lida ? 'text-blue-900' : ''}`}>
                    {notif.titulo}
                  </h4>
                  <span className="text-[10px] text-gray-400 shrink-0 font-semibold mt-0.5">
                    {formataData(notif.criadoEm)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {notif.mensagem}
                </p>
              </div>

              {/* Ação de Moderação se não lida */}
              {!notif.lida && (
                <button
                  onClick={(e) => handleMarcarComoLida(e, notif.id)}
                  title="Marcar como lida"
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                >
                  Lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            disabled={pagina === 0}
            onClick={() => setPagina((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            &larr; Anterior
          </button>
          <span className="text-sm font-semibold text-gray-600">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <button
            disabled={pagina + 1 >= totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            Próxima &rarr;
          </button>
        </div>
      )}

    </div>
  );
};

export default Notificacoes;
