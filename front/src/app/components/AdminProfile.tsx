import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User,
  Building2,
  FileText,
  CheckCircle2,
  Settings,
  Bell as BellIcon,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Shield,
  Clock,
  BarChart3,
} from 'lucide-react';

export function AdminProfile() {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const stats = [
    { label: 'Relatos atribuídos', value: '156', icon: FileText, color: 'text-blue-600' },
    { label: 'Resolvidos', value: '128', icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Tempo médio', value: '4.8d', icon: Clock, color: 'text-amber-600' },
  ];

  const menuItems = [
    { label: 'Configurações da conta', icon: Settings, action: 'settings' },
    { label: 'Notificações', icon: BellIcon, action: 'notifications', badge: '5' },
    { label: 'Ajuda e suporte', icon: HelpCircle, action: 'help' },
    { label: 'Sair', icon: LogOut, action: 'logout', danger: true },
  ];

  return (
    <div className="flex-1">
      {/* Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Page Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/prefeitura/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao painel</span>
          </button>
          <div className="w-px h-6 bg-border" />
          <h1 className="text-2xl font-display font-bold text-foreground">Perfil da Prefeitura</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-foreground">
                  Prefeitura Municipal de Mamanguape
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    João Silva
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Admin da Prefeitura
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  joao.silva@prefeitura.gov.br
                </p>
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

        {/* Informações da Organização */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-display font-semibold text-foreground">
              Informações da Organização
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">PREFEITURA</p>
              <p className="text-sm font-medium text-foreground">PMM - Mamanguape</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">CIDADE</p>
              <p className="text-sm font-medium text-foreground">Mamanguape - PB</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">SECRETARIAS ATIVAS</p>
              <p className="text-sm font-medium text-foreground">4 secretarias</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">OPERADORES</p>
              <p className="text-sm font-medium text-foreground">6 usuários ativos</p>
            </div>
          </div>
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
            Cidade Ativa - Painel Administrativo v1.0.0
          </p>
          <p className="text-xs text-muted-foreground">
            Gestão eficiente de zeladoria urbana
          </p>
        </div>
      </div>
    </div>
  );
}
