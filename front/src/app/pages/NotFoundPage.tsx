import { useNavigate } from 'react-router';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigateByRole } from '../hooks/useNavigateByRole';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { navigateToHome } = useNavigateByRole();

  return (
    <div className="h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="text-4xl font-display font-bold text-foreground mb-3">
          404
        </h1>

        <h2 className="text-xl font-display font-semibold text-foreground mb-2">
          Página não encontrada
        </h2>

        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={navigateToHome}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-5 h-5" />
            Voltar ao início
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors"
          >
            Página anterior
          </button>
        </div>
      </div>
    </div>
  );
}
