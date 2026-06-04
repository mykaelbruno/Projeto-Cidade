import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Eye, EyeOff, Handshake } from 'lucide-react';
import { contaService } from '../services/contaService';
import { getApiErrorMessage } from '../services/apiClient';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage('Token de redefinicao ausente.');
      return;
    }

    if (novaSenha.length < 8) {
      setErrorMessage('A nova senha deve ter no minimo 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      setErrorMessage('As senhas digitadas nao conferem.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await contaService.redefinirSenha(token, novaSenha);
      setSuccessMessage(response.mensagem);
      setTimeout(() => navigate('/'), 1200);
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
              Nova senha
            </h1>
            <p className="text-sm text-white/70">
              Defina uma senha segura para acessar sua conta
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">
                  Nova senha
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="No minimo 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">
                  Confirmar senha
                </Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                  required
                />
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-red-300/40 bg-red-500/20 px-4 py-3 text-sm text-white">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-green-300/40 bg-green-500/20 px-4 py-3 text-sm text-white">
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-white text-[#087F5B] hover:bg-white/90 font-display font-bold text-base shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
              </Button>

              <div className="text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
