import { useMemo, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Handshake, Eye, EyeOff, Building2, Mail } from 'lucide-react';
import { getHomePathByUserType, useUser } from '../contexts/UserContext';
import { getApiErrorMessage } from '../services/apiClient';
import { isRedirectPathCompatible } from '../utils/authNavigation';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useUser();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectPath = searchParams.get('redirect');
  const loginReason = searchParams.get('motivo');
  const helperMessage = useMemo(() => {
    if (loginReason === 'expired') {
      return 'Sua sessao expirou. Entre novamente para continuar de onde parou.';
    }

    if (loginReason === 'required') {
      return 'Faca login para acessar esta area do sistema.';
    }

    return null;
  }, [loginReason]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const session = await login({
        identificador: emailOrUsername.trim(),
        senha: password,
      });

      const fallbackPath = getHomePathByUserType(session.userType);
      const nextPath = isRedirectPathCompatible(session.userType, redirectPath)
        ? redirectPath!
        : fallbackPath;
      navigate(nextPath, { replace: true });
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
              Voce informa. A prefeitura resolve.
            </p>
            <p className="text-sm text-white/70">
              Entre na sua conta
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {helperMessage && (
                <div className="rounded-xl border border-amber-300/40 bg-amber-500/20 px-4 py-3 text-sm text-white">
                  {helperMessage}
                </div>
              )}

              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">
                  E-mail ou nome de usuario
                </Label>
                <Input
                  type="text"
                  placeholder="exemplo@cidade.com ou morador123"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-white">Senha</Label>
                  <Link to="/esqueci-senha" className="text-sm text-white/90 hover:text-white font-medium">
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <p className="text-center text-sm text-white/90">
                Nao tem uma conta?{' '}
                <Link to="/cadastro" className="font-semibold text-white hover:underline">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white mb-1">
                  Voce e prefeitura?
                </h3>
                <p className="text-sm text-white/80 mb-3">
                  Entre em contato para se cadastrar na plataforma e ter acesso as denuncias na sua cidade.
                </p>
                <a
                  href="mailto:contato@cidadeativa.com.br"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contato@cidadeativa.com.br
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 text-center text-white/50 text-xs relative z-10">
        Plataforma de zeladoria urbana e participacao cidada - v1.0.0
      </div>
    </div>
  );
}
