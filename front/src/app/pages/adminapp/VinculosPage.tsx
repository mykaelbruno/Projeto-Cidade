import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Briefcase, Edit, Link2, Power, Search, UserPlus } from 'lucide-react';
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
import { organizacaoService } from '../../services/organizacaoService';
import { vinculoService } from '../../services/vinculoService';
import type { OrganizacaoResponseDTO } from '../../types/organizacao';
import type { PapelUsuario, VinculoUsuarioOrganizacaoResponseDTO } from '../../types/vinculo';

type PapelFiltro = PapelUsuario | 'TODOS';
type StatusFiltro = 'TODOS' | 'ATIVO' | 'INATIVO';
type TipoFiltro = 'TODOS' | 'PREFEITURA' | 'SECRETARIA';

interface UsuarioInstitucionalFormState {
  organizacaoId: string;
  nome: string;
  email: string;
  username: string;
  senha: string;
  telefone: string;
}

interface VinculoExistenteFormState {
  usuarioId: string;
  organizacaoId: string;
  ativo: boolean;
}

const emptyUsuarioInstitucionalForm: UsuarioInstitucionalFormState = {
  organizacaoId: '',
  nome: '',
  email: '',
  username: '',
  senha: '',
  telefone: '',
};

const emptyVinculoExistenteForm: VinculoExistenteFormState = {
  usuarioId: '',
  organizacaoId: '',
  ativo: true,
};

const papelLabels: Record<PapelUsuario, string> = {
  PREFEITURA: 'Prefeitura',
  SECRETARIA: 'Secretaria',
};

const papelColors: Record<PapelUsuario, string> = {
  PREFEITURA: 'bg-purple-100 text-purple-700',
  SECRETARIA: 'bg-indigo-100 text-indigo-700',
};

