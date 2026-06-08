import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Image as ImageIcon,
  LogOut,
  MapPin,
  MessageCircle,
  Send,
  ThumbsUp,
  Trash2,
  User,
  UserCircle,
} from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Logo } from '../components/Logo';
import { NotificationBellButton } from '../components/NotificationBellButton';
import { NotificationsDrawer } from '../components/NotificationsDrawer';
import { ReportLocationMap } from '../components/ReportLocationMap';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { getApiErrorMessage, getApiUrl } from '../services/apiClient';
import { denunciaService } from '../services/denunciaService';
import { interacaoDenunciaService } from '../services/interacaoDenunciaService';
import { mapDenunciaToReport } from '../mappers/denunciaMapper';
import { useUser } from '../contexts/UserContext';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import type {
  AnexoDenunciaResponseDTO,
  ComentarioResponseDTO,
  DenunciaResponseDTO,
  InteracaoDenunciaResponseDTO,
  MotivoSinalizacaoDenuncia,
  TimelineDenunciaResponseDTO,
} from '../types/denuncia';

const motivosSinalizacao: Array<{ value: MotivoSinalizacaoDenuncia; label: string }> = [
  { value: 'IMAGEM_INADEQUADA', label: 'Imagem inadequada' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'FAKE_NEWS', label: 'Informacao falsa' },
  { value: 'CONTEUDO_OFENSIVO', label: 'Conteudo ofensivo' },
  { value: 'DADOS_PESSOAIS_EXPOSTOS', label: 'Dados pessoais expostos' },
  { value: 'DENUNCIA_DUPLICADA', label: 'Relato duplicado' },
  { value: 'LOCALIZACAO_INCORRETA', label: 'Localizacao incorreta' },
  { value: 'CATEGORIA_INCORRETA', label: 'Categoria incorreta' },
  { value: 'OUTRO', label: 'Outro' },
];

