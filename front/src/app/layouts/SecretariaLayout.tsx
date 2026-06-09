import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationsList } from '../components/NotificationsList';
import { useUser } from '../contexts/UserContext';

const menuItems = [
  { id: 'dashboard', label: 'Painel Operacional', icon: LayoutDashboard, path: '/secretaria/dashboard' },
  { id: 'relatos', label: 'Relatos Atribuidos', icon: FileText, path: '/secretaria/relatos' },
  { id: 'usuarios', label: 'Usuarios', icon: Users, path: '/secretaria/usuarios' },
];

export function SecretariaLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUser();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const currentPath = location.pathname;
  const activeItem = menuItems.find((item) => currentPath.startsWith(item.path))?.id || 'dashboard';
  const showCompactSidebar = isSidebarCollapsed && !isMobileSidebarOpen;

  return (
    <div className="min-h-screen bg-background">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card transition-transform duration-300 lg:z-30 lg:max-w-none ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo size="sm" showText={!showCompactSidebar} />

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setIsMobileSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!showCompactSidebar && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-border p-3 lg:block">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((value) => !value)}
            className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Recolher</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:h-16 lg:px-6 lg:py-0">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-display font-bold text-foreground sm:text-lg">
                Painel da Secretaria
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Secretaria de Infraestrutura</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsList userRole="secretaria" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((value) => !value)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
                title="Perfil"
              >
                <Settings className="h-5 w-5 text-foreground" />
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                    <div className="border-b border-border p-4">
                      <p className="text-sm font-medium text-foreground">
                        Ola, <span className="font-semibold">Equipe da secretaria</span>!
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">SECRETARIA</p>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/secretaria/perfil');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <UserCircle className="h-4 w-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Perfil</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsProfileOpen(false);
                          await logout();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Sair</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
