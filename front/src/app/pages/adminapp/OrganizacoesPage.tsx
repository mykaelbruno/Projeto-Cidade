import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Edit,
  MapPin,
  Power,
  Search,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
import { categoriaService } from '../../services/categoriaService';
import { organizacaoService } from '../../services/organizacaoService';
import type { CategoriaResponseDTO } from '../../types/categoria';
import type { OrganizacaoResponseDTO, TipoOrganizacao } from '../../types/organizacao';

interface OrganizacaoFormState {
  nome: string;
  cidade: string;
  estado: string;
  verificada: boolean;
  prefeituraId: string;
  categoriasIds: string[];
}

const emptyForm: OrganizacaoFormState = {
  nome: '',
  cidade: '',
  estado: 'PB',
  verificada: true,
  prefeituraId: '',
  categoriasIds: [],
};

export function OrganizacoesPage() {
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResponseDTO[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [modalTipo, setModalTipo] = useState<TipoOrganizacao | 'EDITAR' | null>(null);
  const [organizacaoEditando, setOrganizacaoEditando] = useState<OrganizacaoResponseDTO | null>(null);
  const [form, setForm] = useState<OrganizacaoFormState>(emptyForm);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [organizacoesResponse, categoriasResponse] = await Promise.all([
        organizacaoService.listar(),
        categoriaService.listar(),
      ]);
      setOrganizacoes(organizacoesResponse);
      setCategorias(categoriasResponse.filter((categoria) => categoria.ativa));
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar organizacoes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const prefeituras = useMemo(
    () => organizacoes.filter((organizacao) => organizacao.tipo === 'PREFEITURA'),
    [organizacoes],
  );

  const secretariasPorPrefeitura = useMemo(() => {
    const mapa = new Map<number, OrganizacaoResponseDTO[]>();
    organizacoes
      .filter((organizacao) => organizacao.tipo === 'SECRETARIA')
      .forEach((secretaria) => {
        if (!secretaria.organizacaoPaiId) return;
        mapa.set(secretaria.organizacaoPaiId, [...(mapa.get(secretaria.organizacaoPaiId) ?? []), secretaria]);
      });
    return mapa;
  }, [organizacoes]);

  const prefeiturasFiltradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();
    if (!termo) return prefeituras;

    return prefeituras.filter((prefeitura) => {
      const secretarias = secretariasPorPrefeitura.get(prefeitura.id) ?? [];
      return (
        prefeitura.nome.toLowerCase().includes(termo) ||
        prefeitura.cidade.toLowerCase().includes(termo) ||
        prefeitura.estado.toLowerCase().includes(termo) ||
        secretarias.some((secretaria) => secretaria.nome.toLowerCase().includes(termo))
      );
    });
  }, [prefeituras, searchTerm, secretariasPorPrefeitura]);

  function toggleExpanded(id: number) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function abrirCriacao(tipo: TipoOrganizacao) {
    setOrganizacaoEditando(null);
    setForm(emptyForm);
    setModalTipo(tipo);
  }

  function abrirEdicao(organizacao: OrganizacaoResponseDTO) {
    setOrganizacaoEditando(organizacao);
    setForm({
      nome: organizacao.nome,
      cidade: organizacao.cidade,
      estado: organizacao.estado,
      verificada: organizacao.verificada,
      prefeituraId: organizacao.organizacaoPaiId ? String(organizacao.organizacaoPaiId) : '',
      categoriasIds:
        organizacao.tipo === 'SECRETARIA'
          ? categorias
              .filter((categoria) => categoria.organizacaoResponsavelPadraoId === organizacao.id)
              .map((categoria) => String(categoria.id))
          : [],
    });
    setModalTipo('EDITAR');
  }

  async function salvarOrganizacao() {
    setProcessando(true);
    setErro(null);

    try {
      if (modalTipo === 'PREFEITURA') {
        await organizacaoService.criarPrefeitura({
          nome: form.nome.trim(),
          cidade: form.cidade.trim(),
          estado: form.estado.trim().toUpperCase(),
          verificada: form.verificada,
        });
        setFeedback('Prefeitura criada com sucesso.');
      }

      if (modalTipo === 'SECRETARIA') {
        await organizacaoService.criarSecretaria(Number(form.prefeituraId), {
          nome: form.nome.trim(),
          categoriasIds: form.categoriasIds.map(Number),
        });
        setFeedback('Secretaria criada com sucesso.');
      }

      if (modalTipo === 'EDITAR' && organizacaoEditando) {
        await organizacaoService.atualizar(organizacaoEditando.id, {
          nome: form.nome.trim(),
          cidade: form.cidade.trim(),
          estado: form.estado.trim().toUpperCase(),
          verificada: form.verificada,
        });
        if (organizacaoEditando.tipo === 'SECRETARIA') {
          await organizacaoService.atualizarCategoriasSecretaria(organizacaoEditando.id, {
            categoriasIds: form.categoriasIds.map(Number),
          });
        }
        setFeedback('Organizacao atualizada com sucesso.');
      }

      setModalTipo(null);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel salvar a organizacao.');
    } finally {
      setProcessando(false);
    }
  }

  async function alternarAtivacao(organizacao: OrganizacaoResponseDTO) {
    setProcessando(true);
    setErro(null);

    try {
      await organizacaoService.alterarAtiva(organizacao.id, !organizacao.ativa);
      setFeedback(organizacao.ativa ? 'Organizacao inativada.' : 'Organizacao ativada.');
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel alterar a ativacao.');
    } finally {
      setProcessando(false);
    }
  }

  function toggleCategoria(id: number) {
    const value = String(id);
    setForm((current) => ({
      ...current,
      categoriasIds: current.categoriasIds.includes(value)
        ? current.categoriasIds.filter((categoriaId) => categoriaId !== value)
        : [...current.categoriasIds, value],
    }));
  }

  const totalSecretarias = organizacoes.filter((organizacao) => organizacao.tipo === 'SECRETARIA').length;
  const totalAtivas = organizacoes.filter((organizacao) => organizacao.ativa).length;
  const editandoSecretaria = modalTipo === 'EDITAR' && organizacaoEditando?.tipo === 'SECRETARIA';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Gestao de Organizacoes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administre prefeituras e secretarias cadastradas na plataforma.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2" onClick={() => abrirCriacao('SECRETARIA')}>
            <Briefcase className="w-4 h-4" />
            Nova Secretaria
          </Button>
          <Button className="gap-2" onClick={() => abrirCriacao('PREFEITURA')}>
            <Building2 className="w-4 h-4" />
            Nova Prefeitura
          </Button>
        </div>
      </div>

      {(erro || feedback) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {erro || feedback}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Prefeituras" value={prefeituras.length} icon={<Building2 className="w-5 h-5" />} tone="bg-purple-100 text-purple-700" />
        <StatCard label="Secretarias" value={totalSecretarias} icon={<Briefcase className="w-5 h-5" />} tone="bg-indigo-100 text-indigo-700" />
        <StatCard label="Organizacoes ativas" value={totalAtivas} icon={<Check className="w-5 h-5" />} tone="bg-green-100 text-green-700" />
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar prefeitura, secretaria, cidade ou UF..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando organizacoes...</div>
        ) : (
          <div className="divide-y divide-border">
            {prefeiturasFiltradas.map((prefeitura) => {
              const secretarias = secretariasPorPrefeitura.get(prefeitura.id) ?? [];
              const expanded = expandedIds.has(prefeitura.id);

              return (
                <div key={prefeitura.id}>
                  <OrganizationRow
                    organizacao={prefeitura}
                    icon={<Building2 className="w-5 h-5" />}
                    iconTone="bg-purple-100 text-purple-700"
                    expanded={expanded}
                    showToggle
                    subtitle={`${prefeitura.cidade}/${prefeitura.estado} - ${secretarias.length} secretarias`}
                    onToggle={() => toggleExpanded(prefeitura.id)}
                    onEdit={() => abrirEdicao(prefeitura)}
                    onActivation={() => alternarAtivacao(prefeitura)}
                    disabled={processando}
                  />
                  {expanded && (
                    <div className="bg-muted/30 border-t border-border">
                      {secretarias.length === 0 && (
                        <div className="p-4 pl-16 text-sm text-muted-foreground">
                          Nenhuma secretaria cadastrada para esta prefeitura.
                        </div>
                      )}
                      {secretarias.map((secretaria) => (
                        <OrganizationRow
                          key={secretaria.id}
                          organizacao={secretaria}
                          icon={<Briefcase className="w-4 h-4" />}
                          iconTone="bg-indigo-100 text-indigo-700"
                          subtitle={`${secretaria.cidade}/${secretaria.estado}`}
                          indent
                          onEdit={() => abrirEdicao(secretaria)}
                          onActivation={() => alternarAtivacao(secretaria)}
                          disabled={processando}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {prefeiturasFiltradas.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma organizacao encontrada.
              </div>
            )}
          </div>
        )}
      </Card>

      <Dialog open={modalTipo !== null} onOpenChange={(open) => !open && setModalTipo(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalTipo === 'PREFEITURA' && 'Nova Prefeitura'}
              {modalTipo === 'SECRETARIA' && 'Nova Secretaria'}
              {modalTipo === 'EDITAR' && 'Editar Organizacao'}
            </DialogTitle>
            <DialogDescription>
              {modalTipo === 'SECRETARIA' || editandoSecretaria
                ? 'Defina os dados da secretaria e as categorias atendidas por ela.'
                : 'Preencha os dados principais da organizacao.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {modalTipo === 'SECRETARIA' && (
              <div>
                <Label className="mb-2 block">Prefeitura responsavel</Label>
                <Select value={form.prefeituraId} onValueChange={(value) => setForm((current) => ({ ...current, prefeituraId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prefeitura" />
                  </SelectTrigger>
                  <SelectContent>
                    {prefeituras.map((prefeitura) => (
                      <SelectItem key={prefeitura.id} value={String(prefeitura.id)}>
                        {prefeitura.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="mb-2 block">Nome</Label>
              <Input value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} />
            </div>

            {modalTipo !== 'SECRETARIA' && !editandoSecretaria && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block">Cidade</Label>
                  <Input value={form.cidade} onChange={(event) => setForm((current) => ({ ...current, cidade: event.target.value }))} />
                </div>
                <div>
                  <Label className="mb-2 block">UF</Label>
                  <Input
                    value={form.estado}
                    maxLength={2}
                    onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
            )}

            {(modalTipo === 'SECRETARIA' || editandoSecretaria) && (
              <div>
                <Label className="mb-2 block">Categorias atendidas</Label>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border p-3 space-y-2">
                  {categorias.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma categoria ativa disponivel.</p>
                  )}
                  {categorias.map((categoria) => (
                    <label key={categoria.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.categoriasIds.includes(String(categoria.id))}
                        onChange={() => toggleCategoria(categoria.id)}
                      />
                      {categoria.nome}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {modalTipo !== 'SECRETARIA' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.verificada}
                  onChange={(event) => setForm((current) => ({ ...current, verificada: event.target.checked }))}
                />
                Organizacao verificada
              </label>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTipo(null)}>
              Cancelar
            </Button>
            <Button
              disabled={
                processando ||
                !form.nome.trim() ||
                (modalTipo === 'PREFEITURA' && (!form.cidade.trim() || form.estado.trim().length !== 2)) ||
                (modalTipo === 'SECRETARIA' && !form.prefeituraId) ||
                (modalTipo === 'EDITAR' && !editandoSecretaria && (!form.cidade.trim() || form.estado.trim().length !== 2))
              }
              onClick={salvarOrganizacao}
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

function OrganizationRow({
  organizacao,
  icon,
  iconTone,
  subtitle,
  expanded = false,
  showToggle = false,
  indent = false,
  disabled,
  onToggle,
  onEdit,
  onActivation,
}: {
  organizacao: OrganizacaoResponseDTO;
  icon: ReactNode;
  iconTone: string;
  subtitle: string;
  expanded?: boolean;
  showToggle?: boolean;
  indent?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
  onEdit: () => void;
  onActivation: () => void;
}) {
  return (
    <div className={`p-4 hover:bg-muted/50 transition-colors ${indent ? 'pl-12 md:pl-16' : ''}`}>
      <div className="flex items-center gap-3">
        {showToggle ? (
          <button onClick={onToggle} className="p-1 hover:bg-muted rounded transition-colors">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-6" />
        )}
        <div className={`p-2 rounded-lg ${iconTone}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground truncate">{organizacao.nome}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{subtitle}</span>
          </div>
        </div>
        <Badge className={organizacao.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
          {organizacao.ativa ? 'Ativa' : 'Inativa'}
        </Badge>
        <Button variant="ghost" size="icon" onClick={onEdit} disabled={disabled} title="Editar">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onActivation} disabled={disabled} title="Ativar/Inativar">
          <Power className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
