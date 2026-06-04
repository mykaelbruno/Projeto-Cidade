import { AlertTriangle, MessageCircle, PlayCircle, Trash2 } from 'lucide-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll: () => void;
}

export function NotificationsDropdown({ isOpen, onClose, onViewAll }: NotificationsDropdownProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">
            Notificações
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-border group hover:bg-muted transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  Relato concluído
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  O buraco na Rua das Flores foi reparado. Confirme a resolução.
                </p>
                <span className="text-xs text-muted-foreground">há 2 horas</span>
              </div>
              <button className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
          <div className="p-4 border-b border-border group hover:bg-muted transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  Novo comentário
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  A Secretaria de Infraestrutura respondeu seu relato.
                </p>
                <span className="text-xs text-muted-foreground">há 5 horas</span>
              </div>
              <button className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
          <div className="p-4 group hover:bg-muted transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  Atualização de status
                </p>
                <p className="text-xs text-muted-foreground mb-1">
                  Seu relato sobre iluminação mudou para "Em andamento".
                </p>
                <span className="text-xs text-muted-foreground">há 1 dia</span>
              </div>
              <button className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-3 border-t border-border">
          <button
            onClick={onViewAll}
            className="w-full text-center text-sm font-medium text-primary hover:underline"
          >
            Ver todas as notificações
          </button>
        </div>
      </div>
    </>
  );
}
