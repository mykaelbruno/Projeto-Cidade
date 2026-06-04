import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Loader2, Plus, Power, Search, Tag } from 'lucide-react';
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
import { Textarea } from '../../components/ui/textarea';
import { getApiErrorMessage } from '../../services/apiClient';
import { categoriaService } from '../../services/categoriaService';
import { organizacaoService } from '../../services/organizacaoService';
import type { CategoriaResponseDTO } from '../../types/categoria';
import type { OrganizacaoResponseDTO } from '../../types/organizacao';

type StatusFiltro = 'TODAS' | 'ATIVAS' | 'INATIVAS';
type ResponsavelFiltro = 'TODAS' | 'COM_RESPONSAVEL' | 'SEM_RESPONSAVEL';

interface CategoriaFormState {
  nome: string;
  descricao: string;
  organizacaoResponsavelPadraoId: string;
}

const emptyForm: CategoriaFormState = {
  nome: '',
  descricao: '',
  organizacaoResponsavelPadraoId: 'SEM_RESPONSAVEL',
};

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODAS');
  const [responsavelFiltro, setResponsavelFiltro] = useState<ResponsavelFiltro>('TODAS');
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaResponseDTO | null>(null);
  const [form, setForm] = useState<CategoriaFormState>(emptyForm);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const [categoriasResponse, organizacoesResponse] = await Promise.all([
        categoriaService.listar(),
        organizacaoService.listar(),
      ]);

      setCategorias(categoriasResponse);
      setOrganizacoes(organizacoesResponse);
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const secretariasAtivas = useMemo(
    () => organizacoes.filter((organizacao) => organizacao.tipo === 'SECRETARIA' && organizacao.ativa),
    [organizacoes],
  );

  const organizacoesPorId = useMemo(() => {
    const mapa = new Map<number, OrganizacaoResponseDTO>();
    organizacoes.forEach((organizacao) => mapa.set(organizacao.id, organizacao));
    return mapa;
  }, [organizacoes]);

  const categoriasFiltradas = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();

    return categorias.filter((categoria) => {
      const responsavel = categoria.organizacaoResponsavelPadraoId
        ? organizacoesPorId.get(categoria.organizacaoResponsavelPadraoId)
        : null;

      const matchesSearch =
        !termo ||
        categoria.nome.toLowerCase().includes(termo) ||
        (categoria.descricao ?? '').toLowerCase().includes(termo) ||
        responsavel?.nome.toLowerCase().includes(termo) ||
        responsavel?.cidade.toLowerCase().includes(termo);

      const matchesStatus =
        statusFiltro === 'TODAS' ||
        (statusFiltro === 'ATIVAS' && categoria.ativa) ||
        (statusFiltro === 'INATIVAS' && !categoria.ativa);

      const matchesResponsavel =
        responsavelFiltro === 'TODAS' ||
        (responsavelFiltro === 'COM_RESPONSAVEL' && Boolean(categoria.organizacaoResponsavelPadraoId)) ||
        (responsavelFiltro === 'SEM_RESPONSAVEL' && !categoria.organizacaoResponsavelPadraoId);

      return matchesSearch && matchesStatus && matchesResponsavel;
    });
  }, [categorias, organizacoesPorId, responsavelFiltro, searchTerm, statusFiltro]);

  const totalAtivas = categorias.filter((categoria) => categoria.ativa).length;
  const totalComResponsavel = categorias.filter((categoria) => categoria.organizacaoResponsavelPadraoId).length;

  function abrirCriacao() {
    setCategoriaEditando(null);
    setForm(emptyForm);
    setModalAberto(true);
    setErro(null);
    setFeedback(null);
  }

  function abrirEdicao(categoria: CategoriaResponseDTO) {
    setCategoriaEditando(categoria);
    setForm({
      nome: categoria.nome,
      descricao: categoria.descricao ?? '',
      organizacaoResponsavelPadraoId: categoria.organizacaoResponsavelPadraoId
        ? String(categoria.organizacaoResponsavelPadraoId)
        : 'SEM_RESPONSAVEL',
    });
    setModalAberto(true);
    setErro(null);
    setFeedback(null);
  }

  function montarPayload() {
    return {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      organizacaoResponsavelPadraoId:
        form.organizacaoResponsavelPadraoId === 'SEM_RESPONSAVEL'
          ? null
          : Number(form.organizacaoResponsavelPadraoId),
    };
  }

  async function salvarCategoria() {
    if (!form.nome.trim()) {
      setErro('Informe o nome da categoria.');
      return;
    }

    setProcessando(true);
    setErro(null);
    setFeedback(null);

    try {
      const payload = montarPayload();
      const categoriaSalva = categoriaEditando
        ? await categoriaService.atualizar(categoriaEditando.id, payload)
        : await categoriaService.criar(payload);

      setCategorias((current) => {
        const exists = current.some((categoria) => categoria.id === categoriaSalva.id);
        if (exists) {
          return current.map((categoria) => (categoria.id === categoriaSalva.id ? categoriaSalva : categoria));
        }
        return [...current, categoriaSalva];
      });

      setFeedback(categoriaEditando ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.');
      setModalAberto(false);
      setCategoriaEditando(null);
      setForm(emptyForm);
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setProcessando(false);
    }
  }

  async function alterarAtiva(categoria: CategoriaResponseDTO) {
    setProcessando(true);
    setErro(null);
    setFeedback(null);

    try {
      const atualizada = await categoriaService.alterarAtiva(categoria.id, !categoria.ativa);
      setCategorias((current) =>
        current.map((item) => (item.id === atualizada.id ? atualizada : item)),
      );
      setFeedback(atualizada.ativa ? 'Categoria ativada.' : 'Categoria desativada.');
    } catch (error) {
      setErro(getApiErrorMessage(error));
    } finally {
      setProcessando(false);
    }
  }

  function limparFiltros() {
    setSearchTerm('');
    setStatusFiltro('TODAS');
    setResponsavelFiltro('TODAS');
  }

  function nomeOrganizacaoResponsavel(categoria: CategoriaResponseDTO) {
    if (!categoria.organizacaoResponsavelPadraoId) {
      return 'Distribuicao manual';
    }

    const organizacao = organizacoesPorId.get(categoria.organizacaoResponsavelPadraoId);
    if (!organizacao) {
      return `Organizacao #${categoria.organizacaoResponsavelPadraoId}`;
    }

    return `${organizacao.nome} - ${organizacao.cidade}`;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Categorias Globais</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Administre os tipos de denuncias e a secretaria padrao de distribuicao.
          </p>
        </div>
        <Button onClick={abrirCriacao} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<Tag className="w-5 h-5 text-cyan-600" />} label="Total de categorias" value={categorias.length} />
        <MetricCard icon={<Tag className="w-5 h-5 text-green-600" />} label="Categorias ativas" value={totalAtivas} />
        <MetricCard icon={<Tag className="w-5 h-5 text-blue-600" />} label="Com secretaria padrao" value={totalComResponsavel} />
      </div>

      {(erro || feedback) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {erro || feedback}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_220px_auto] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, descricao ou secretaria..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFiltro} onValueChange={(value) => setStatusFiltro(value as StatusFiltro)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todos</SelectItem>
                <SelectItem value="ATIVAS">Ativas</SelectItem>
                <SelectItem value="INATIVAS">Inativas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={responsavelFiltro}
              onValueChange={(value) => setResponsavelFiltro(value as ResponsavelFiltro)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Secretaria padrao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                <SelectItem value="COM_RESPONSAVEL">Com secretaria padrao</SelectItem>
                <SelectItem value="SEM_RESPONSAVEL">Distribuicao manual</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={limparFiltros}>
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {carregando ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando categorias...
            </div>
          ) : categoriasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Nenhuma categoria encontrada com os filtros atuais.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Categoria</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descricao</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Secretaria padrao</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categoriasFiltradas.map((categoria) => (
                      <tr key={categoria.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground font-mono">#{categoria.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-foreground">{categoria.nome}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-sm">
                          {categoria.descricao || 'Sem descricao.'}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {nomeOrganizacaoResponsavel(categoria)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={categoria.ativa ? 'default' : 'secondary'}>
                            {categoria.ativa ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => abrirEdicao(categoria)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              disabled={processando}
                              onClick={() => alterarAtiva(categoria)}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border md:hidden">
                {categoriasFiltradas.map((categoria) => (
                  <div key={categoria.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground font-mono">#{categoria.id}</p>
                        <h3 className="font-semibold text-foreground">{categoria.nome}</h3>
                      </div>
                      <Badge variant={categoria.ativa ? 'default' : 'secondary'}>
                        {categoria.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{categoria.descricao || 'Sem descricao.'}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Secretaria padrao: </span>
                      {nomeOrganizacaoResponsavel(categoria)}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrirEdicao(categoria)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" disabled={processando} onClick={() => alterarAtiva(categoria)}>
                        <Power className="w-4 h-4 mr-2" />
                        {categoria.ativa ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{categoriaEditando ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
            <DialogDescription>
              Defina o nome, descricao e a secretaria padrao usada na distribuicao inicial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="categoria-nome">Nome *</Label>
              <Input
                id="categoria-nome"
                value={form.nome}
                maxLength={100}
                onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))}
                placeholder="Ex: Mobilidade urbana"
              />
            </div>

            <div>
              <Label htmlFor="categoria-descricao">Descricao</Label>
              <Textarea
                id="categoria-descricao"
                value={form.descricao}
                maxLength={500}
                rows={4}
                onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
                placeholder="Explique quando essa categoria deve ser usada."
              />
            </div>

            <div>
              <Label>Secretaria padrao</Label>
              <Select
                value={form.organizacaoResponsavelPadraoId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, organizacaoResponsavelPadraoId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma secretaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEM_RESPONSAVEL">Distribuicao manual</SelectItem>
                  {secretariasAtivas.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={String(secretaria.id)}>
                      {secretaria.nome} - {secretaria.cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Se ficar manual, a denuncia nao recebe uma secretaria automaticamente pela categoria.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button disabled={processando} onClick={salvarCategoria}>
              {processando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {categoriaEditando ? 'Salvar alteracoes' : 'Criar categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-muted rounded-lg">{icon}</div>
          <div>
            <div className="text-2xl font-display font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
