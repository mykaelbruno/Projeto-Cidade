import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Power, Search, Shield, User, UserPlus, Users } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { usuarioService } from '../../services/usuarioService';
import type { PerfilUsuario, UsuarioResponseDTO } from '../../types/auth';

interface UsuarioFormState {
  nome: string;
  email: string;
  username: string;
  senha: string;
  perfilGlobal: PerfilUsuario;
  telefone: string;
  cidade: string;
  bairro: string;
  fotoPerfilUrl: string;
}

type PerfilFiltro = PerfilUsuario | 'TODOS';
type SituacaoFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';

const emptyForm: UsuarioFormState = {
  nome: '',
  email: '',
  username: '',
  senha: '',
  perfilGlobal: 'MORADOR',
  telefone: '',
  cidade: '',
  bairro: '',
  fotoPerfilUrl: '',
};

const perfilLabels: Record<PerfilUsuario, string> = {
  ADMIN_APP: 'Admin App',
  MODERADOR: 'Moderador',
  MORADOR: 'Morador',
};

const perfilColors: Record<PerfilUsuario, string> = {
  ADMIN_APP: 'bg-red-100 text-red-700',
  MODERADOR: 'bg-purple-100 text-purple-700',
  MORADOR: 'bg-blue-100 text-blue-700',
};

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [perfilFilter, setPerfilFilter] = useState<PerfilFiltro>('TODOS');
  const [situacaoFilter, setSituacaoFilter] = useState<SituacaoFiltro>('TODOS');
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioResponseDTO | null>(null);
  const [form, setForm] = useState<UsuarioFormState>(emptyForm);

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const response = await usuarioService.listar({
        termo: searchTerm,
        perfilGlobal: perfilFilter === 'TODOS' ? null : perfilFilter,
        ativo:
          situacaoFilter === 'TODOS'
            ? null
            : situacaoFilter === 'ATIVO',
      });
      setUsuarios(response);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar usuarios.');
    } finally {
      setCarregando(false);
    }
  }, [perfilFilter, searchTerm, situacaoFilter]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const filteredUsuarios = usuarios;

  function abrirCriacao() {
    setUsuarioEditando(null);
    setForm(emptyForm);
    setModalAberto(true);
  }

  function abrirEdicao(usuario: UsuarioResponseDTO) {
    setUsuarioEditando(usuario);
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      username: usuario.username,
      senha: '',
      perfilGlobal: usuario.perfilGlobal,
      telefone: usuario.telefone ?? '',
      cidade: usuario.cidade ?? '',
      bairro: usuario.bairro ?? '',
      fotoPerfilUrl: usuario.fotoPerfilUrl ?? '',
    });
    setModalAberto(true);
  }

  async function salvarUsuario() {
    setProcessando(true);
    setErro(null);

    try {
      if (usuarioEditando) {
        await usuarioService.atualizar(usuarioEditando.id, {
          nome: form.nome.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
          perfilGlobal: form.perfilGlobal,
          telefone: form.telefone.trim() || null,
          cidade: form.cidade.trim(),
          bairro: form.bairro.trim(),
          fotoPerfilUrl: form.fotoPerfilUrl.trim() || null,
        });
        setFeedback('Usuario atualizado com sucesso.');
      } else {
        await usuarioService.criar({
          nome: form.nome.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
          senha: form.senha,
          perfilGlobal: form.perfilGlobal,
          telefone: form.telefone.trim() || null,
          cidade: form.cidade.trim(),
          bairro: form.bairro.trim(),
        });
        setFeedback('Usuario criado com sucesso.');
      }

      setModalAberto(false);
      await carregarUsuarios();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel salvar o usuario.');
    } finally {
      setProcessando(false);
    }
  }

  async function alternarAtivacao(usuario: UsuarioResponseDTO) {
    setProcessando(true);
    setErro(null);

    try {
      await usuarioService.alterarAtivo(usuario.id, !usuario.ativo);
      setFeedback(usuario.ativo ? 'Usuario inativado.' : 'Usuario ativado.');
      await carregarUsuarios();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel alterar a ativacao.');
    } finally {
      setProcessando(false);
    }
  }

  const totalAdmins = usuarios.filter((usuario) => usuario.perfilGlobal === 'ADMIN_APP').length;
  const totalModeradores = usuarios.filter((usuario) => usuario.perfilGlobal === 'MODERADOR').length;
  const totalAtivos = usuarios.filter((usuario) => usuario.ativo).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Gestao de Usuarios Globais</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administre contas globais da plataforma.
          </p>
        </div>
        <Button className="gap-2" onClick={abrirCriacao}>
          <UserPlus className="w-4 h-4" />
          Novo Usuario
        </Button>
      </div>

      {(erro || feedback) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {erro || feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total de usuarios" value={usuarios.length} icon={<Users className="w-5 h-5" />} tone="bg-blue-100 text-blue-700" />
        <StatCard label="Admins" value={totalAdmins} icon={<Shield className="w-5 h-5" />} tone="bg-red-100 text-red-700" />
        <StatCard label="Moderadores" value={totalModeradores} icon={<Shield className="w-5 h-5" />} tone="bg-purple-100 text-purple-700" />
        <StatCard label="Usuarios ativos" value={totalAtivos} icon={<User className="w-5 h-5" />} tone="bg-green-100 text-green-700" />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por ID, nome, username ou email..."
                className="pl-9"
              />
            </div>
            <Select value={perfilFilter} onValueChange={(value) => setPerfilFilter(value as PerfilFiltro)}>
              <SelectTrigger>
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os perfis</SelectItem>
                <SelectItem value="ADMIN_APP">Admin App</SelectItem>
                <SelectItem value="MODERADOR">Moderador</SelectItem>
                <SelectItem value="MORADOR">Morador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={situacaoFilter} onValueChange={(value) => setSituacaoFilter(value as SituacaoFiltro)}>
              <SelectTrigger>
                <SelectValue placeholder="Situacao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="ATIVO">Ativos</SelectItem>
                <SelectItem value="INATIVO">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando usuarios...</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nome</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Perfil</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Localizacao</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">#{usuario.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{usuario.nome}</td>
                      <td className="px-4 py-3 text-sm text-foreground">@{usuario.username}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{usuario.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={perfilColors[usuario.perfilGlobal]}>
                          {perfilLabels[usuario.perfilGlobal]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {usuario.cidade ?? '-'} - {usuario.bairro ?? '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={usuario.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => abrirEdicao(usuario)} disabled={processando} title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => alternarAtivacao(usuario)} disabled={processando} title="Ativar/Inativar">
                            <Power className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-border">
              {filteredUsuarios.map((usuario) => (
                <div key={usuario.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-foreground">{usuario.nome}</h3>
                      <p className="text-xs text-muted-foreground">@{usuario.username} - #{usuario.id}</p>
                    </div>
                    <Badge className={usuario.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={perfilColors[usuario.perfilGlobal]}>
                      {perfilLabels[usuario.perfilGlobal]}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => abrirEdicao(usuario)} disabled={processando}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => alternarAtivacao(usuario)} disabled={processando}>
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsuarios.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Nenhum usuario encontrado.</div>
            )}
          </>
        )}
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{usuarioEditando ? 'Editar Usuario' : 'Criar Usuario Global'}</DialogTitle>
            <DialogDescription>
              {usuarioEditando
                ? 'Atualize os dados da conta.'
                : 'Crie uma conta global. Contas institucionais vinculadas a organizacoes ficam no fluxo de vinculos/organizacoes.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nome" value={form.nome} onChange={(value) => setForm((current) => ({ ...current, nome: value }))} />
            <Field label="Username" value={form.username} onChange={(value) => setForm((current) => ({ ...current, username: value }))} />
            <Field label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
            {!usuarioEditando && (
              <Field
                label="Senha inicial"
                type="password"
                value={form.senha}
                onChange={(value) => setForm((current) => ({ ...current, senha: value }))}
              />
            )}
            <div>
              <Label className="mb-2 block">Perfil global</Label>
              <Select value={form.perfilGlobal} onValueChange={(value) => setForm((current) => ({ ...current, perfilGlobal: value as PerfilUsuario }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN_APP">Admin App</SelectItem>
                  <SelectItem value="MODERADOR">Moderador</SelectItem>
                  <SelectItem value="MORADOR">Morador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Telefone" value={form.telefone} onChange={(value) => setForm((current) => ({ ...current, telefone: value }))} />
            <Field label="Cidade" value={form.cidade} onChange={(value) => setForm((current) => ({ ...current, cidade: value }))} />
            <Field label="Bairro" value={form.bairro} onChange={(value) => setForm((current) => ({ ...current, bairro: value }))} />
            {usuarioEditando && (
              <div className="md:col-span-2">
                <Field
                  label="URL da foto de perfil"
                  value={form.fotoPerfilUrl}
                  onChange={(value) => setForm((current) => ({ ...current, fotoPerfilUrl: value }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                processando ||
                !form.nome.trim() ||
                !form.email.trim() ||
                !form.username.trim() ||
                !form.cidade.trim() ||
                !form.bairro.trim() ||
                (!usuarioEditando && form.senha.length < 8)
              }
              onClick={salvarUsuario}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${tone}`}>{icon}</div>
        <div>
          <div className="text-2xl font-display font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