export function VinculosPage() {
  const [vinculos, setVinculos] = useState<VinculoUsuarioOrganizacaoResponseDTO[]>([]);
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [papelFilter, setPapelFilter] = useState<PapelFiltro>('TODOS');
  const [statusFilter, setStatusFilter] = useState<StatusFiltro>('TODOS');
  const [tipoFilter, setTipoFilter] = useState<TipoFiltro>('TODOS');
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  const [modalUsuarioAberto, setModalUsuarioAberto] = useState(false);
  const [novoUsuarioForm, setNovoUsuarioForm] =
    useState<UsuarioInstitucionalFormState>(emptyUsuarioInstitucionalForm);
  const [modalVinculoExistenteAberto, setModalVinculoExistenteAberto] = useState(false);
  const [vinculoExistenteForm, setVinculoExistenteForm] =
    useState<VinculoExistenteFormState>(emptyVinculoExistenteForm);
  const [vinculoEditando, setVinculoEditando] =
    useState<VinculoUsuarioOrganizacaoResponseDTO | null>(null);
  const [ativoEditando, setAtivoEditando] = useState(true);
  const [vinculoTransferindo, setVinculoTransferindo] =
    useState<VinculoUsuarioOrganizacaoResponseDTO | null>(null);
  const [secretariaDestinoId, setSecretariaDestinoId] = useState('');

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [vinculosResponse, organizacoesResponse] = await Promise.all([
        vinculoService.listar(),
        organizacaoService.listar(),
      ]);
      setVinculos(vinculosResponse);
      setOrganizacoes(organizacoesResponse);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar vinculos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const organizacaoMap = useMemo(() => {
    return new Map(organizacoes.map((organizacao) => [organizacao.id, organizacao]));
  }, [organizacoes]);

  const organizacoesAtivas = useMemo(
    () => organizacoes.filter((organizacao) => organizacao.ativa),
    [organizacoes],
  );

  const vinculosFiltrados = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return vinculos.filter((vinculo) => {
      const organizacao = organizacaoMap.get(vinculo.organizacaoId);
      const matchesSearch =
        !termo ||
        String(vinculo.id).includes(termo) ||
        String(vinculo.usuarioId).includes(termo) ||
        vinculo.nomeUsuario.toLowerCase().includes(termo) ||
        vinculo.nomeOrganizacao.toLowerCase().includes(termo);

      const matchesPapel = papelFilter === 'TODOS' || vinculo.papel === papelFilter;
      const matchesStatus =
        statusFilter === 'TODOS' ||
        (statusFilter === 'ATIVO' && vinculo.ativo) ||
        (statusFilter === 'INATIVO' && !vinculo.ativo);
      const matchesTipo = tipoFilter === 'TODOS' || organizacao?.tipo === tipoFilter;

      return matchesSearch && matchesPapel && matchesStatus && matchesTipo;
    });
  }, [organizacaoMap, papelFilter, searchTerm, statusFilter, tipoFilter, vinculos]);

  const secretariasDestino = useMemo(() => {
    if (!vinculoTransferindo) return [];
    const origem = organizacaoMap.get(vinculoTransferindo.organizacaoId);
    if (!origem || origem.tipo !== 'SECRETARIA' || !origem.organizacaoPaiId) return [];

    return organizacoes.filter(
      (organizacao) =>
        organizacao.ativa &&
        organizacao.tipo === 'SECRETARIA' &&
        organizacao.organizacaoPaiId === origem.organizacaoPaiId &&
        organizacao.id !== origem.id,
    );
  }, [organizacaoMap, organizacoes, vinculoTransferindo]);

  async function criarUsuarioInstitucional() {
    if (!novoUsuarioForm.organizacaoId) return;
    setProcessando(true);
    setErro(null);

    try {
      await organizacaoService.criarUsuarioInstitucional(Number(novoUsuarioForm.organizacaoId), {
        nome: novoUsuarioForm.nome.trim(),
        email: novoUsuarioForm.email.trim(),
        username: novoUsuarioForm.username.trim(),
        senha: novoUsuarioForm.senha,
        telefone: novoUsuarioForm.telefone.trim() || null,
      });
      setFeedback('Usuario institucional criado e vinculado com sucesso.');
      setModalUsuarioAberto(false);
      setNovoUsuarioForm(emptyUsuarioInstitucionalForm);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel criar usuario institucional.');
    } finally {
      setProcessando(false);
    }
  }

  async function criarVinculoExistente() {
    if (!vinculoExistenteForm.usuarioId || !vinculoExistenteForm.organizacaoId) return;
    setProcessando(true);
    setErro(null);

    try {
      await vinculoService.criar({
        usuarioId: Number(vinculoExistenteForm.usuarioId),
        organizacaoId: Number(vinculoExistenteForm.organizacaoId),
        ativo: vinculoExistenteForm.ativo,
      });
      setFeedback('Usuario existente vinculado com sucesso.');
      setModalVinculoExistenteAberto(false);
      setVinculoExistenteForm(emptyVinculoExistenteForm);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel criar o vinculo.');
    } finally {
      setProcessando(false);
    }
  }

  function abrirEdicao(vinculo: VinculoUsuarioOrganizacaoResponseDTO) {
    setVinculoEditando(vinculo);
    setAtivoEditando(vinculo.ativo);
  }

  async function salvarEdicaoVinculo() {
    if (!vinculoEditando) return;
    setProcessando(true);
    setErro(null);

    try {
      await vinculoService.atualizar(vinculoEditando.id, {
        ativo: ativoEditando,
      });
      setFeedback('Vinculo atualizado com sucesso.');
      setVinculoEditando(null);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel atualizar o vinculo.');
    } finally {
      setProcessando(false);
    }
  }

  async function alternarAtivacao(vinculo: VinculoUsuarioOrganizacaoResponseDTO) {
    setProcessando(true);
    setErro(null);

    try {
      await vinculoService.atualizar(vinculo.id, {
        ativo: !vinculo.ativo,
      });
      setFeedback(vinculo.ativo ? 'Vinculo inativado.' : 'Vinculo ativado.');
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel alterar o vinculo.');
    } finally {
      setProcessando(false);
    }
  }

  function abrirTransferencia(vinculo: VinculoUsuarioOrganizacaoResponseDTO) {
    setVinculoTransferindo(vinculo);
    setSecretariaDestinoId('');
  }

  async function transferirVinculo() {
    if (!vinculoTransferindo || !secretariaDestinoId) return;
    setProcessando(true);
    setErro(null);

    try {
      await vinculoService.transferirSecretaria(vinculoTransferindo.id, {
        secretariaDestinoId: Number(secretariaDestinoId),
      });
      setFeedback('Vinculo transferido para outra secretaria.');
      setVinculoTransferindo(null);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel transferir o vinculo.');
    } finally {
      setProcessando(false);
    }
  }

  const totalAtivos = vinculos.filter((vinculo) => vinculo.ativo).length;
  const totalPrefeitura = vinculos.filter((vinculo) => vinculo.papel === 'PREFEITURA').length;
  const totalSecretarias = vinculos.filter((vinculo) => vinculo.papel === 'SECRETARIA').length;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Vinculos Institucionais</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie acessos institucionais de usuarios a prefeituras e secretarias.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="gap-2" onClick={() => setModalVinculoExistenteAberto(true)}>
            <Link2 className="h-4 w-4" />
            Vincular existente
          </Button>
          <Button className="gap-2" onClick={() => setModalUsuarioAberto(true)}>
            <UserPlus className="h-4 w-4" />
            Novo usuario institucional
          </Button>
        </div>
      </div>

      {(erro || feedback) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {erro || feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Total de vinculos" value={vinculos.length} icon={<Link2 className="h-5 w-5" />} tone="bg-blue-100 text-blue-700" />
        <StatCard label="Vinculos ativos" value={totalAtivos} icon={<Link2 className="h-5 w-5" />} tone="bg-green-100 text-green-700" />
        <StatCard label="Vinculos prefeitura" value={totalPrefeitura} icon={<Link2 className="h-5 w-5" />} tone="bg-purple-100 text-purple-700" />
        <StatCard label="Vinculos secretaria" value={totalSecretarias} icon={<Briefcase className="h-5 w-5" />} tone="bg-indigo-100 text-indigo-700" />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por ID, usuario ou organizacao..."
                className="pl-9"
              />
            </div>
            <Select value={papelFilter} onValueChange={(value) => setPapelFilter(value as PapelFiltro)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os papeis</SelectItem>
                <SelectItem value="PREFEITURA">Prefeitura</SelectItem>
                <SelectItem value="SECRETARIA">Secretaria</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFiltro)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="ATIVO">Ativos</SelectItem>
                <SelectItem value="INATIVO">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value as TipoFiltro)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os tipos</SelectItem>
                <SelectItem value="PREFEITURA">Prefeitura</SelectItem>
                <SelectItem value="SECRETARIA">Secretaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        {carregando ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando vinculos...</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Organizacao</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Papel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vinculosFiltrados.map((vinculo) => (
                    <VinculoRow
                      key={vinculo.id}
                      vinculo={vinculo}
                      organizacao={organizacaoMap.get(vinculo.organizacaoId)}
                      processando={processando}
                      onEdit={() => abrirEdicao(vinculo)}
                      onActivation={() => alternarAtivacao(vinculo)}
                      onTransfer={() => abrirTransferencia(vinculo)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-border md:hidden">
              {vinculosFiltrados.map((vinculo) => (
                <VinculoMobileCard
                  key={vinculo.id}
                  vinculo={vinculo}
                  organizacao={organizacaoMap.get(vinculo.organizacaoId)}
                  processando={processando}
                  onEdit={() => abrirEdicao(vinculo)}
                  onActivation={() => alternarAtivacao(vinculo)}
                  onTransfer={() => abrirTransferencia(vinculo)}
                />
              ))}
            </div>

            {vinculosFiltrados.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">Nenhum vinculo encontrado.</div>
            )}
          </>
        )}
        <div className="border-t border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Desativar vinculo nao desativa a conta do usuario. Usuarios existentes so podem receber vinculo quando estao ativos, possuem perfil MORADOR e nao tem outro vinculo institucional ativo.
          </p>
        </div>
      </Card>

      <Dialog open={modalVinculoExistenteAberto} onOpenChange={setModalVinculoExistenteAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular usuario existente</DialogTitle>
            <DialogDescription>
              Informe o ID de um usuario morador ativo. O tipo do vinculo sera definido automaticamente pela organizacao escolhida.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">ID do usuario</Label>
              <Input
                type="number"
                min={1}
                value={vinculoExistenteForm.usuarioId}
                onChange={(event) =>
                  setVinculoExistenteForm((current) => ({ ...current, usuarioId: event.target.value }))
                }
                placeholder="Ex: 10"
              />
            </div>

            <div>
              <Label className="mb-2 block">Organizacao</Label>
              <Select
                value={vinculoExistenteForm.organizacaoId}
                onValueChange={(value) =>
                  setVinculoExistenteForm((current) => ({ ...current, organizacaoId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a organizacao" />
                </SelectTrigger>
                <SelectContent>
                  {organizacoesAtivas.map((organizacao) => (
                    <SelectItem key={organizacao.id} value={String(organizacao.id)}>
                      {organizacao.nome} ({organizacao.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={vinculoExistenteForm.ativo}
                onChange={(event) =>
                  setVinculoExistenteForm((current) => ({ ...current, ativo: event.target.checked }))
                }
              />
              Criar vinculo ativo
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalVinculoExistenteAberto(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                processando ||
                !vinculoExistenteForm.usuarioId ||
                Number(vinculoExistenteForm.usuarioId) <= 0 ||
                !vinculoExistenteForm.organizacaoId
              }
              onClick={criarVinculoExistente}
            >
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalUsuarioAberto} onOpenChange={setModalUsuarioAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo usuario institucional</DialogTitle>
            <DialogDescription>
              Cria uma nova conta institucional ja vinculada a uma prefeitura ou secretaria.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="mb-2 block">Organizacao</Label>
              <Select
                value={novoUsuarioForm.organizacaoId}
                onValueChange={(value) =>
                  setNovoUsuarioForm((current) => ({ ...current, organizacaoId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a organizacao" />
                </SelectTrigger>
                <SelectContent>
                  {organizacoesAtivas.map((organizacao) => (
                    <SelectItem key={organizacao.id} value={String(organizacao.id)}>
                      {organizacao.nome} ({organizacao.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field label="Nome" value={novoUsuarioForm.nome} onChange={(value) => setNovoUsuarioForm((current) => ({ ...current, nome: value }))} />
            <Field label="Username" value={novoUsuarioForm.username} onChange={(value) => setNovoUsuarioForm((current) => ({ ...current, username: value }))} />
            <Field label="Email" value={novoUsuarioForm.email} onChange={(value) => setNovoUsuarioForm((current) => ({ ...current, email: value }))} />
            <Field label="Senha inicial" type="password" value={novoUsuarioForm.senha} onChange={(value) => setNovoUsuarioForm((current) => ({ ...current, senha: value }))} />
            <Field label="Telefone" value={novoUsuarioForm.telefone} onChange={(value) => setNovoUsuarioForm((current) => ({ ...current, telefone: value }))} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalUsuarioAberto(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                processando ||
                !novoUsuarioForm.organizacaoId ||
                !novoUsuarioForm.nome.trim() ||
                !novoUsuarioForm.email.trim() ||
                !novoUsuarioForm.username.trim() ||
                novoUsuarioForm.senha.length < 8
              }
              onClick={criarUsuarioInstitucional}
            >
              Criar e vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vinculoEditando !== null} onOpenChange={(open) => !open && setVinculoEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar vinculo</DialogTitle>
            <DialogDescription>{vinculoEditando?.nomeUsuario}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Papel institucional</Label>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                {vinculoEditando ? papelLabels[vinculoEditando.papel] : '-'}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ativoEditando}
                onChange={(event) => setAtivoEditando(event.target.checked)}
              />
              Vinculo ativo
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVinculoEditando(null)}>
              Cancelar
            </Button>
            <Button disabled={processando} onClick={salvarEdicaoVinculo}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vinculoTransferindo !== null} onOpenChange={(open) => !open && setVinculoTransferindo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir para outra secretaria</DialogTitle>
            <DialogDescription>{vinculoTransferindo?.nomeUsuario}</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="mb-2 block">Secretaria de destino</Label>
            <Select value={secretariaDestinoId} onValueChange={setSecretariaDestinoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a secretaria" />
              </SelectTrigger>
              <SelectContent>
                {secretariasDestino.map((secretaria) => (
                  <SelectItem key={secretaria.id} value={String(secretaria.id)}>
                    {secretaria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {secretariasDestino.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Nao ha outra secretaria ativa na mesma prefeitura para receber este vinculo.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVinculoTransferindo(null)}>
              Cancelar
            </Button>
            <Button disabled={processando || !secretariaDestinoId} onClick={transferirVinculo}>
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function canTransferir(vinculo: VinculoUsuarioOrganizacaoResponseDTO, organizacao?: OrganizacaoResponseDTO) {
  return Boolean(
    organizacao &&
      organizacao.tipo === 'SECRETARIA' &&
      organizacao.organizacaoPaiId &&
      vinculo.papel === 'SECRETARIA',
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`rounded-lg p-2.5 ${tone}`}>{icon}</div>
        <div>
          <div className="text-2xl font-display font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function VinculoRow({
  vinculo,
  organizacao,
  processando,
  onEdit,
  onActivation,
  onTransfer,
}: {
  vinculo: VinculoUsuarioOrganizacaoResponseDTO;
  organizacao?: OrganizacaoResponseDTO;
  processando: boolean;
  onEdit: () => void;
  onActivation: () => void;
  onTransfer: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-muted/50">
      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">#{vinculo.id}</td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {vinculo.nomeUsuario}
        <span className="block text-xs text-muted-foreground">Usuario #{vinculo.usuarioId}</span>
      </td>
      <td className="px-4 py-3 text-sm text-foreground">{vinculo.nomeOrganizacao}</td>
      <td className="px-4 py-3">
        <Badge className={organizacao?.tipo === 'PREFEITURA' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}>
          {organizacao?.tipo ?? 'Organizacao'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge className={papelColors[vinculo.papel]}>{papelLabels[vinculo.papel]}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge className={vinculo.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {vinculo.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit} disabled={processando} title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onActivation} disabled={processando} title="Ativar/Inativar">
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onTransfer}
            disabled={processando || !canTransferir(vinculo, organizacao)}
            title="Transferir secretaria"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function VinculoMobileCard(props: Parameters<typeof VinculoRow>[0]) {
  const { vinculo, organizacao, processando, onEdit, onActivation, onTransfer } = props;

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-foreground">{vinculo.nomeUsuario}</h3>
          <p className="text-xs text-muted-foreground">#{vinculo.id} - Usuario #{vinculo.usuarioId}</p>
        </div>
        <Badge className={vinculo.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {vinculo.ativo ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{vinculo.nomeOrganizacao}</p>
      <div className="flex flex-wrap gap-2">
        <Badge className={papelColors[vinculo.papel]}>{papelLabels[vinculo.papel]}</Badge>
        <Badge className={organizacao?.tipo === 'PREFEITURA' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}>
          {organizacao?.tipo ?? 'Organizacao'}
        </Badge>
      </div>
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit} disabled={processando}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onActivation} disabled={processando}>
          <Power className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onTransfer} disabled={processando || !canTransferir(vinculo, organizacao)}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
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
