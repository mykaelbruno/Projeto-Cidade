import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface RemoverComentarioButtonProps {
  comentarioId: string;
  autorComentario: string;
  onRemover?: (comentarioId: string, motivo: string) => void;
  className?: string;
}

export function RemoverComentarioButton({
  comentarioId,
  autorComentario,
  onRemover,
  className = '',
}: RemoverComentarioButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  const handleConfirmarRemocao = () => {
    if (motivo.length >= 10) {
      onRemover?.(comentarioId, motivo);
      setShowModal(false);
      setMotivo('');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`p-1.5 hover:bg-destructive/10 rounded transition-colors ${className}`}
        title="Remover comentário"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </button>

      {/* Modal Remover Comentário */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-display font-bold text-foreground">
                Remover Comentário
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Comentário de {autorComentario}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Atenção:</strong> Esta ação removerá permanentemente o comentário da denúncia. Certifique-se de fornecer uma justificativa clara.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motivo da Remoção *
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Descreva o motivo da remoção (mínimo 10 caracteres)"
                  rows={4}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {motivo.length}/10 caracteres mínimos
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setMotivo('');
                }}
                className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={motivo.length < 10}
                onClick={handleConfirmarRemocao}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
