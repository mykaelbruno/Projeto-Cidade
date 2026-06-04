import { Home, MapPin, Plus, FileText, User } from 'lucide-react';

type NavItem = 'feed' | 'map' | 'new' | 'mine' | 'profile';

interface BottomNavProps {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
}

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'feed' as NavItem, icon: Home, label: 'Feed' },
    { id: 'map' as NavItem, icon: MapPin, label: 'Mapa' },
    { id: 'new' as NavItem, icon: Plus, label: 'Nova', isMain: true },
    { id: 'mine' as NavItem, icon: FileText, label: 'Minhas' },
    { id: 'profile' as NavItem, icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;

          if (item.isMain) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-2 font-medium text-muted-foreground">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[60px]"
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
