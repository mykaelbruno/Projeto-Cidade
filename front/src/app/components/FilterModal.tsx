import { X, Search, Filter } from 'lucide-react';
import type { CategoriaResponseDTO } from '../types/categoria';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: CategoriaResponseDTO[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterModal({
  isOpen,
  onClose,
  categorias,
  selectedCategoryId,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FilterModalProps) {
  if (!isOpen) return null;

  const handleCategorySelect = (categoryId: string) => {
    onCategoryChange(categoryId);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">
                Filtros
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por rua, bairro ou problema..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Categoria
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategorySelect('TODAS')}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                  selectedCategoryId === 'TODAS'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-muted text-foreground'
                }`}
              >
                Todas
              </button>

              {categorias.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(String(category.id))}
                  className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${
                    selectedCategoryId === String(category.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-muted text-foreground'
                  }`}
                >
                  {category.nome}
                </button>
              ))}
            </div>
          </div>

          {(selectedCategoryId !== 'TODAS' || searchQuery) && (
            <button
              onClick={() => {
                onCategoryChange('TODAS');
                onSearchChange('');
                onClose();
              }}
              className="w-full px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </>
  );
}
