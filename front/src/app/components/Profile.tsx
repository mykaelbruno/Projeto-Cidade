import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  MapPin,
  PencilLine,
  ThumbsUp,
  User,
  UserCircle,
} from 'lucide-react';
import { Logo } from './Logo';
import { NotificationBellButton } from './NotificationBellButton';
import { NotificationsDrawer } from './NotificationsDrawer';
import { Button } from './ui/button';
import { getApiErrorMessage } from '../services/apiClient';
import { denunciaService } from '../services/denunciaService';
import { useUser } from '../contexts/UserContext';
import { useUnreadNotificationsCount } from '../hooks/useUnreadNotificationsCount';
import { mapMinhaDenunciaToReport } from '../mappers/denunciaMapper';
import type { DenunciaResponseDTO } from '../types/denuncia';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

export function Profile() {
  const navigate = useNavigate();
  const { usuario, logout } = useUser();
  const { unreadCount } = useUnreadNotificationsCount();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [ultimasDenuncias, setUltimasDenuncias] = useState<DenunciaResponseDTO[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const carregarUltimosRelatos = useCallback(async () => {
    setIsLoadingReports(true);
    setReportsError(null);

    try {
      const response = await denunciaService.listarMinhas(0, 8);
      setUltimasDenuncias(response.content);
    } catch (error) {
      setReportsError(getApiErrorMessage(error));
      setUltimasDenuncias([]);
    } finally {
      setIsLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    carregarUltimosRelatos();
  }, [carregarUltimosRelatos]);

  const latestReports = useMemo(
    () => ultimasDenuncias.slice(0, 6).map(mapMinhaDenunciaToReport),
    [ultimasDenuncias],
  );

  const stats = useMemo(() => [
    {
      label: 'Relatos criados',
      value: ultimasDenuncias.length,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      label: 'Apoios recebidos',
      value: ultimasDenuncias.reduce((total, denuncia) => total + denuncia.quantidadeConfirmacoes, 0),
      icon: ThumbsUp,
      color: 'text-green-600',
    },
    {
      label: 'Resolvidos',
      value: ultimasDenuncias.filter((denuncia) => denuncia.status === 'CONCLUIDO').length,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
  ], [ultimasDenuncias]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function scrollCarousel(direction: 'left' | 'right') {
    const element = carouselRef.current;
    if (!element) {
      return;
    }

    const amount = Math.max(element.clientWidth * 0.8, 280);
    element.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }

  return (
    <div className="flex-1 pb-20 md:pb-0">
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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/feed')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao feed</span>
          </button>
          <div className="w-px h-6 bg-border" />
          <h1 className="text-2xl font-display font-bold text-foreground">Meu Perfil</h1>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-display font-bold text-white">
                {initials(usuario?.nome ?? 'Usuario')}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-display font-bold text-foreground">
                {usuario?.nome ?? 'Usuario'}
              </h2>
              <p className="text-sm text-muted-foreground">{usuario?.email}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {[usuario?.bairro, usuario?.cidade].filter(Boolean).join(', ') || 'Cidade nao informada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-muted rounded-xl">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-3xl font-display font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                Ultimos relatos
              </h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe rapidamente o que voce publicou por ultimo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => scrollCarousel('left')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollCarousel('right')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/minhas')}>
                Ver meus relatos
              </Button>
            </div>
          </div>

          {isLoadingReports ? (
            <div className="rounded-2xl border border-border bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
              Carregando seus relatos...
            </div>
          ) : reportsError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-5 py-4 text-sm text-destructive">
              {reportsError}
            </div>
          ) : latestReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Voce ainda nao criou relatos</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Quando publicar seu primeiro relato, ele vai aparecer aqui.
              </p>
            </div>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {latestReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => navigate(`/relato/${report.id}`)}
                  className="min-w-[260px] max-w-[260px] snap-start rounded-2xl border border-border bg-background p-4 text-left shadow-sm transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {report.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {report.status}
                    </span>
                  </div>
                  <h4 className="mt-3 line-clamp-2 font-display font-semibold text-foreground">
                    {report.title}
                  </h4>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {report.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{report.location}, {report.neighborhood}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <button
            type="button"
            disabled
            className="w-full flex items-center gap-3 px-6 py-4 text-foreground disabled:cursor-not-allowed disabled:opacity-100"
          >
            <PencilLine className="w-5 h-5 text-primary" />
            <span className="flex-1 text-left font-medium">Editar perfil</span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              Em breve
            </span>
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-destructive/10 transition-colors text-destructive"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left font-medium">Sair</span>
          </button>
        </div>
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
