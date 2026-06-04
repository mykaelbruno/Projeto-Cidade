import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { CheckCircle2, Handshake, XCircle } from 'lucide-react';
import { contaService } from '../services/contaService';
import { getApiErrorMessage } from '../services/apiClient';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const confirmarEmail = async () => {
      if (!token) {
        setErrorMessage('Token de verificacao ausente.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await contaService.confirmarEmail(token);
        setSuccessMessage(response.mensagem);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    confirmarEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#087F5B] to-[#0F4C81] text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-75" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-6 relative inline-block">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl" />
              <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
                <Handshake className="w-12 h-12 text-[#087F5B]" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              Verificacao de e-mail
            </h1>
            <p className="text-sm text-white/70">
              Confirmando sua conta no Cidade Ativa
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 space-y-4">
            {isLoading && (
              <div className="text-center text-sm text-white/80">
                Confirmando e-mail...
              </div>
            )}

            {successMessage && (
              <Alert className="border-green-400/30 bg-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-300" />
                <AlertDescription className="text-sm text-white">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert className="border-red-400/30 bg-red-500/20">
                <XCircle className="h-4 w-4 text-red-200" />
                <AlertDescription className="text-sm text-white">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button asChild className="w-full h-12 bg-white text-[#087F5B] hover:bg-white/90 font-display font-bold text-base">
              <Link to="/">Ir para o login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