function timeAgo(value: string): string {
  try {
    return `ha ${formatDistanceToNowStrict(new Date(value), { locale: ptBR })}`;
  } catch {
    return 'data nao informada';
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function timelineTitle(evento: TimelineDenunciaResponseDTO): string {
  const labels: Record<string, string> = {
    DENUNCIA_CRIADA: 'Relato criado',
    COMENTARIO_ADICIONADO: 'Comentario adicionado',
    RESPOSTA_OFICIAL_PUBLICADA: 'Resposta oficial publicada',
    STATUS_ALTERADO: 'Status atualizado',
    ANEXO_ADICIONADO: 'Anexo adicionado',
    DENUNCIA_ARQUIVADA_MODERACAO: 'Relato arquivado',
    COMENTARIO_REMOVIDO_MODERACAO: 'Comentario removido',
    TRANSFERENCIA_SOLICITADA: 'Transferencia solicitada',
    TRANSFERENCIA_APROVADA: 'Transferencia aprovada',
    TRANSFERENCIA_RECUSADA: 'Transferencia recusada',
    RESPONSAVEL_ALTERADO_PREFEITURA: 'Responsavel alterado',
    CONCLUSAO_CONFIRMADA_MORADOR: 'Conclusao confirmada',
    CONCLUSAO_CONTESTADA_MORADOR: 'Conclusao contestada',
  };

  return labels[evento.tipo] ?? evento.tipo;
}

function formatOrganizationName(name: string | null | undefined, cidade: string): string {
  if (!name) {
    return '';
  }

  return name.toLowerCase().includes(cidade.toLowerCase()) ? name : `${name} - ${cidade}`;
}

export function ReportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { usuario, isMorador, logout } = useUser();
  const { unreadCount } = useUnreadNotificationsCount();
  const denunciaId = Number(id);
  const [denuncia, setDenuncia] = useState<DenunciaResponseDTO | null>(null);
  const [anexos, setAnexos] = useState<AnexoDenunciaResponseDTO[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioResponseDTO[]>([]);
  const [timeline, setTimeline] = useState<TimelineDenunciaResponseDTO[]>([]);
  const [interacao, setInteracao] = useState<InteracaoDenunciaResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackMode, setFeedbackMode] = useState<'confirmar' | 'contestar' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [comentarioAlvo, setComentarioAlvo] = useState<ComentarioResponseDTO | null>(null);
  const [motivo, setMotivo] = useState<MotivoSinalizacaoDenuncia>('SPAM');
  const [comentarioSinalizacao, setComentarioSinalizacao] = useState('');
  const [imagemAtivaIndex, setImagemAtivaIndex] = useState(0);

  const carregarDetalhe = useCallback(async () => {
    if (!Number.isFinite(denunciaId)) {
      setError('Identificador do relato invalido.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [denunciaResponse, anexosResponse, comentariosResponse, timelineResponse, interacaoResponse] =
        await Promise.all([
          denunciaService.detalhar(denunciaId),
          denunciaService.listarAnexos(denunciaId),
          denunciaService.listarComentarios(denunciaId),
          denunciaService.listarTimeline(denunciaId),
          isMorador ? interacaoDenunciaService.obterStatus(denunciaId) : Promise.resolve(null),
        ]);

      setDenuncia(denunciaResponse);
      setAnexos(anexosResponse.content);
      setComentarios(comentariosResponse.content);
      setTimeline(timelineResponse.content);
      setInteracao(interacaoResponse);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [denunciaId, isMorador]);

  useEffect(() => {
    carregarDetalhe();
  }, [carregarDetalhe]);

  const report = useMemo(() => {
    if (!denuncia) {
      return null;
    }

    return mapDenunciaToReport(denuncia, {
      apoiadaPeloUsuario: interacao?.confirmadaPeloUsuario ?? false,
      urgentePeloUsuario: interacao?.marcadaUrgentePeloUsuario ?? false,
      motivoOrdenacao: undefined,
      pontuacaoFeed: denuncia.pontuacaoRelevancia,
    });
  }, [denuncia, interacao]);

  const imagens = useMemo(
    () => anexos.filter((anexo) => anexo.contentType?.startsWith('image/')),
    [anexos],
  );

  useEffect(() => {
    if (imagens.length === 0) {
      setImagemAtivaIndex(0);
      return;
    }

    setImagemAtivaIndex((current) => Math.min(current, imagens.length - 1));
  }, [imagens.length]);

  const podeValidarConclusao = Boolean(
    isMorador &&
      denuncia &&
      usuario &&
      denuncia.status === 'CONCLUIDO' &&
      denuncia.autorId === usuario.id &&
      !denuncia.conclusaoConfirmadaEm,
  );
  const responsavelNome = formatOrganizationName(denuncia?.organizacaoResponsavelNome, denuncia?.cidade ?? '');

  function updateInteracao(response: InteracaoDenunciaResponseDTO) {
    setInteracao(response);
    setDenuncia((current) => current ? {
      ...current,
      quantidadeConfirmacoes: response.quantidadeConfirmacoes,
      quantidadeUrgencias: response.quantidadeUrgencias,
      quantidadeComentarios: response.quantidadeComentarios,
      pontuacaoRelevancia: response.pontuacaoRelevancia,
    } : current);
  }

  async function toggleSupport() {
    if (!report) return;
    setActionError(null);

    try {
      const response = report.supportedByUser
        ? await interacaoDenunciaService.removerApoio(Number(report.id))
        : await interacaoDenunciaService.apoiar(Number(report.id));
      updateInteracao(response);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function toggleUrgent() {
    if (!report) return;
    setActionError(null);

    try {
      const response = report.urgentByUser
        ? await interacaoDenunciaService.removerUrgente(Number(report.id))
        : await interacaoDenunciaService.marcarUrgente(Number(report.id));
      updateInteracao(response);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  }

  async function enviarComentario() {
    const conteudo = comentario.trim();
    if (!conteudo || !denuncia) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const novoComentario = await denunciaService.comentar(denuncia.id, conteudo);
      setComentarios((current) => [...current, novoComentario]);
      setComentario('');
      setDenuncia((current) => current ? {
        ...current,
        quantidadeComentarios: current.quantidadeComentarios + 1,
      } : current);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function enviarFeedbackConclusao() {
    if (!denuncia || !feedbackMode) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = feedbackMode === 'confirmar'
        ? await denunciaService.confirmarConclusao(denuncia.id, feedback.trim())
        : await denunciaService.contestarConclusao(denuncia.id, feedback.trim());
      setDenuncia(response);
      setFeedback('');
      setFeedbackMode(null);
      setSuccessMessage(feedbackMode === 'confirmar'
        ? 'Conclusao confirmada com sucesso.'
        : 'Conclusao contestada. O relato foi reaberto.');
      await carregarDetalhe();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function enviarSinalizacao() {
    if (!denuncia || !comentarioSinalizacao.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const payload = {
        motivo,
        comentario: comentarioSinalizacao.trim(),
      };
      if (comentarioAlvo) {
        await denunciaService.sinalizarComentario(denuncia.id, comentarioAlvo.id, payload);
      } else {
        await denunciaService.sinalizar(denuncia.id, payload);
      }
      setComentarioSinalizacao('');
      setMotivo('SPAM');
      setComentarioAlvo(null);
      setIsReportOpen(false);
      setSuccessMessage(comentarioAlvo ? 'Comentario sinalizado para a moderacao.' : 'Sinalizacao enviada para a moderacao.');
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removerComentario(item: ComentarioResponseDTO) {
    if (!denuncia) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      await denunciaService.removerComentario(denuncia.id, item.id);
      setComentarios((current) => current.filter((comentarioAtual) => comentarioAtual.id !== item.id));
      setDenuncia((current) => current ? {
        ...current,
        quantidadeComentarios: Math.max(0, current.quantidadeComentarios - 1),
      } : current);
      setSuccessMessage('Comentario removido.');
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          Carregando relato...
        </div>
      </div>
    );
  }

  if (error || !denuncia || !report) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-8">
        <div className="bg-card border border-border rounded-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Relato nao encontrado
          </h2>
          <p className="text-muted-foreground mb-4">
            {error || 'Este relato nao existe ou foi removido.'}
          </p>
          <Button onClick={() => navigate('/feed')}>Voltar ao feed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Logo size="md" showText={true} />
            <div className="flex items-center gap-3">
            <NotificationBellButton unreadCount={unreadCount} onClick={() => setIsNotificationsOpen(true)} />
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        Ola, <span className="font-semibold">{usuario?.nome ?? 'usuario'}</span>!
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/perfil');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                      >
                        <UserCircle className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Perfil</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-destructive/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Sair</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 space-y-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg px-1 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          {actionError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
              {actionError}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              {imagens.length > 0 ? (
                <div className="space-y-3">
                  <div className="aspect-[4/3] lg:aspect-[1/1] w-full bg-muted relative overflow-hidden rounded-3xl border border-border shadow-sm">
                    <img
                      src={getApiUrl(imagens[imagemAtivaIndex].urlDownload)}
                      alt={imagens[imagemAtivaIndex].nomeOriginal}
                      className="w-full h-full object-cover"
                    />
                    {imagens.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setImagemAtivaIndex((current) => (current === 0 ? imagens.length - 1 : current - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagemAtivaIndex((current) => (current + 1) % imagens.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
                          {imagens.map((imagem, index) => (
                            <button
                              key={imagem.id}
                              type="button"
                              onClick={() => setImagemAtivaIndex(index)}
                              className={`h-2.5 w-2.5 rounded-full transition-all ${
                                index === imagemAtivaIndex ? 'bg-white scale-110' : 'bg-white/45'
                              }`}
                              aria-label={`Abrir foto ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {imagens.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {imagens.map((anexo, index) => (
                        <button
                          key={anexo.id}
                          type="button"
                          onClick={() => setImagemAtivaIndex(index)}
                          className={`aspect-square overflow-hidden rounded-xl border shadow-sm transition-all ${
                            index === imagemAtivaIndex ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                          }`}
                        >
                          <img
                            src={getApiUrl(anexo.urlDownload)}
                            alt={anexo.nomeOriginal}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] lg:aspect-[1/1] w-full bg-muted rounded-3xl border border-border flex flex-col items-center justify-center text-muted-foreground gap-3 shadow-sm">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm">Sem imagens anexadas</span>
                </div>
              )}

              <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Localizacao
                  </h2>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {denuncia.cidade}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{report.location}, {report.neighborhood}</p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {report.category}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {report.status}
                </span>
                {denuncia.organizacaoResponsavelNome && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    {responsavelNome}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3 tracking-normal">
                  {report.title}
                </h1>
                <p className="text-base text-foreground/90 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Criado {report.timeAgo}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span>{denuncia.autorNomeExibido}</span>
                </div>
              </div>

              {isMorador && (
                <div className="bg-card border border-border rounded-2xl p-3 space-y-3 shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={toggleSupport}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                        report.supportedByUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="hidden sm:inline">{report.supportedByUser ? 'Apoiado' : 'Apoiar'}</span>
                      ({report.supports})
                    </button>
                    <button
                      onClick={toggleUrgent}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                        report.urgentByUser
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span className="hidden sm:inline">Urgente</span>
                      ({report.urgencies})
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setComentarioAlvo(null);
                      setIsReportOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-card text-foreground border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Sinalizar relato
                  </button>
                </div>
              )}

              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
                <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Mapa do relato
                </h2>
                <ReportLocationMap
                  latitude={denuncia.latitude}
                  longitude={denuncia.longitude}
                  label={`${report.location}, ${report.neighborhood} - ${denuncia.cidade}`}
                  className="h-72 lg:h-80"
                />
              </div>

              {podeValidarConclusao && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5" />
                    <div>
                      <h2 className="font-semibold text-emerald-900">A prefeitura marcou este relato como concluido</h2>
                      <p className="text-sm text-emerald-800">Confirme se o problema foi resolvido ou conteste para reabrir o relato.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={() => setFeedbackMode('confirmar')}>Confirmar conclusao</Button>
                    <Button variant="outline" onClick={() => setFeedbackMode('contestar')}>Contestar conclusao</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                Acompanhamento
              </h2>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((evento, index) => (
                    <div key={evento.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          evento.destaque ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {evento.destaque ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        {index < timeline.length - 1 && <div className="w-0.5 h-full min-h-10 bg-border" />}
                      </div>
                      <div className="flex-1 pb-5">
                        <div className="font-medium text-foreground mb-1">{timelineTitle(evento)}</div>
                        <div className="text-xs text-muted-foreground mb-2">{timeAgo(evento.criadoEm)}</div>
                        <p className="text-sm text-foreground">{evento.descricao}</p>
                        {(evento.organizacaoNome || evento.usuarioNome) && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {evento.organizacaoNome
                              ? formatOrganizationName(evento.organizacaoNome, denuncia.cidade)
                              : evento.usuarioNome}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 flex flex-col shadow-sm">
              <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comentarios ({denuncia.quantidadeComentarios})
              </h2>

              <div className="space-y-4 mb-4">
                {comentarios.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum comentario ainda.</p>
                )}

                {comentarios.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-3 rounded-xl p-3 ${
                      item.oficial
                        ? 'border border-blue-200 bg-blue-50/80 shadow-sm'
                        : 'border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.oficial ? 'bg-primary' : 'bg-gradient-to-br from-[#087F5B] to-[#0F4C81]'
                    }`}>
                      <span className="text-sm font-display font-bold text-white">
                        {initials(item.oficial
                          ? formatOrganizationName(item.organizacaoNome || item.autorNome, denuncia.cidade)
                          : item.autorNome)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-foreground text-sm">
                          {item.oficial
                            ? formatOrganizationName(item.organizacaoNome || item.autorNome, denuncia.cidade)
                            : item.autorNome}
                        </span>
                        {item.oficial && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700 font-medium">
                            Oficial
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{timeAgo(item.criadoEm)}</span>
                      </div>
                      <p className="text-sm text-foreground">{item.conteudo}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          setComentarioAlvo(item);
                          setIsReportOpen(true);
                        }}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                      {item.autorId === usuario?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          disabled={isSubmitting}
                          onClick={() => removerComentario(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isMorador && (
                <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                  <Textarea
                    placeholder="Adicionar comentario..."
                    value={comentario}
                    onChange={(event) => setComentario(event.target.value)}
                    className="min-h-12 border-border bg-background/80 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  <button
                    onClick={enviarComentario}
                    disabled={isSubmitting || !comentario.trim()}
                    className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(feedbackMode)} onOpenChange={(open) => !open && setFeedbackMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackMode === 'confirmar' ? 'Confirmar conclusao' : 'Contestar conclusao'}</DialogTitle>
            <DialogDescription>
              Seu feedback fica registrado no historico do relato.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            maxLength={500}
            placeholder="Escreva um feedback curto..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackMode(null)}>Cancelar</Button>
            <Button onClick={enviarFeedbackConclusao} disabled={isSubmitting}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportOpen} onOpenChange={(open) => {
        setIsReportOpen(open);
        if (!open) {
          setComentarioAlvo(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{comentarioAlvo ? 'Sinalizar comentario' : 'Sinalizar relato'}</DialogTitle>
            <DialogDescription>
              A moderacao vai avaliar o motivo e o comentario informado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={motivo} onValueChange={(value) => setMotivo(value as MotivoSinalizacaoDenuncia)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {motivosSinalizacao.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={comentarioSinalizacao}
              onChange={(event) => setComentarioSinalizacao(event.target.value)}
              maxLength={500}
              placeholder="Explique brevemente o problema..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancelar</Button>
            <Button onClick={enviarSinalizacao} disabled={isSubmitting || !comentarioSinalizacao.trim()}>
              Enviar sinalizacao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
