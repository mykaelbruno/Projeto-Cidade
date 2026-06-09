import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Building2,
  Edit,
  Loader2,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  User,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
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
import { useUser } from '../../contexts/UserContext';
import { getApiErrorMessage } from '../../services/apiClient';
import { categoriaService } from '../../services/categoriaService';
import { organizacaoService } from '../../services/organizacaoService';
import { vinculoService } from '../../services/vinculoService';
import type { VinculoUsuarioOrganizacaoResponseDTO } from '../../types/auth';
import type { CategoriaResponseDTO } from '../../types/categoria';
import type { OrganizacaoResponseDTO } from '../../types/organizacao';

function papelLabel(vinculo: VinculoUsuarioOrganizacaoResponseDTO, organizacao?: OrganizacaoResponseDTO | null) {
  if (vinculo.papel === 'PREFEITURA') return 'Prefeitura';
  if (organizacao?.tipo === 'SECRETARIA') return 'Usuario da secretaria';
  return 'Secretaria';
}

export function AdministracaoPage() {
  const { vinculosOperacionais } = useUser();
  const prefeituraId = vinculosOperacionais.find(
    (vinculo) => vinculo.ativo && vinculo.papel === 'PREFEITURA',
  )?.organizacaoId;

  const [prefeitura, setPrefeitura] = useState<OrganizacaoResponseDTO | null>(null);
  const [secretarias, setSecretarias] = useState<OrganizacaoResponseDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [vinculos, setVinculos] = useState<VinculoUsuarioOrganizacaoResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [nomeSecretaria, setNomeSecretaria] = useState('');
  const [categoriasSecretaria, setCategoriasSecretaria] = useState<Set<number>>(new Set());

  const [organizacaoUsuarioId, setOrganizacaoUsuarioId] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [usernameUsuario, setUsernameUsuario] = useState('');
  const [senhaUsuario, setSenhaUsuario] = useState('');
  const [telefoneUsuario, setTelefoneUsuario] = useState('');

  const [secretariaEditando, setSecretariaEditando] = useState<OrganizacaoResponseDTO | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [secretariaCategoriasEditando, setSecretariaCategoriasEditando] = useState<OrganizacaoResponseDTO | null>(null);
  const [categoriasEditando, setCategoriasEditando] = useState<Set<number>>(new Set());
  const [vinculoMovendo, setVinculoMovendo] = useState<VinculoUsuarioOrganizacaoResponseDTO | null>(null);
  const [destinoMovimento, setDestinoMovimento] = useState('');

  const organizacoesDoEscopo = useMemo(
    () => [prefeitura, ...secretarias].filter(Boolean) as OrganizacaoResponseDTO[],
    [prefeitura, secretarias],
  );

  const vinculosPorOrganizacao = useMemo(() => {
    return vinculos.reduce<Record<number, VinculoUsuarioOrganizacaoResponseDTO[]>>((acc, vinculo) => {
      acc[vinculo.organizacaoId] = [...(acc[vinculo.organizacaoId] ?? []), vinculo];
      return acc;
    }, {});
  }, [vinculos]);

  const carregarDados = useCallback(async () => {
    if (!prefeituraId) {
      setErro('Nao foi possivel identificar a prefeitura vinculada a sua conta.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const [organizacoes, listaCategorias] = await Promise.all([
        organizacaoService.listar(),
        categoriaService.listar(),
      ]);

      const prefeituraAtual = organizacoes.find((organizacao) => organizacao.id === prefeituraId) ?? null;
      const secretariasDaPrefeitura = organizacoes
        .filter((organizacao) => organizacao.tipo === 'SECRETARIA' && organizacao.organizacaoPaiId === prefeituraId)
        .sort((a, b) => a.nome.localeCompare(b.nome));

      const vinculosCarregados = await vinculoService.listar();

      setPrefeitura(prefeituraAtual);
      setSecretarias(secretariasDaPrefeitura);
      setCategorias(listaCategorias.filter((categoria) => categoria.ativa));
      setVinculos(vinculosCarregados);

      if (!organizacaoUsuarioId && secretariasDaPrefeitura[0]) {
        setOrganizacaoUsuarioId(String(secretariasDaPrefeitura[0].id));
      }
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [organizacaoUsuarioId, prefeituraId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function alternarCategoria(categoriaId: number) {
    setCategoriasSecretaria((atual) => {
      const copia = new Set(atual);
      if (copia.has(categoriaId)) {
        copia.delete(categoriaId);
      } else {
        copia.add(categoriaId);
      }
      return copia;
    });
  }

  function alternarCategoriaEditando(categoriaId: number) {
    setCategoriasEditando((atual) => {
      const copia = new Set(atual);
      if (copia.has(categoriaId)) {
        copia.delete(categoriaId);
      } else {
        copia.add(categoriaId);
      }
      return copia;
    });
  }

  function abrirCategoriasSecretaria(secretaria: OrganizacaoResponseDTO) {
    setSecretariaCategoriasEditando(secretaria);
    setCategoriasEditando(new Set(
      categorias
        .filter((categoria) => categoria.organizacaoResponsavelPadraoId === secretaria.id)
        .map((categoria) => categoria.id),
    ));
  }

  async function criarSecretaria() {
    if (!prefeituraId || nomeSecretaria.trim().length < 3) return;

    setIsSaving(true);
    setErro(null);

    try {
      await organizacaoService.criarSecretaria(prefeituraId, {
        nome: nomeSecretaria.trim(),
        categoriasIds: Array.from(categoriasSecretaria),
      });
      setNomeSecretaria('');
      setCategoriasSecretaria(new Set());
      setFeedback('Secretaria criada com sucesso.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function salvarSecretaria() {
    if (!secretariaEditando || nomeEditando.trim().length < 3) return;

    setIsSaving(true);
    setErro(null);

    try {
      await organizacaoService.atualizar(secretariaEditando.id, {
        nome: nomeEditando.trim(),
        cidade: secretariaEditando.cidade,
        estado: secretariaEditando.estado,
        verificada: secretariaEditando.verificada,
      });
      setSecretariaEditando(null);
      setFeedback('Secretaria atualizada.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function alterarSecretariaAtiva(secretaria: OrganizacaoResponseDTO) {
    setIsSaving(true);
    setErro(null);

    try {
      await organizacaoService.alterarAtiva(secretaria.id, !secretaria.ativa);
      setFeedback(secretaria.ativa ? 'Secretaria desativada.' : 'Secretaria ativada.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function salvarCategoriasSecretaria() {
    if (!secretariaCategoriasEditando) return;

    setIsSaving(true);
    setErro(null);

    try {
      await organizacaoService.atualizarCategoriasSecretaria(secretariaCategoriasEditando.id, {
        categoriasIds: Array.from(categoriasEditando),
      });
      setSecretariaCategoriasEditando(null);
      setFeedback('Categorias da secretaria atualizadas.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function criarOperador() {
    if (!organizacaoUsuarioId || nomeUsuario.trim().length < 3 || senhaUsuario.length < 8) return;

    setIsSaving(true);
    setErro(null);

    try {
      await organizacaoService.criarUsuarioInstitucional(Number(organizacaoUsuarioId), {
        nome: nomeUsuario.trim(),
        email: emailUsuario.trim(),
        username: usernameUsuario.trim(),
        senha: senhaUsuario,
        telefone: telefoneUsuario.trim() || null,
      });

      setNomeUsuario('');
      setEmailUsuario('');
      setUsernameUsuario('');
      setSenhaUsuario('');
      setTelefoneUsuario('');
      setFeedback('Operador criado e vinculado a secretaria.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function alterarVinculoAtivo(vinculo: VinculoUsuarioOrganizacaoResponseDTO) {
    setIsSaving(true);
    setErro(null);

    try {
      await vinculoService.atualizar(vinculo.id, {
        ativo: !vinculo.ativo,
      });
      setFeedback(vinculo.ativo ? 'Vinculo desativado.' : 'Vinculo ativado.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function moverVinculo() {
    if (!vinculoMovendo || !destinoMovimento) return;

    setIsSaving(true);
    setErro(null);

    try {
      await vinculoService.transferirSecretaria(vinculoMovendo.id, {
        secretariaDestinoId: Number(destinoMovimento),
      });
      setVinculoMovendo(null);
      setDestinoMovimento('');
      setFeedback('Operador transferido para outra secretaria.');
      await carregarDados();
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Carregando administracao da prefeitura...
        </Card>
      </div>
    );
  }

  if (!prefeituraId || !prefeitura) {
    return (
      <div className="p-4 md:p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold">Administracao</h2>
          <p className="mt-2 text-sm text-red-600">{erro ?? 'Prefeitura nao encontrada para seu vinculo atual.'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Administracao da prefeitura</h1>
          <p className="text-sm text-muted-foreground">
            {prefeitura.nome} - {prefeitura.cidade}/{prefeitura.estado}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={carregarDados} disabled={isSaving}>
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {(erro || feedback) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {erro || feedback}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-5 w-5 text-primary" />
              Nova secretaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Nome</Label>
              <Input
                value={nomeSecretaria}
                onChange={(event) => setNomeSecretaria(event.target.value)}
                placeholder="Ex.: Secretaria de Infraestrutura"
                className="border-border bg-background/80 shadow-sm"
              />
            </div>
            <div>
              <Label className="mb-2 block">Categorias atendidas</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {categorias.map((categoria) => (
                  <label key={categoria.id} className="flex items-center gap-2 rounded-lg border border-border bg-background/80 p-3 text-sm shadow-sm">
                    <Checkbox
                      checked={categoriasSecretaria.has(categoria.id)}
                      onCheckedChange={() => alternarCategoria(categoria.id)}
                    />
                    <span>{categoria.nome}</span>
                  </label>
                ))}
              </div>
              {categorias.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma categoria ativa cadastrada.</p>
              )}
            </div>
            <Button className="w-full gap-2" onClick={criarSecretaria} disabled={isSaving || nomeSecretaria.trim().length < 3}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar secretaria
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Novo operador de secretaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block">Secretaria</Label>
                <Select value={organizacaoUsuarioId} onValueChange={setOrganizacaoUsuarioId}>
                  <SelectTrigger className="border-border bg-background/80 shadow-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {secretarias.filter((secretaria) => secretaria.ativa).map((secretaria) => (
                      <SelectItem key={secretaria.id} value={String(secretaria.id)}>
                        {secretaria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input value={nomeUsuario} onChange={(event) => setNomeUsuario(event.target.value)} placeholder="Nome completo" className="border-border bg-background/80 shadow-sm" />
              <Input value={usernameUsuario} onChange={(event) => setUsernameUsuario(event.target.value)} placeholder="Username" className="border-border bg-background/80 shadow-sm" />
              <Input value={emailUsuario} onChange={(event) => setEmailUsuario(event.target.value)} type="email" placeholder="E-mail institucional" className="border-border bg-background/80 shadow-sm" />
              <Input value={telefoneUsuario} onChange={(event) => setTelefoneUsuario(event.target.value)} placeholder="Telefone opcional" className="border-border bg-background/80 shadow-sm" />
            </div>
            <Input
              value={senhaUsuario}
              onChange={(event) => setSenhaUsuario(event.target.value)}
              type="password"
              placeholder="Senha temporaria com no minimo 8 caracteres"
              className="border-border bg-background/80 shadow-sm"
            />
            <Button
              className="w-full gap-2"
              onClick={criarOperador}
              disabled={
                isSaving ||
                !organizacaoUsuarioId ||
                nomeUsuario.trim().length < 3 ||
                !emailUsuario.trim() ||
                !usernameUsuario.trim() ||
                senhaUsuario.length < 8
              }
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar operador
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-primary" />
            Secretarias
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {secretarias.map((secretaria) => (
            <div key={secretaria.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{secretaria.nome}</h3>
                  <p className="text-sm text-muted-foreground">{secretaria.cidade}/{secretaria.estado}</p>
                </div>
                <Badge className={secretaria.ativa ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                  {secretaria.ativa ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setSecretariaEditando(secretaria);
                    setNomeEditando(secretaria.nome);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => abrirCategoriasSecretaria(secretaria)}
                >
                  <Building2 className="h-4 w-4" />
                  Categorias
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => alterarSecretariaAtiva(secretaria)}
                  disabled={isSaving}
                >
                  {secretaria.ativa ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  {secretaria.ativa ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          ))}
          {secretarias.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma secretaria cadastrada para esta prefeitura.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            Operadores institucionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizacoesDoEscopo.map((organizacao) => {
            const usuarios = vinculosPorOrganizacao[organizacao.id] ?? [];

            return (
              <section key={organizacao.id} className="rounded-lg border border-border">
                <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{organizacao.nome}</h3>
                    <p className="text-xs text-muted-foreground">
                      {organizacao.tipo === 'PREFEITURA' ? 'Prefeitura' : 'Secretaria'}
                    </p>
                  </div>
                  <Badge variant="secondary">{usuarios.length} vinculos</Badge>
                </div>
                <div className="divide-y divide-border">
                  {usuarios.map((vinculo) => (
                    <div key={vinculo.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-foreground">{vinculo.nomeUsuario}</p>
                        <p className="text-sm text-muted-foreground">{papelLabel(vinculo, organizacao)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={vinculo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {vinculo.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {organizacao.tipo === 'SECRETARIA' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              setVinculoMovendo(vinculo);
                              setDestinoMovimento('');
                            }}
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                            Mover
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => alterarVinculoAtivo(vinculo)}
                          disabled={isSaving}
                        >
                          {vinculo.ativo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          {vinculo.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {usuarios.length === 0 && (
                    <p className="px-4 py-4 text-sm text-muted-foreground">Nenhum operador vinculado.</p>
                  )}
                </div>
              </section>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={Boolean(secretariaEditando)} onOpenChange={(open) => !open && setSecretariaEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar secretaria</DialogTitle>
            <DialogDescription>Atualize o nome exibido para esta secretaria.</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="mb-2 block">Nome</Label>
            <Input value={nomeEditando} onChange={(event) => setNomeEditando(event.target.value)} className="border-border bg-background/80 shadow-sm" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecretariaEditando(null)}>Cancelar</Button>
            <Button onClick={salvarSecretaria} disabled={isSaving || nomeEditando.trim().length < 3}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(secretariaCategoriasEditando)} onOpenChange={(open) => !open && setSecretariaCategoriasEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorias atendidas</DialogTitle>
            <DialogDescription>
              Defina quais categorias serao encaminhadas por padrao para {secretariaCategoriasEditando?.nome}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center gap-2 rounded-lg border border-border bg-background/80 p-3 text-sm shadow-sm">
                <Checkbox
                  checked={categoriasEditando.has(categoria.id)}
                  onCheckedChange={() => alternarCategoriaEditando(categoria.id)}
                />
                <span>{categoria.nome}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecretariaCategoriasEditando(null)}>Cancelar</Button>
            <Button onClick={salvarCategoriasSecretaria} disabled={isSaving}>Salvar categorias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(vinculoMovendo)} onOpenChange={(open) => !open && setVinculoMovendo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover operador</DialogTitle>
            <DialogDescription>
              O vinculo atual sera transferido para outra secretaria da mesma prefeitura.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="mb-2 block">Secretaria de destino</Label>
            <Select value={destinoMovimento} onValueChange={setDestinoMovimento}>
              <SelectTrigger className="border-border bg-background/80 shadow-sm">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {secretarias
                  .filter((secretaria) => secretaria.ativa && secretaria.id !== vinculoMovendo?.organizacaoId)
                  .map((secretaria) => (
                    <SelectItem key={secretaria.id} value={String(secretaria.id)}>
                      {secretaria.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVinculoMovendo(null)}>Cancelar</Button>
            <Button onClick={moverVinculo} disabled={isSaving || !destinoMovimento}>Mover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
