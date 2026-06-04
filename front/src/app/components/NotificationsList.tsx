import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bell, FileText, Loader2, MessageSquare, X } from 'lucide-react';
import { notificacaoService } from '../services/notificacaoService';
import type { NotificacaoResponseDTO, TipoNotificacao } from '../types/notificacao';

interface NotificationsListProps {
  userRole?: string;
}

export function NotificationsList({ userRole: _userRole = 'moderador' }: NotificationsListProps) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponseDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;

  const carregarNotificacoes = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const pagina = await notificacaoService.listarMinhas({ page: 0, size: 20 });
      setNotificacoes(pagina.content);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar notificacoes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  async function marcarComoLida(notificacao: NotificacaoResponseDTO) {
    if (notificacao.lida) {
      abrirLink(notificacao);
      return;
    }

    try {
      const atualizada = await notificacaoService.marcarComoLida(notificacao.id);
      setNotificacoes((current) =>
        current.map((item) => (item.id === atualizada.id ? atualizada : item)),
      );
      abrirLink(atualizada);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel marcar notificacao como lida.');
    }
  }

  async function marcarTodasComoLidas() {
    try {
      await notificacaoService.marcarTodasComoLidas();
      setNotificacoes((current) => current.map((notificacao) => ({ ...notificacao, lida: true })));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel marcar notificacoes como lidas.');
    }
  }

  function abrirLink(notificacao: NotificacaoResponseDTO) {
    if (notificacao.link) {
      window.location.href = notificacao.link;
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
        title="Notificacoes"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {naoLidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">Notificacoes</h3>
                {naoLidas > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {naoLidas} nao {naoLidas === 1 ? 'lida' : 'lidas'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {naoLidas > 0 && (
                  <button onClick={marcarTodasComoLidas} className="text-xs text-primary hover:underline">
                    Marcar todas como lidas
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {carregando ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Loader2 className="w-5 h-5 mx-auto mb-3 animate-spin" />
                  Carregando notificacoes...
                </div>
              ) : erro ? (
                <div className="p-6 text-center text-sm text-red-600">{erro}</div>
              ) : notificacoes.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-3">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Nenhuma notificacao</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notificacoes.map((notificacao) => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !notificacao.lida ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => marcarComoLida(notificacao)}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${getIconBackground(notificacao.tipo)}`}>
                          {getIcon(notificacao.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground">{notificacao.titulo}</h4>
                            {!notificacao.lida && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{notificacao.mensagem}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notificacao.criadoEm).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getIcon(tipo: TipoNotificacao) {
  if (tipo.includes('SINALIZACAO') || tipo.includes('TRANSFERENCIA')) {
    return <AlertTriangle className="w-5 h-5 text-amber-600" />;
  }
  if (tipo.includes('COMENTARIO')) {
    return <MessageSquare className="w-5 h-5 text-blue-600" />;
  }
  if (tipo.includes('DENUNCIA')) {
    return <FileText className="w-5 h-5 text-purple-600" />;
  }
  return <Bell className="w-5 h-5 text-foreground" />;
}

function getIconBackground(tipo: TipoNotificacao) {
  if (tipo.includes('SINALIZACAO') || tipo.includes('TRANSFERENCIA')) return 'bg-amber-100';
  if (tipo.includes('COMENTARIO')) return 'bg-blue-100';
  if (tipo.includes('DENUNCIA')) return 'bg-purple-100';
  return 'bg-muted';
}
