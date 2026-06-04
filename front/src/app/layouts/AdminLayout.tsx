import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  FileText,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  MapPin,
  LogOut,
  UserCog,
  UserCircle,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationsDrawer } from '../components/NotificationsDrawer';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { NotificationsList } from '../components/NotificationsList';
import { useUser } from '../contexts/UserContext';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/prefeitura/dashboard' },
  { id: 'relatos', label: 'Relatos', icon: FileText, path: '/prefeitura/relatos' },
  { id: 'administracao', label: 'Administracao', icon: UserCog, path: '/prefeitura/administracao' },
  { id: 'bairros', label: 'Bairros', icon: MapPin, path: '/prefeitura/bairros' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const { logout, setUserType, hasUserType } = useUser();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentPath = location.pathname;
  const activeItem = menuItems.find(item => currentPath.startsWith(item.path))?.id || 'dashboard';

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-card border-r border-border flex flex-col transition-all duration-300 fixed left-0 top-0 bottom-0 z-30`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!isSidebarCollapsed && <Logo size="sm" showText={true} />}
          {isSidebarCollapsed && <Logo size="sm" showText={false} />}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">
              Painel Administrativo
            </h1>
            <p className="text-xs text-muted-foreground">Prefeitura de Mamanguape</p>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsList userRole="prefeitura" />

            <div className="w-px h-6 bg-border" />

            <button
              onClick={() => {
                if (hasUserType('morador')) {
                  setUserType('morador');
                }
                navigate('/feed');
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <User className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground">Ver como morador</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Configurações da Prefeitura"
              >
                <Settings className="w-5 h-5 text-foreground" />
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
                        Olá, <span className="font-semibold">Admin Prefeitura</span>!
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/prefeitura/perfil');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                      >
                        <UserCircle className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Perfil</span>
                      </button>
                      <button
                        onClick={async () => {
                          setIsProfileOpen(false);
                          await logout();
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
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Profile Switcher */}
      <ProfileSwitcher />
    </div>
  );
}
