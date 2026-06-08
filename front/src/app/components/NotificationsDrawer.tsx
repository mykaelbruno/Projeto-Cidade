import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bell, CheckCheck, FileText, Loader2, MessageCircle, X } from 'lucide-react';
import { notifyNotificationsUpdated } from '../hooks/useUnreadNotificationsCount';
import { notificacaoService } from '../services/notificacaoService';
import type { NotificacaoResponseDTO, TipoNotificacao } from '../types/notificacao';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;

  const carregarNotificacoes = useCallback(async () => {
    setIsLoading(true);
    setErro(null);

    try {
      const pagina = await notificacaoService.listarMinhas({ somenteNaoLidas: true, page: 0, size: 30 });
      setNotificacoes(pagina.content);
      notifyNotificationsUpdated();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar notificacoes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      carregarNotificacoes();
    }
  }, [carregarNotificacoes, isOpen]);

  async function dispensarNotificacao(notificacao: NotificacaoResponseDTO) {
    try {
      await notificacaoService.marcarComoLida(notificacao.id);
      setNotificacoes((current) => current.filter((item) => item.id !== notificacao.id));
      notifyNotificationsUpdated();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel remover a notificacao da lista.');
    }
  }

  async function marcarTodasComoLidas() {
    try {
      await notificacaoService.marcarTodasComoLidas();
      setNotificacoes((current) => current.map((notificacao) => ({ ...notificacao, lida: true })));
      notifyNotificationsUpdated();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel marcar notificacoes como lidas.');
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg font-display font-bold">
            Notificacoes
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {naoLidas > 0 ? `${naoLidas} nao ${naoLidas === 1 ? 'lida' : 'lidas'}` : 'Tudo em dia'}
          </p>
          {naoLidas > 0 && (
            <Button variant="outline" size="sm" className="gap-2" onClick={marcarTodasComoLidas}>
              <CheckCheck className="h-4 w-4" />
              Marcar todas
            </Button>
          )}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
              Carregando notificacoes...
            </div>
          ) : erro ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro}
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-sm">
                <Bell className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nenhuma notificacao por aqui</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando houver novidades sobre seus relatos, elas vao aparecer aqui.
              </p>
            </div>
          ) : (
            notificacoes.map((notification) => (
              <div
                key={notification.id}
                className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${getIconBackground(notification.tipo)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {getIcon(notification.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {notification.titulo}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {notification.mensagem}
                        </p>
                        <span className="mt-2 inline-block text-[11px] text-muted-foreground">
                          {new Date(notification.criadoEm).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => dispensarNotificacao(notification)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Remover da lista"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getIcon(tipo: TipoNotificacao) {
  if (tipo.includes('SINALIZACAO') || tipo.includes('TRANSFERENCIA')) {
    return <AlertTriangle className="w-5 h-5 text-amber-600" />;
  }

  if (tipo.includes('COMENTARIO') || tipo.includes('RESPONDIDA')) {
    return <MessageCircle className="w-5 h-5 text-blue-600" />;
  }

  if (tipo.includes('DENUNCIA')) {
    return <FileText className="w-5 h-5 text-purple-600" />;
  }

  return <Bell className="w-5 h-5 text-foreground" />;
}

function getIconBackground(tipo: TipoNotificacao) {
  if (tipo.includes('SINALIZACAO') || tipo.includes('TRANSFERENCIA')) return 'bg-amber-100';
  if (tipo.includes('COMENTARIO') || tipo.includes('RESPONDIDA')) return 'bg-blue-100';
  if (tipo.includes('DENUNCIA')) return 'bg-purple-100';
  return 'bg-muted';
}
