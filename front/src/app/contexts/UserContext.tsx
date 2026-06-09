import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ApiError } from '../services/apiClient';
import { authService } from '../services/authService';
import type {
  LoginRequestDTO,
  UserType,
  UsuarioLogadoResponseDTO,
  UsuarioResponseDTO,
  VinculoUsuarioOrganizacaoResponseDTO,
} from '../types/auth';

export type { UserType } from '../types/auth';

interface UserContextType {
  usuario: UsuarioResponseDTO | null;
  papeis: string[];
  vinculosOperacionais: VinculoUsuarioOrganizacaoResponseDTO[];
  userType: UserType;
  availableUserTypes: UserType[];
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionError: string | null;
  setUserType: (type: UserType) => void;
  login: (payload: LoginRequestDTO) => Promise<{ session: UsuarioLogadoResponseDTO; userType: UserType }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<UsuarioLogadoResponseDTO | null>;
  hasUserType: (type: UserType) => boolean;
  isAdmin: boolean;
  isSecretaria: boolean;
  isMorador: boolean;
  isAdminApp: boolean;
  isModerador: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

function getAvailableUserTypes(session: UsuarioLogadoResponseDTO | null): UserType[] {
  if (!session) {
    return [];
  }

  const types = new Set<UserType>();
  const { usuario, vinculosOperacionais } = session;

  if (usuario.perfilGlobal === 'ADMIN') {
    types.add('admin');
  }

  if (usuario.perfilGlobal === 'MODERADOR') {
    types.add('moderador');
  }

  if (usuario.perfilGlobal === 'MORADOR') {
    types.add('morador');
  }

  vinculosOperacionais
    .filter((vinculo) => vinculo.ativo)
    .forEach((vinculo) => {
      if (vinculo.papel === 'PREFEITURA') {
        types.add('prefeitura');
      }

      if (vinculo.papel === 'SECRETARIA') {
        types.add('secretaria');
      }
    });

  return Array.from(types);
}

function pickInitialUserType(types: UserType[]): UserType {
  return (
    types.find((type) => type === 'admin') ??
    types.find((type) => type === 'moderador') ??
    types.find((type) => type === 'prefeitura') ??
    types.find((type) => type === 'secretaria') ??
    types.find((type) => type === 'morador') ??
    'morador'
  );
}

export function getHomePathByUserType(userType: UserType) {
  switch (userType) {
    case 'admin':
      return '/admin-app/visao-geral';
    case 'moderador':
      return '/moderador/painel';
    case 'prefeitura':
      return '/prefeitura/dashboard';
    case 'secretaria':
      return '/secretaria/dashboard';
    case 'morador':
    default:
      return '/feed';
  }
}

export function UserProvider({ children }: UserProviderProps) {
  const [session, setSession] = useState<UsuarioLogadoResponseDTO | null>(null);
  const [activeUserType, setActiveUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const availableUserTypes = useMemo(() => getAvailableUserTypes(session), [session]);

  const userType = useMemo(() => {
    if (activeUserType && availableUserTypes.includes(activeUserType)) {
      return activeUserType;
    }

    return pickInitialUserType(availableUserTypes);
  }, [activeUserType, availableUserTypes]);

  const applySession = useCallback((nextSession: UsuarioLogadoResponseDTO | null) => {
    setSession(nextSession);
    setSessionError(null);

    if (!nextSession) {
      setActiveUserType(null);
      return;
    }

    const types = getAvailableUserTypes(nextSession);
    setActiveUserType((current) => {
      if (current && types.includes(current)) {
        return current;
      }

      return pickInitialUserType(types);
    });
  }, []);

  const carregarSessao = useCallback(async () => {
    const currentSession = await authService.me();
    applySession(currentSession);
    return currentSession;
  }, [applySession]);

  const refreshSession = useCallback(async () => {
    try {
      return await carregarSessao();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          await authService.refresh();
          return await carregarSessao();
        } catch (refreshError) {
          if (refreshError instanceof ApiError && refreshError.status === 401) {
            applySession(null);
            return null;
          }

          setSessionError('Nao foi possivel renovar sua sessao.');
          throw refreshError;
        }
      }

      setSessionError('Nao foi possivel carregar sua sessao.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [applySession, carregarSessao]);

  useEffect(() => {
    refreshSession().catch(() => {
      setIsLoading(false);
    });
  }, [refreshSession]);

  const login = useCallback(
    async (payload: LoginRequestDTO) => {
      await authService.login(payload);
      setIsLoading(true);
      const currentSession = await refreshSession();

      if (!currentSession) {
        throw new Error('Nao foi possivel carregar sua sessao apos o login.');
      }

      const preferredUserType = pickInitialUserType(getAvailableUserTypes(currentSession));
      setActiveUserType(preferredUserType);

      return {
        session: currentSession,
        userType: preferredUserType,
      };
    },
    [refreshSession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      applySession(null);
      setIsLoading(false);
    }
  }, [applySession]);

  const setUserType = useCallback(
    (type: UserType) => {
      if (availableUserTypes.includes(type)) {
        setActiveUserType(type);
      }
    },
    [availableUserTypes],
  );

  const hasUserType = useCallback(
    (type: UserType) => availableUserTypes.includes(type),
    [availableUserTypes],
  );

  const value: UserContextType = {
    usuario: session?.usuario ?? null,
    papeis: session?.papeis ?? [],
    vinculosOperacionais: session?.vinculosOperacionais ?? [],
    userType,
    availableUserTypes,
    isAuthenticated: Boolean(session?.usuario),
    isLoading,
    sessionError,
    setUserType,
    login,
    logout,
    refreshSession,
    hasUserType,
    isAdmin: userType === 'prefeitura',
    isSecretaria: userType === 'secretaria',
    isMorador: userType === 'morador',
    isAdminApp: userType === 'admin',
    isModerador: userType === 'moderador',
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
