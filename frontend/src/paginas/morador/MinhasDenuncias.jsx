import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import cliente from '../../api/cliente';

const MinhasDenuncias = () => {
  const [pagina, setPagina] = useState(0);

  const { data: feedData, isLoading, isError, refetch } = useQuery({
    queryKey: ['minhas-denuncias', { pagina }],
    queryFn: async () => {
      const response = await cliente.get('/api/denuncias/minhas', {
        params: {
          page: pagina,
          size: 10,
        }
      });
      return response.data;
    }
  });

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

  const minhas = feedData?.content || [];
  const totalPaginas = feedData?.totalPages || 0;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">📂 Minhas Denúncias</h2>
        <p className="text-sm text-gray-500 mt-1">Acompanhe o andamento dos problemas que você relatou.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 font-semibold">Carregando seus relatos...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-red-500 font-medium">Não foi possível carregar suas denúncias.</p>
          <button onClick={() => refetch()} className="mt-3 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold">Tentar novamente</button>
        </div>
      ) : minhas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-lg font-bold text-gray-700">Nenhum relato criado ainda 🍃</p>
          <p className="text-sm text-gray-500 mt-1">Quando você criar uma denúncia, ela ficará listada aqui.</p>
          <Link 
            to="/denuncias/nova" 
            className="mt-4 inline-block bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-sm"
          >
            Criar Minha Primeira Denúncia
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {minhas.map(denuncia => (
            <div 
              key={denuncia.id} 
              className="bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-5 md:p-6 shadow-xs transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-100">
                    {denuncia.categoriaNome}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-semibold border ${getStatusColor(denuncia.status)}`}>
                    {denuncia.status.replace('_', ' ')}
                  </span>
                  {denuncia.anonima && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">
                      🤐 Relato Anônimo
                    </span>
                  )}
                </div>

                <div>
                  <Link 
                    to={`/denuncias/${denuncia.id}`} 
                    className="text-lg font-bold text-gray-900 hover:text-blue-600 block transition-colors mt-1"
                  >
                    {denuncia.titulo}
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {denuncia.descricao}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                  <span>📍 {denuncia.bairro}, {denuncia.cidade} {denuncia.rua ? `— ${denuncia.rua}` : ''}</span>
                  <span>🗓️ Criado em: {formataData(denuncia.criadoEm)}</span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:border-l md:border-gray-100 md:pl-6 min-w-[160px]">
                <div className="text-xs text-gray-500 space-y-1 text-left md:text-right w-full">
                  <div>👍 <strong>{denuncia.quantidadeConfirmacoes}</strong> apoios</div>
                  <div>🚨 <strong>{denuncia.quantidadeUrgencias}</strong> urgências</div>
                  <div>💬 <strong>{denuncia.quantidadeComentarios}</strong> comentários</div>
                </div>

                <Link
                  to={`/denuncias/${denuncia.id}`}
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold block text-center w-full transition-colors"
                >
                  Ver Progresso →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            disabled={pagina === 0}
            onClick={() => setPagina(p => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            &larr; Anterior
          </button>
          <span className="text-sm font-semibold text-gray-600">
            Página {pagina + 1} de {totalPaginas}
          </span>
          <button
            disabled={pagina + 1 >= totalPaginas}
            onClick={() => setPagina(p => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-bold bg-white text-gray-700 disabled:opacity-50 cursor-pointer"
          >
            Próxima &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default MinhasDenuncias;
