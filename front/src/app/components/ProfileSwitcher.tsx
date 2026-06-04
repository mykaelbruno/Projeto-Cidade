import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getHomePathByUserType, useUser } from '../contexts/UserContext';
import { User, Building2, Briefcase, Shield, ChevronDown } from 'lucide-react';

export function ProfileSwitcher() {
  const { availableUserTypes, isAuthenticated, userType, setUserType } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const profiles = [
    {
      type: 'morador' as const,
      label: 'Morador',
      description: 'Visao do cidadao',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: getHomePathByUserType('morador'),
    },
    {
      type: 'prefeitura' as const,
      label: 'Prefeitura',
      description: 'Gestao municipal',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      path: getHomePathByUserType('prefeitura'),
    },
    {
      type: 'secretaria' as const,
      label: 'Secretaria',
      description: 'Atendimento setorial',
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      path: getHomePathByUserType('secretaria'),
    },
    {
      type: 'moderador' as const,
      label: 'Moderador',
      description: 'Moderacao de conteudo',
      icon: Shield,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      path: getHomePathByUserType('moderador'),
    },
    {
      type: 'admin_app' as const,
      label: 'Admin App',
      description: 'Administracao global',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      path: getHomePathByUserType('admin_app'),
    },
  ].filter((profile) => availableUserTypes.includes(profile.type));

  if (!isAuthenticated || profiles.length <= 1) {
    return null;
  }

  const currentProfile = profiles.find((profile) => profile.type === userType) || profiles[0];
  const Icon = currentProfile.icon;

  const handleProfileSwitch = (profile: typeof profiles[0]) => {
    setUserType(profile.type);
    navigate(profile.path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {isOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
            <div className="absolute bottom-full right-0 mb-3 w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-medium text-foreground">
                  Alternar area
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Acessos disponiveis para sua sessao
                </p>
              </div>
              <div className="py-2">
                {profiles.map((profile) => {
                  const ProfileIcon = profile.icon;
                  const isActive = profile.type === userType;

                  return (
                    <button
                      key={profile.type}
                      onClick={() => handleProfileSwitch(profile)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left ${
                        isActive ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className={`p-2 ${profile.bgColor} rounded-lg`}>
                        <ProfileIcon className={`w-4 h-4 ${profile.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {profile.label}
                          </span>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-[10px] font-medium">
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {profile.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-xl hover:shadow-2xl transition-all"
        >
          <div className={`p-2 ${currentProfile.bgColor} rounded-lg`}>
            <Icon className={`w-5 h-5 ${currentProfile.color}`} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-foreground">
              {currentProfile.label}
            </div>
            <div className="text-xs text-muted-foreground">
              Alternar area
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
}
