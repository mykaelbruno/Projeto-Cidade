import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Bell,
  User,
  ArrowLeft,
  AlertCircle,
  PlayCircle,
  Calendar,
  MapPin,
  MessageCircle,
  ThumbsUp,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { Report } from './ReportCard';
import { Logo } from './Logo';
import { NotificationsDrawer } from './NotificationsDrawer';
import { Button } from './ui/button';
import { useUser } from '../contexts/UserContext';

interface MyReportsProps {
  reports: Report[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onReportClick: (report: Report) => void;
}

const statusConfig = {
  Aberto: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100', iconBg: 'bg-slate-600' },
  'Em analise': { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', iconBg: 'bg-blue-600' },
  Encaminhado: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', iconBg: 'bg-orange-600' },
  'Em andamento': { icon: PlayCircle, color: 'text-amber-600', bg: 'bg-amber-100', iconBg: 'bg-amber-600' },
  Programado: { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100', iconBg: 'bg-indigo-600' },
  Concluido: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', iconBg: 'bg-green-600' },
  'Aguardando confirmacao': { icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-100', iconBg: 'bg-purple-600' },
  Reaberto: { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', iconBg: 'bg-orange-600' },
  Arquivado: { icon: FileText, color: 'text-zinc-600', bg: 'bg-zinc-100', iconBg: 'bg-zinc-600' },
};

type FilterTab = 'all' | 'open' | 'progress' | 'solved';

const filterTabs = [
  { id: 'all' as FilterTab, label: 'Todos', icon: FileText },
  { id: 'open' as FilterTab, label: 'Abertos', icon: AlertCircle },
  { id: 'progress' as FilterTab, label: 'Em andamento', icon: PlayCircle },
  { id: 'solved' as FilterTab, label: 'Resolvidos', icon: CheckCircle2 },
];

function getStatusConfig(status: string) {
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.Aberto;
}

function isAwaitingConfirmation(report: Report) {
  return report.status === 'Aguardando confirmacao';
}

function matchesFilter(report: Report, filter: FilterTab) {
  if (filter === 'open') {
    return report.status === 'Aberto' || report.status === 'Reaberto';
  }

  if (filter === 'progress') {
    return ['Em analise', 'Encaminhado', 'Em andamento', 'Programado'].includes(report.status);
  }

  if (filter === 'solved') {
    return report.status === 'Concluido';
  }

  return true;
}

interface CompactReportCardProps {
  report: Report;
  onClick: () => void;
}

function CompactReportCard({ report, onClick }: CompactReportCardProps) {
  const config = getStatusConfig(report.status);
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all text-left group"
    >
      <div className="relative h-32 bg-muted overflow-hidden">
        {report.image ? (
          <img
            src={report.image}
            alt={report.title}
            className="w-full h-full object-cover opacity-35 group-hover:opacity-50 transition-opacity"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-sky-50 to-emerald-50" />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className={`w-14 h-14 ${config.iconBg} rounded-full flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} shadow-sm`}>
            {report.status}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {report.category}
        </span>

        <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2 leading-tight">
          {report.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{report.location}, {report.neighborhood}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            <span>{report.supports}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{report.comments}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{report.timeAgo}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function MyReports({ reports, isLoading = false, error, onRetry, onReportClick }: MyReportsProps) {
  const navigate = useNavigate();
  const { usuario, logout } = useUser();
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('all');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const awaitingReports = reports.filter(isAwaitingConfirmation);
  const regularReports = reports.filter((report) => !isAwaitingConfirmation(report));
  const filteredReports = regularReports.filter((report) => matchesFilter(report, selectedFilter));

  async function handleLogout() {
    await logout();
    navigate('/');
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
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/feed')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao feed</span>
          </button>
          <div className="w-px h-6 bg-border" />
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Minhas solicitacoes
            </h1>
          </div>
        </div>

        {isLoading && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            Carregando suas solicitacoes...
          </div>
        )}

        {!isLoading && error && (
          <div className="bg-card rounded-xl border border-border p-8 text-center space-y-4">
            <p className="text-destructive">{error}</p>
            {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                Aguardando sua confirmacao
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className={`${awaitingReports.length > 0 ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200' : 'bg-muted/50 border border-border'} rounded-xl overflow-hidden`}>
                  <div className="relative h-32 bg-gradient-to-br from-purple-100 to-purple-50 flex flex-col items-center justify-center gap-2">
                    <div className={`w-14 h-14 ${awaitingReports.length > 0 ? 'bg-purple-600' : 'bg-muted'} rounded-full flex items-center justify-center shadow-lg`}>
                      {awaitingReports.length > 0 ? (
                        <AlertCircle className="w-7 h-7 text-white" />
                      ) : (
                        <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    {awaitingReports.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 shadow-sm">
                        {awaitingReports.length} {awaitingReports.length === 1 ? 'relato' : 'relatos'}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                      {awaitingReports.length > 0 ? 'Confirme a resolucao' : 'Nenhum aguardando'}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {awaitingReports.length > 0
                        ? 'Verifique se os problemas reportados foram resolvidos'
                        : 'Voce sera notificado quando houver relatos concluidos'}
                    </p>
                  </div>
                </div>

                {awaitingReports.map((report) => (
                  <CompactReportCard
                    key={report.id}
                    report={report}
                    onClick={() => onReportClick(report)}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-xs text-muted-foreground">---</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold text-foreground">
                Todos os relatos
              </h2>

              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 bg-muted p-1 rounded-xl">
                  {filterTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedFilter(tab.id)}
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

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredReports.length === 0 && (
                  <div className="col-span-full bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                    Nenhum relato encontrado para este filtro.
                  </div>
                )}

                {filteredReports.map((report) => (
                  <CompactReportCard
                    key={report.id}
                    report={report}
                    onClick={() => onReportClick(report)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
