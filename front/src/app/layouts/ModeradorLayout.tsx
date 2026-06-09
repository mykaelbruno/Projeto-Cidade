import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { LogOut, Settings, UserCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { NotificationsList } from '../components/NotificationsList';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { useUser } from '../contexts/UserContext';

export function ModeradorLayout() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size="sm" showText={true} />
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="min-w-0">
              <h1 className="truncate text-base font-display font-bold text-foreground sm:text-lg">
                Painel de Moderacao
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Cidade Ativa - Moderador</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <NotificationsList userRole="moderador" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((value) => !value)}
                className="rounded-lg p-2 transition-colors hover:bg-muted"
                title="Configuracoes"
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
                        Ola, <span className="font-semibold">Moderador</span>!
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">MODERADOR</p>
                    </div>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/moderador/perfil');
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
        </div>
      </header>

      <main className="min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      <ProfileSwitcher />
    </div>
  );
}
