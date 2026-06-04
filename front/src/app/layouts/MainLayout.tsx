import { Outlet, useNavigate, useLocation } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { Footer } from '../components/Footer';

type NavItem = 'feed' | 'map' | 'new' | 'mine' | 'profile';

const routeToNavMap: Record<string, NavItem> = {
  '/feed': 'feed',
  '/': 'feed',
  '/mapa': 'map',
  '/minhas': 'mine',
  '/perfil': 'profile',
};

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active nav item based on current route
  const currentPath = location.pathname;
  const activeNav = routeToNavMap[currentPath] || 'feed';

  const handleNavigate = (item: NavItem) => {
    if (item === 'new') {
      navigate('/novo-relato');
    } else if (item === 'feed') {
      navigate('/feed');
    } else if (item === 'map') {
      navigate('/mapa');
    } else if (item === 'mine') {
      navigate('/minhas');
    } else if (item === 'profile') {
      navigate('/perfil');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />

      <div className="md:hidden">
        <BottomNav active={activeNav} onNavigate={handleNavigate} />
      </div>
    </div>
  );
}
