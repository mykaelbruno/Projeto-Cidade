import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User,
  MapPin,
  FileText,
  ThumbsUp,
  CheckCircle2,
  Award,
  Settings,
  Bell as BellIcon,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  MessageCircle,
  PlayCircle,
  AlertTriangle,
  UserCircle,
} from 'lucide-react';
import { Logo } from './Logo';
import { NotificationsDrawer } from './NotificationsDrawer';

export function Profile() {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const stats = [
    { label: 'Relatos criados', value: '8', icon: FileText, color: 'text-blue-600' },
    { label: 'Apoios dados', value: '24', icon: ThumbsUp, color: 'text-green-600' },
    { label: 'Resolvidos', value: '5', icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  const badges = [
    { name: 'Cidadão Parceiro', icon: '🤝' },
    { name: 'Olho na Rua', icon: '👁️' },
    { name: 'Morador Ativo', icon: '⭐' },
  ];

  const menuItems = [
    { label: 'Configurações', icon: Settings, action: 'settings' },
    { label: 'Notificações', icon: BellIcon, action: 'notifications', badge: '3' },
    { label: 'Como funciona', icon: HelpCircle, action: 'help' },
    { label: 'Sair', icon: LogOut, action: 'logout', danger: true },
  ];

  return (
    <div className="flex-1 pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <Logo size="md" showText={true} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <BellIcon className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-foreground" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        Olá, <span className="font-semibold">Morador Cidadão</span>!
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
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/');
                        }}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header with Back Button */}
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

        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-display font-bold text-white">MC</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-foreground">
                Morador Cidadão
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                Mamanguape - PB
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-muted rounded-xl`}>
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

        {/* Badges */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold text-foreground">
              Conquistas
            </h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-xl"
              >
                <div className="text-2xl">{badge.icon}</div>
                <span className="text-xs text-center text-muted-foreground font-medium">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Sua participação ajuda a cidade a melhorar
          </p>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                onClick={() => {
                  if (item.action === 'logout') {
                    navigate('/');
                  }
                }}
                className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-muted transition-colors ${
                  index < menuItems.length - 1 ? 'border-b border-border' : ''
                } ${item.danger ? 'text-destructive' : 'text-foreground'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded-full font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">
            Conecta Cidadão v1.0.0
          </p>
          <p className="text-xs text-muted-foreground">
            Você informa. A prefeitura resolve.
          </p>
        </div>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
}
