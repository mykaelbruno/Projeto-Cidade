import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  Plus,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Filter,
  User,
  Shuffle,
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ReportCard, Report } from '../components/ReportCard';
import { FilterModal } from '../components/FilterModal';
import { NotificationsDrawer } from '../components/NotificationsDrawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { getApiErrorMessage } from '../services/apiClient';
import { categoriaService } from '../services/categoriaService';
import { denunciaService } from '../services/denunciaService';
import { feedService } from '../services/feedService';
import { interacaoDenunciaService } from '../services/interacaoDenunciaService';
import { mapFeedItemToReport } from '../mappers/denunciaMapper';
import { useUser } from '../contexts/UserContext';
import type { PageResponse } from '../types/api';
import type { CategoriaResponseDTO } from '../types/categoria';
import type {
  FeedDenunciaResponseDTO,
  InteracaoDenunciaResponseDTO,
  MotivoSinalizacaoDenuncia,
  ModoOrdenacaoFeed,
  StatusDenuncia,
} from '../types/denuncia';

type FilterTab = 'mixed' | 'trending' | 'recent' | 'solved';

const filterTabs = [
  { id: 'mixed' as FilterTab, label: 'Misto', icon: Shuffle },
  { id: 'trending' as FilterTab, label: 'Em alta', icon: TrendingUp },
  { id: 'recent' as FilterTab, label: 'Recentes', icon: Clock },
  { id: 'solved' as FilterTab, label: 'Resolvidos', icon: CheckCircle2 },
];

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

function getFeedMode(filter: FilterTab): ModoOrdenacaoFeed {
  if (filter === 'trending') {
    return 'EM_ALTA';
  }

  if (filter === 'recent') {
    return 'RECENTES';
  }

  return 'MISTO';
}

function getFeedStatus(filter: FilterTab): StatusDenuncia | null {
  return filter === 'solved' ? 'CONCLUIDO' : null;
}

