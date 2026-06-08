import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  Download,
  Eye,
  FileText,
  MapPin,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { categoriaService } from '../../services/categoriaService';
import { operacionalService } from '../../services/operacionalService';
import { organizacaoService } from '../../services/organizacaoService';
import type { PageResponse } from '../../types/api';
import type { CategoriaResponseDTO } from '../../types/categoria';
import type { DenunciaResponseDTO, StatusDenuncia } from '../../types/denuncia';
import type { OrganizacaoResponseDTO } from '../../types/organizacao';
import type { SolicitacaoTransferenciaResponseDTO } from '../../types/operacional';
import { getOperationalPathPrefix, getVinculoOperacionalAtivo } from '../../utils/operacionalContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { formatDateTime, statusDenunciaColors, statusDenunciaLabels, statusDenunciaOptions } from './operacionalLabels';

interface OperationalReportsProps {
  modo: 'prefeitura' | 'secretaria';
}

type StatusFiltro = StatusDenuncia | 'TODOS';
type CategoriaFiltro = string;

export function OperationalReports({ modo }: OperationalReportsProps) {
  const navigate = useNavigate();
  const { userType, vinculosOperacionais } = useUser();
  const vinculo = useMemo(
    () => getVinculoOperacionalAtivo(userType, vinculosOperacionais),
    [userType, vinculosOperacionais],
  );

  const [denuncias, setDenuncias] = useState<DenunciaResponseDTO[]>([]);
  const [paginaDenuncias, setPaginaDenuncias] = useState<PageResponse<DenunciaResponseDTO> | null>(null);
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoResponseDTO[]>([]);
  const [transferencias, setTransferencias] = useState<SolicitacaoTransferenciaResponseDTO[]>([]);
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState<StatusFiltro>('TODOS');
  const [categoriaId, setCategoriaId] = useState<CategoriaFiltro>('TODAS');
  const [erro, setErro] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(20);

  const [denunciaSelecionada, setDenunciaSelecionada] = useState<DenunciaResponseDTO | null>(null);
  const [statusAberto, setStatusAberto] = useState(false);
  const [novoStatus, setNovoStatus] = useState<StatusDenuncia | ''>('');
  const [motivoStatus, setMotivoStatus] = useState('');
  const [respostaAberta, setRespostaAberta] = useState(false);
  const [respostaOficial, setRespostaOficial] = useState('');
  const [transferenciaAberta, setTransferenciaAberta] = useState(false);
  const [destinoTransferencia, setDestinoTransferencia] = useState('');
  const [motivoTransferencia, setMotivoTransferencia] = useState('');
  const [reatribuicaoAberta, setReatribuicaoAberta] = useState(false);
  const [destinoReatribuicao, setDestinoReatribuicao] = useState('');
  const [motivoReatribuicao, setMotivoReatribuicao] = useState('');
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] =
    useState<SolicitacaoTransferenciaResponseDTO | null>(null);
  const [decisaoAberta, setDecisaoAberta] = useState<'APROVAR' | 'RECUSAR' | null>(null);
  const [destinoDecisao, setDestinoDecisao] = useState('');
  const [motivoDecisao, setMotivoDecisao] = useState('');

  const secretarias = useMemo(() => {
    if (!vinculo) return [];
    return organizacoes.filter(
      (organizacao) =>
        organizacao.tipo === 'SECRETARIA' &&
        organizacao.ativa &&
        organizacao.organizacaoPaiId === vinculo.organizacaoId,
    );
  }, [organizacoes, vinculo]);

  const carregarDados = useCallback(async () => {
    if (!vinculo) {
      setErro('Nao foi possivel carregar seu vinculo operacional. Tente entrar novamente.');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const [paginaDenuncias, listaCategorias, listaOrganizacoes, paginaTransferencias] =
        await Promise.all([
          operacionalService.listarDenuncias(vinculo.organizacaoId, {
            cidade,
            bairro,
            status: status === 'TODOS' ? null : status,
            categoriaId: categoriaId === 'TODAS' ? null : Number(categoriaId),
            termo: busca,
            page: paginaAtual,
            size: tamanhoPagina,
          }),
          categoriaService.listar(),
          modo === 'prefeitura' ? organizacaoService.listar() : Promise.resolve([]),
          modo === 'prefeitura'
            ? operacionalService.listarTransferenciasPrefeitura(vinculo.organizacaoId)
            : Promise.resolve({ content: [] }),
        ]);

      setDenuncias(paginaDenuncias.content);
      setPaginaDenuncias(paginaDenuncias);
      setCategorias(listaCategorias.filter((categoria) => categoria.ativa));
      setOrganizacoes(listaOrganizacoes);
      setTransferencias(paginaTransferencias.content);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel carregar os relatos operacionais.');
    } finally {
      setCarregando(false);
    }
  }, [bairro, busca, categoriaId, cidade, modo, paginaAtual, status, tamanhoPagina, vinculo]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    setPaginaAtual(0);
  }, [bairro, busca, categoriaId, cidade, status, tamanhoPagina]);

  const denunciasFiltradas = denuncias;

  const grupos = useMemo(() => {
    if (modo === 'secretaria') {
      return [[vinculo?.nomeOrganizacao ?? 'Secretaria', denunciasFiltradas]] as [string, DenunciaResponseDTO[]][];
    }

    const agrupado = new Map<string, DenunciaResponseDTO[]>();
    denunciasFiltradas.forEach((denuncia) => {
      const chave = denuncia.organizacaoResponsavelNome ?? 'Sem secretaria definida';
      agrupado.set(chave, [...(agrupado.get(chave) ?? []), denuncia]);
    });

    return Array.from(agrupado.entries());
  }, [denunciasFiltradas, modo, vinculo]);

  function getOrganizacaoAcaoId(denuncia: DenunciaResponseDTO) {
    return denuncia.organizacaoResponsavelId ?? vinculo?.organizacaoId ?? 0;
  }

  function abrirStatus(denuncia: DenunciaResponseDTO) {
    setDenunciaSelecionada(denuncia);
    setNovoStatus(denuncia.status);
    setMotivoStatus('');
    setStatusAberto(true);
  }

  function abrirResposta(denuncia: DenunciaResponseDTO) {
    setDenunciaSelecionada(denuncia);
    setRespostaOficial('');
    setRespostaAberta(true);
  }

  async function atualizarStatus() {
    if (!denunciaSelecionada || !novoStatus) return;

    setProcessando(true);
    try {
      await operacionalService.atualizarStatus(denunciaSelecionada.id, {
        status: novoStatus,
        organizacaoId: getOrganizacaoAcaoId(denunciaSelecionada),
        motivo: motivoStatus || null,
      });
      setFeedback('Status atualizado com sucesso.');
      setStatusAberto(false);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel atualizar o status.');
    } finally {
      setProcessando(false);
    }
  }

  async function enviarRespostaOficial() {
    if (!denunciaSelecionada || respostaOficial.trim().length < 5) return;

    setProcessando(true);
    try {
      await operacionalService.responderOficialmente(denunciaSelecionada.id, {
        organizacaoId: getOrganizacaoAcaoId(denunciaSelecionada),
        conteudo: respostaOficial.trim(),
      });
      setFeedback('Resposta oficial publicada.');
      setRespostaAberta(false);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel publicar a resposta oficial.');
    } finally {
      setProcessando(false);
    }
  }

  async function solicitarTransferencia() {
    if (!denunciaSelecionada || motivoTransferencia.trim().length < 5) return;

    setProcessando(true);
    try {
      await operacionalService.solicitarTransferencia(denunciaSelecionada.id, {
        organizacaoDestinoSugeridaId: destinoTransferencia ? Number(destinoTransferencia) : null,
        motivo: motivoTransferencia.trim(),
      });
      setFeedback('Solicitacao de transferencia enviada para a prefeitura.');
      setTransferenciaAberta(false);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel solicitar a transferencia.');
    } finally {
      setProcessando(false);
    }
  }

  async function reatribuirDenuncia() {
    if (!denunciaSelecionada || !destinoReatribuicao) return;

    setProcessando(true);
    try {
      await operacionalService.alterarResponsavel(denunciaSelecionada.id, {
        organizacaoDestinoId: Number(destinoReatribuicao),
        motivo: motivoReatribuicao || null,
      });
      setFeedback('Responsavel alterado com sucesso.');
      setReatribuicaoAberta(false);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel reatribuir o relato.');
    } finally {
      setProcessando(false);
    }
  }

  async function decidirTransferencia() {
    if (!solicitacaoSelecionada || !decisaoAberta) return;

    setProcessando(true);
    try {
      if (decisaoAberta === 'APROVAR') {
        await operacionalService.aprovarTransferencia(solicitacaoSelecionada.id, {
          organizacaoDestinoId: destinoDecisao ? Number(destinoDecisao) : undefined,
          motivo: motivoDecisao || null,
        });
        setFeedback('Transferencia aprovada.');
      } else {
        await operacionalService.recusarTransferencia(solicitacaoSelecionada.id, {
          motivo: motivoDecisao.trim(),
        });
        setFeedback('Transferencia recusada.');
      }

      setDecisaoAberta(null);
      await carregarDados();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel avaliar a transferencia.');
    } finally {
      setProcessando(false);
    }
  }

  async function exportarCsv() {
    if (!vinculo) return;

    try {
      const blob = await operacionalService.baixarCsv(vinculo.organizacaoId, {
        cidade,
        bairro,
        status: status === 'TODOS' ? null : status,
        categoriaId: categoriaId === 'TODAS' ? null : Number(categoriaId),
        termo: busca,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatos-operacionais-${vinculo.organizacaoId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Nao foi possivel exportar o CSV.');
    }
  }

  function limparFiltros() {
    setCidade('');
    setBairro('');
    setBusca('');
    setStatus('TODOS');
    setCategoriaId('TODAS');
    setPaginaAtual(0);
  }

  if (carregando) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Carregando relatos operacionais...
        </Card>
      </div>
    );
  }

  if (!vinculo) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Painel Operacional</h2>
          <p className="mt-2 text-sm text-red-600">{erro}</p>
        </Card>
      </div>
    );
  }

  const prefix = getOperationalPathPrefix(userType);
  const titulo = modo === 'prefeitura' ? 'Relatos da prefeitura' : 'Relatos da secretaria';
  const descricao =
    modo === 'prefeitura'
      ? 'Acompanhe todos os relatos da cidade separados por secretaria.'
      : 'Acompanhe os relatos atribuidos a sua secretaria.';

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {titulo}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{descricao}</p>
        </div>
        <Button onClick={exportarCsv} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {(erro || feedback) && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${erro ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          {erro || feedback}
        </div>
      )}

      {modo === 'prefeitura' && transferencias.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Transferencias pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transferencias.map((solicitacao) => (
              <div key={solicitacao.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-foreground line-clamp-1">{solicitacao.denunciaTitulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {solicitacao.organizacaoOrigemNome}
                    {solicitacao.organizacaoDestinoSugeridaNome
                      ? ` sugeriu ${solicitacao.organizacaoDestinoSugeridaNome}`
                      : ' solicitou avaliacao da prefeitura'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{solicitacao.motivo}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setSolicitacaoSelecionada(solicitacao);
                    setDestinoDecisao('');
                    setMotivoDecisao('');
                    setDecisaoAberta('RECUSAR');
                  }}>
                    Recusar
                  </Button>
                  <Button size="sm" onClick={() => {
                    setSolicitacaoSelecionada(solicitacao);
                    setDestinoDecisao(solicitacao.organizacaoDestinoSugeridaId ? String(solicitacao.organizacaoDestinoSugeridaId) : '');
                    setMotivoDecisao('');
                    setDecisaoAberta('APROVAR');
                  }}>
                    Avaliar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por titulo, bairro ou ID..." className="pl-9" />
            </div>
            <Input value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Cidade" />
            <Input value={bairro} onChange={(event) => setBairro(event.target.value)} placeholder="Bairro" />
            <Select value={status} onValueChange={(value) => setStatus(value as StatusFiltro)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os status</SelectItem>
                {statusDenunciaOptions.map((option) => (
                  <SelectItem key={option} value={option}>{statusDenunciaLabels[option]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas as categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={String(categoria.id)}>{categoria.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={carregarDados}>Aplicar filtros</Button>
            <Button variant="ghost" onClick={limparFiltros}>Limpar</Button>
          </div>
        </CardContent>
      </Card>

      {denunciasFiltradas.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          Nenhum relato encontrado para os filtros atuais.
        </Card>
      )}

      <div className="space-y-7">
        {grupos.map(([nomeGrupo, items]) => (
          <section key={nomeGrupo} className="space-y-4">
            {modo === 'prefeitura' && (
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">{nomeGrupo}</h3>
                <Badge variant="secondary">{items.length} relatos</Badge>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((denuncia) => (
                <ReportManagementCard
                  key={denuncia.id}
                  denuncia={denuncia}
                  modo={modo}
                  onDetalhes={() => navigate(`${prefix}/relato/${denuncia.id}`)}
                  onStatus={() => abrirStatus(denuncia)}
                  onResposta={() => abrirResposta(denuncia)}
                  onTransferencia={() => {
                    setDenunciaSelecionada(denuncia);
                    setDestinoTransferencia('');
                    setMotivoTransferencia('');
                    setTransferenciaAberta(true);
                  }}
                  onReatribuicao={() => {
                    setDenunciaSelecionada(denuncia);
                    setDestinoReatribuicao('');
                    setMotivoReatribuicao('');
                    setReatribuicaoAberta(true);
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {paginaDenuncias && paginaDenuncias.totalElements > 0 && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {paginaDenuncias.numberOfElements} de {paginaDenuncias.totalElements} relatos
              {busca.trim() ? ' nesta pagina filtrada pela busca local' : ''}.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Por pagina</span>
                <Select
                  value={String(tamanhoPagina)}
                  onValueChange={(value) => setTamanhoPagina(Number(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaDenuncias.first || carregando}
                  onClick={() => setPaginaAtual((pagina) => Math.max(0, pagina - 1))}
                >
                  Anterior
                </Button>
                <span className="min-w-28 text-center text-sm text-muted-foreground">
                  Pagina {paginaDenuncias.totalPages === 0 ? 0 : paginaAtual + 1} de {paginaDenuncias.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaDenuncias.last || carregando}
                  onClick={() => setPaginaAtual((pagina) => Math.min(paginaDenuncias.totalPages - 1, pagina + 1))}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={statusAberto} onOpenChange={setStatusAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar status</DialogTitle>
            <DialogDescription>{denunciaSelecionada?.titulo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Novo status</Label>
              <Select value={novoStatus} onValueChange={(value) => setNovoStatus(value as StatusDenuncia)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {statusDenunciaOptions.map((option) => (
                    <SelectItem key={option} value={option}>{statusDenunciaLabels[option]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Motivo ou acao realizada</Label>
              <Textarea value={motivoStatus} onChange={(event) => setMotivoStatus(event.target.value)} rows={3} placeholder="Opcional, mas recomendado para registrar o historico." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusAberto(false)}>Cancelar</Button>
            <Button disabled={!novoStatus || processando} onClick={atualizarStatus}>Salvar status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={respostaAberta} onOpenChange={setRespostaAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resposta oficial</DialogTitle>
            <DialogDescription>{denunciaSelecionada?.titulo}</DialogDescription>
          </DialogHeader>
          <Textarea value={respostaOficial} onChange={(event) => setRespostaOficial(event.target.value)} rows={5} placeholder="Informe o posicionamento oficial da organizacao responsavel." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespostaAberta(false)}>Cancelar</Button>
            <Button disabled={respostaOficial.trim().length < 5 || processando} onClick={enviarRespostaOficial}>Publicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transferenciaAberta} onOpenChange={setTransferenciaAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar transferencia</DialogTitle>
            <DialogDescription>A prefeitura avaliara a solicitacao e definira o responsavel final.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Destino sugerido</Label>
              <Select value={destinoTransferencia} onValueChange={setDestinoTransferencia}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={String(secretaria.id)}>{secretaria.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {secretarias.length === 0 && (
                <p className="mt-2 text-xs text-muted-foreground">Sem lista de secretarias disponivel para seu perfil; envie apenas o motivo.</p>
              )}
            </div>
            <div>
              <Label className="mb-2 block">Motivo</Label>
              <Textarea value={motivoTransferencia} onChange={(event) => setMotivoTransferencia(event.target.value)} rows={4} placeholder="Explique por que este relato nao pertence a esta secretaria." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferenciaAberta(false)}>Cancelar</Button>
            <Button disabled={motivoTransferencia.trim().length < 5 || processando} onClick={solicitarTransferencia}>Solicitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reatribuicaoAberta} onOpenChange={setReatribuicaoAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reatribuir relato</DialogTitle>
            <DialogDescription>{denunciaSelecionada?.titulo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Nova secretaria responsavel</Label>
              <Select value={destinoReatribuicao} onValueChange={setDestinoReatribuicao}>
                <SelectTrigger><SelectValue placeholder="Selecione a secretaria" /></SelectTrigger>
                <SelectContent>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={String(secretaria.id)}>{secretaria.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Motivo</Label>
              <Textarea value={motivoReatribuicao} onChange={(event) => setMotivoReatribuicao(event.target.value)} rows={3} placeholder="Opcional." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReatribuicaoAberta(false)}>Cancelar</Button>
            <Button disabled={!destinoReatribuicao || processando} onClick={reatribuirDenuncia}>Reatribuir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={decisaoAberta !== null} onOpenChange={(open) => !open && setDecisaoAberta(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decisaoAberta === 'APROVAR' ? 'Aprovar transferencia' : 'Recusar transferencia'}</DialogTitle>
            <DialogDescription>{solicitacaoSelecionada?.denunciaTitulo}</DialogDescription>
          </DialogHeader>
          {decisaoAberta === 'APROVAR' && (
            <div>
              <Label className="mb-2 block">Secretaria de destino</Label>
              <Select value={destinoDecisao} onValueChange={setDestinoDecisao}>
                <SelectTrigger><SelectValue placeholder="Usar destino sugerido ou escolher outro" /></SelectTrigger>
                <SelectContent>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={String(secretaria.id)}>{secretaria.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="mb-2 block">Motivo da decisao</Label>
            <Textarea value={motivoDecisao} onChange={(event) => setMotivoDecisao(event.target.value)} rows={3} placeholder={decisaoAberta === 'RECUSAR' ? 'Obrigatorio para recusar.' : 'Opcional.'} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisaoAberta(null)}>Cancelar</Button>
            <Button
              disabled={
                processando ||
                (decisaoAberta === 'APROVAR' && !destinoDecisao) ||
                (decisaoAberta === 'RECUSAR' && motivoDecisao.trim().length < 5)
              }
              onClick={decidirTransferencia}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportManagementCard({
  denuncia,
  modo,
  onDetalhes,
  onStatus,
  onResposta,
  onTransferencia,
  onReatribuicao,
}: {
  denuncia: DenunciaResponseDTO;
  modo: 'prefeitura' | 'secretaria';
  onDetalhes: () => void;
  onStatus: () => void;
  onResposta: () => void;
  onTransferencia: () => void;
  onReatribuicao: () => void;
}) {
  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-mono text-muted-foreground">#{denuncia.id}</p>
              <h3 className="font-semibold text-foreground line-clamp-2">{denuncia.titulo}</h3>
            </div>
            <Badge className={statusDenunciaColors[denuncia.status]}>
              {statusDenunciaLabels[denuncia.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{denuncia.descricao}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{denuncia.bairro}, {denuncia.cidade}</span>
          </span>
          <span>{formatDateTime(denuncia.criadoEm)}</span>
          <Badge variant="outline" className="w-fit">{denuncia.categoriaNome}</Badge>
          <span className="truncate">{denuncia.organizacaoResponsavelNome ?? 'Sem secretaria'}</span>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{denuncia.quantidadeConfirmacoes}</span>
          <span className="flex items-center gap-1 text-orange-700"><AlertTriangle className="h-4 w-4" />{denuncia.quantidadeUrgencias}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-4 w-4" />{denuncia.quantidadeComentarios}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={onDetalhes}><Eye className="w-4 h-4" />Detalhes</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onStatus}><RefreshCw className="w-4 h-4" />Status</Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={onResposta}><Send className="w-4 h-4" />Responder</Button>
          {modo === 'prefeitura' ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={onReatribuicao}><ArrowRightLeft className="w-4 h-4" />Reatribuir</Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={onTransferencia}><ArrowRightLeft className="w-4 h-4" />Transferir</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
