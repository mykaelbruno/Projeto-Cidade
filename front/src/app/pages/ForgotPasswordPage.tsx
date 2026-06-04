import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, CheckCircle2, Handshake } from 'lucide-react';
import { contaService } from '../services/contaService';
import { getApiErrorMessage } from '../services/apiClient';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await contaService.solicitarRecuperacaoSenha(email.trim());
      setMessage(response.mensagem);
      setEmailSent(true);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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
              Conecta Cidadao
            </h1>
            <p className="text-lg font-display font-medium text-white/90 mb-1">
              Recuperar senha
            </p>
            <p className="text-sm text-white/70">
              Enviaremos um link de recuperacao para seu e-mail
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">
                    E-mail cadastrado
                  </Label>
                  <Input
                    type="email"
                    placeholder="seu-email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-white">
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-white text-[#087F5B] hover:bg-white/90 font-display font-bold text-base shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar link de recuperacao'}
                </Button>

                <div className="text-center">
                  <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-400/30 bg-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  <AlertDescription className="text-sm text-white">
                    <strong className="font-semibold">Solicitacao enviada.</strong> {message}
                  </AlertDescription>
                </Alert>

                <div className="space-y-3 text-sm text-white/80">
                  <p>Nao recebeu o e-mail?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-white/70">
                    <li>Verifique sua caixa de spam ou lixo eletronico</li>
                    <li>Certifique-se de que digitou o e-mail correto</li>
                    <li>Aguarde alguns minutos e tente novamente</li>
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setMessage(null);
                  }}
                  variant="outline"
                  className="w-full h-12 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Tentar outro e-mail
                </Button>

                <div className="text-center">
                  <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-6 text-center text-white/50 text-xs relative z-10">
        Plataforma de zeladoria urbana e participacao cidada - v1.0.0
      </div>
    </div>
  );
}
