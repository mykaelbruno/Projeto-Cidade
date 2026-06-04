import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      alert: 'bg-red-50 border-red-200 text-red-800',
      button: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    warning: {
      alert: 'bg-amber-50 border-amber-200 text-amber-800',
      button: 'bg-amber-600 text-white hover:bg-amber-700',
    },
    info: {
      alert: 'bg-blue-50 border-blue-200 text-blue-800',
      button: 'bg-primary text-primary-foreground hover:bg-primary/90',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full">
        <div className="p-4 md:p-6 border-b border-border flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-display font-bold text-foreground">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {description && (
          <div className="p-4 md:p-6">
            <div className={`p-4 border rounded-lg ${styles.alert}`}>
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm">
                  {description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 md:p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
          >
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
