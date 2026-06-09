import { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, Mail, Phone, Search, Shield, Users, XCircle, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useUser } from '../../contexts/UserContext';
import { getVinculoOperacionalAtivo } from '../../utils/operacionalContext';
import { vinculoService } from '../../services/vinculoService';
import type { VinculoUsuarioOrganizacaoResponseDTO } from '../../types/vinculo';

const cargoLabels: Record<string, string> = {
  SECRETARIA: 'Usuário da secretaria',
  PREFEITURA: 'Usuário da prefeitura',
};

export function UsuariosSecretariaPage() {
  const { userType, vinculosOperacionais } = useUser();
  const activeVinculo = useMemo(
    () => getVinculoOperacionalAtivo(userType, vinculosOperacionais),
    [userType, vinculosOperacionais],
  );

  const [usuarios, setUsuarios] = useState<VinculoUsuarioOrganizacaoResponseDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeVinculo) {
      setUsuarios([]);
      setError('Não foi possível identificar o seu vínculo operacional.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    vinculoService
      .listarPorOrganizacao(activeVinculo.organizacaoId)
      .then((data) => {
        setUsuarios(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Erro ao buscar usuários:', err);
        setError(err instanceof Error ? err.message : 'Erro ao buscar usuários da secretaria.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeVinculo]);

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nomeUsuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
    usuario.emailUsuario.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const usuariosAtivos = usuarios.filter((usuario) => usuario.ativo).length;
  const usuariosInativos = usuarios.filter((usuario) => !usuario.ativo).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Carregando usuários da secretaria...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-3 text-lg font-semibold text-red-900">Erro ao carregar usuários</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <div>
        <h2 className="mb-1 text-xl font-display font-bold text-foreground md:text-2xl">
          Usuários da Secretaria
        </h2>
        <p className="text-sm text-muted-foreground">
          Usuários vinculados a {activeVinculo?.nomeOrganizacao || 'sua secretaria'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-1 text-sm text-muted-foreground">Total de usuários</p>
              <p className="text-3xl font-display font-bold text-foreground">{usuarios.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-1 text-sm text-muted-foreground">Usuários ativos</p>
              <p className="text-3xl font-display font-bold text-foreground">{usuariosAtivos}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="mb-1 text-sm text-muted-foreground">Usuários inativos</p>
              <p className="text-3xl font-display font-bold text-foreground">{usuariosInativos}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <XCircle className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
          >
            <div className="border-b border-border bg-muted/30 p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 line-clamp-1 text-sm font-display font-semibold text-foreground">
                    {usuario.nomeUsuario}
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-indigo-200 bg-indigo-100 text-xs text-indigo-700"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {cargoLabels[usuario.papel] || usuario.papel}
                  </Badge>
                </div>
                <Badge
                  className={`shrink-0 ${
                    usuario.ativo
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {usuario.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{usuario.emailUsuario}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-foreground">{usuario.telefoneUsuario || 'Não informado'}</span>
              </div>

              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Membro desde</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(usuario.criadoEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Observação:</strong> esta página exibe os usuários vinculados à sua secretaria.
          O gerenciamento completo das contas continua centralizado no painel da prefeitura.
        </p>
      </div>
    </div>
  );
}
