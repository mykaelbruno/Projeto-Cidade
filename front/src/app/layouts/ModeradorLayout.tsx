import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import {
  Shield,
  Bell,
  Settings,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { NotificationsList } from '../components/NotificationsList';
import { useUser } from '../contexts/UserContext';

export function ModeradorLayout() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText={true} />
          <div className="w-px h-6 bg-border" />
          <div>
            <h1 className="text-lg font-display font-bold text-foreground">
              Painel de Moderação
            </h1>
            <p className="text-xs text-muted-foreground">Cidade Ativa - Moderador</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsList userRole="moderador" />

          <div className="w-px h-6 bg-border" />

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Configurações"
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
                      Olá, <span className="font-semibold">Moderador</span>!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MODERADOR
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/moderador/perfil');
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

      {/* Profile Switcher */}
      <ProfileSwitcher />
    </div>
  );
}