export function HomePage() {
  const navigate = useNavigate();
  const { usuario, logout } = useUser();
  const [selectedCategoryId, setSelectedCategoryId] = useState('TODAS');
  const [categorias, setCategorias] = useState<CategoriaResponseDTO[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('mixed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [feedPage, setFeedPage] = useState<PageResponse<FeedDenunciaResponseDTO> | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<Report | null>(null);
  const [reportReason, setReportReason] = useState<MotivoSinalizacaoDenuncia>('SPAM');
  const [reportComment, setReportComment] = useState('');
  const [isSendingReport, setIsSendingReport] = useState(false);

  const carregarFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    setFeedError(null);

    try {
      const response = await feedService.listarDenuncias({
        cidade: usuario?.cidade,
        modo: getFeedMode(selectedFilter),
        status: getFeedStatus(selectedFilter),
        categoriaId: selectedCategoryId === 'TODAS' ? null : Number(selectedCategoryId),
        termo: searchQuery,
        page: currentPage - 1,
        size: itemsPerPage,
      });
      setFeedPage(response);
    } catch (error) {
      setFeedError(getApiErrorMessage(error));
    } finally {
      setIsLoadingFeed(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedCategoryId, selectedFilter, usuario?.cidade]);

  useEffect(() => {
    carregarFeed();
  }, [carregarFeed]);

  useEffect(() => {
    let ativo = true;

    categoriaService.listar()
      .then((lista) => {
        if (ativo) {
          setCategorias(lista.filter((categoria) => categoria.ativa));
        }
      })
      .catch(() => {
        if (ativo) {
          setCategorias([]);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  const reports = useMemo(
    () => (feedPage?.content ?? []).map(mapFeedItemToReport),
    [feedPage],
  );

  const visibleReports = reports;

  const totalPages = feedPage?.totalPages ?? 0;
  const totalElements = feedPage?.totalElements ?? 0;
  const firstItem = totalElements === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastItem = Math.min(currentPage * itemsPerPage, totalElements);

  function updateInteracao(response: InteracaoDenunciaResponseDTO) {
    setFeedPage((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        content: current.content.map((item) => {
          if (item.denuncia.id !== response.denunciaId) {
            return item;
          }

          return {
            ...item,
            apoiadaPeloUsuario: response.confirmadaPeloUsuario,
            urgentePeloUsuario: response.marcadaUrgentePeloUsuario,
            denuncia: {
              ...item.denuncia,
              quantidadeConfirmacoes: response.quantidadeConfirmacoes,
              quantidadeUrgencias: response.quantidadeUrgencias,
              quantidadeComentarios: response.quantidadeComentarios,
              pontuacaoRelevancia: response.pontuacaoRelevancia,
            },
          };
        }),
      };
    });
  }

  async function toggleSupport(report: Report) {
    setInteractionError(null);
    const denunciaId = Number(report.id);

    try {
      const response = report.supportedByUser
        ? await interacaoDenunciaService.removerApoio(denunciaId)
        : await interacaoDenunciaService.apoiar(denunciaId);
      updateInteracao(response);
    } catch (error) {
      setInteractionError(getApiErrorMessage(error));
    }
  }

  async function toggleUrgent(report: Report) {
    setInteractionError(null);
    const denunciaId = Number(report.id);

    try {
      const response = report.urgentByUser
        ? await interacaoDenunciaService.removerUrgente(denunciaId)
        : await interacaoDenunciaService.marcarUrgente(denunciaId);
      updateInteracao(response);
    } catch (error) {
      setInteractionError(getApiErrorMessage(error));
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function submitReport() {
    if (!reportTarget || !reportComment.trim()) {
      return;
    }

    setIsSendingReport(true);
    setInteractionError(null);

    try {
      await denunciaService.sinalizar(Number(reportTarget.id), {
        motivo: reportReason,
        comentario: reportComment.trim(),
      });
      setReportTarget(null);
      setReportComment('');
      setReportReason('SPAM');
    } catch (error) {
      setInteractionError(getApiErrorMessage(error));
    } finally {
      setIsSendingReport(false);
    }
  }

  return (
    <div className="flex-1 pb-20 md:pb-0">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Logo size="md" showText={true} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        Ola, <span className="font-semibold">{usuario?.nome ?? 'morador'}</span>!
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

      <section className="bg-gradient-to-br from-[#087F5B] to-[#0F4C81] text-white px-6 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4 text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight">
                Vamos cuidar da cidade juntos
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-2xl">
                Informe problemas urbanos, acompanhe as solucoes e ajude a prefeitura a agir onde mais precisa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center md:justify-start md:shrink-0">
              <button
                onClick={() => navigate('/novo-relato')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Novo relato
              </button>
              <button
                onClick={() => navigate('/mapa')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                <MapPin className="w-5 h-5" />
                Ver no mapa
              </button>
              <button
                onClick={() => navigate('/minhas')}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                <Clock className="w-5 h-5" />
                Minhas denuncias
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex justify-center">
              <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-xl overflow-x-auto max-w-full">
                {filterTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSelectedFilter(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        selectedFilter === tab.id
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {(selectedCategoryId !== 'TODAS' || searchQuery) && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-7xl mx-auto space-y-6">
        {interactionError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl px-4 py-3 text-sm">
            {interactionError}
          </div>
        )}

        {isLoadingFeed && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            Carregando relatos...
          </div>
        )}

        {!isLoadingFeed && feedError && (
          <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
            <p className="text-destructive">{feedError}</p>
            <Button onClick={carregarFeed}>Tentar novamente</Button>
          </div>
        )}

        {!isLoadingFeed && !feedError && visibleReports.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            Nenhum relato encontrado para os filtros atuais.
          </div>
        )}

        {!isLoadingFeed && !feedError && visibleReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onSupport={() => toggleSupport(report)}
                onUrgent={() => toggleUrgent(report)}
                onReport={() => setReportTarget(report)}
                onClick={() => navigate(`/relato/${report.id}`)}
              />
            ))}
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Relatos por pagina:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{firstItem}-{lastItem}</span> de{' '}
            <span className="font-medium text-foreground">{totalElements}</span> relatos
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || totalPages === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}

            {totalPages > 5 && (
              <>
                <span className="text-muted-foreground px-1">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-8 h-8"
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categorias={categorias}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(categoryId) => {
          setSelectedCategoryId(categoryId);
          setCurrentPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <Dialog open={Boolean(reportTarget)} onOpenChange={(open) => !open && setReportTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar relato</DialogTitle>
            <DialogDescription>
              A moderacao vai avaliar sua sinalizacao. Informe o motivo e um comentario curto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={reportReason} onValueChange={(value) => setReportReason(value as MotivoSinalizacaoDenuncia)}>
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
              value={reportComment}
              onChange={(event) => setReportComment(event.target.value)}
              maxLength={500}
              placeholder="Explique brevemente o problema..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportTarget(null)}>Cancelar</Button>
            <Button onClick={submitReport} disabled={isSendingReport || !reportComment.trim()}>
              Enviar denuncia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
