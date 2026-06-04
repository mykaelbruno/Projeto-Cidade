import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Building2, Eye, EyeOff, Handshake, Mail } from 'lucide-react';
import { getApiErrorMessage } from '../services/apiClient';
import { authService } from '../services/authService';
import { organizacaoService } from '../services/organizacaoService';
import type { BairroResponseDTO, OrganizacaoResponseDTO } from '../types/organizacao';

export function RegisterPage() {
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [prefeituraId, setPrefeituraId] = useState('');
  const [bairro, setBairro] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(true);
  const [loadingBairros, setLoadingBairros] = useState(false);
  const [prefeituras, setPrefeituras] = useState<OrganizacaoResponseDTO[]>([]);
  const [bairros, setBairros] = useState<BairroResponseDTO[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const prefeituraSelecionada = useMemo(
    () => prefeituras.find((prefeitura) => String(prefeitura.id) === prefeituraId),
    [prefeituraId, prefeituras],
  );

  useEffect(() => {
    const carregarPrefeituras = async () => {
      setLoadingCidades(true);
      setErrorMessage(null);

      try {
        const response = await organizacaoService.listarPrefeiturasAtivas();
        setPrefeituras(response);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setLoadingCidades(false);
      }
    };

    carregarPrefeituras();
  }, []);

  useEffect(() => {
    const carregarBairros = async () => {
      if (!prefeituraId) {
        setBairros([]);
        setBairro('');
        return;
      }

      setLoadingBairros(true);
      setBairro('');

      try {
        const response = await organizacaoService.listarBairrosAtivos(Number(prefeituraId));
        setBairros(response);
      } catch (error) {
        setBairros([]);
        setErrorMessage(getApiErrorMessage(error));
      } finally {
        setLoadingBairros(false);
      }
    };

    carregarBairros();
  }, [prefeituraId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!prefeituraSelecionada) {
      setErrorMessage('Selecione uma cidade cadastrada.');
      setIsLoading(false);
      return;
    }

    if (senha.length < 8) {
      setErrorMessage('A senha deve ter no minimo 8 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.cadastrarMorador({
        nome: nomeCompleto.trim(),
        email: email.trim(),
        username: username.trim(),
        senha,
        telefone: telefone.trim() || undefined,
        cidade: prefeituraSelecionada.cidade,
        bairro,
      });

      setSuccessMessage(response.mensagem || 'Cadastro realizado com sucesso. Voce ja pode fazer login.');
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
        <div className="w-full max-w-2xl">
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
              Criar sua conta de morador
            </p>
            <p className="text-sm text-white/70">
              Ou{' '}
              <Link to="/" className="font-semibold text-white hover:underline">
                ja possui uma conta? Faca login
              </Link>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-white mb-2 block">
                  Nome completo
                </Label>
                <Input
                  type="text"
                  placeholder="Seu nome"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">
                    E-mail
                  </Label>
                  <Input
                    type="email"
                    placeholder="exemplo@cidade.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">
                    Nome de usuario
                  </Label>
                  <Input
                    type="text"
                    placeholder="morador123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="No minimo 8 caracteres"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
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
                    Telefone <span className="text-white/70 font-normal">(Opcional)</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="(83) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">
                    Cidade
                  </Label>
                  <Select value={prefeituraId} onValueChange={setPrefeituraId} disabled={loadingCidades}>
                    <SelectTrigger className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20">
                      <SelectValue placeholder={loadingCidades ? 'Carregando cidades...' : 'Selecione sua cidade'} />
                    </SelectTrigger>
                    <SelectContent>
                      {prefeituras.map((prefeitura) => (
                        <SelectItem key={prefeitura.id} value={String(prefeitura.id)}>
                          {prefeitura.cidade} - {prefeitura.estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-white/70 mt-1">
                    Apenas cidades cadastradas no sistema
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-white mb-2 block">
                    Bairro
                  </Label>
                  <Select value={bairro} onValueChange={setBairro} disabled={!prefeituraId || loadingBairros}>
                    <SelectTrigger className="h-12 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20">
                      <SelectValue
                        placeholder={
                          !prefeituraId
                            ? 'Selecione a cidade primeiro'
                            : loadingBairros
                              ? 'Carregando bairros...'
                              : 'Selecione seu bairro'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {bairros.map((item) => (
                        <SelectItem key={item.id} value={item.nome}>
                          {item.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                disabled={isLoading || loadingCidades || loadingBairros || !bairro}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Conta'}
              </Button>
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
