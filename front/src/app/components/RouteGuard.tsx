import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getHomePathByUserType, useUser, UserType } from '../contexts/UserContext';
import { buildLoginRedirectPath } from '../utils/authNavigation';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles: UserType[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { isAuthenticated, isLoading, userType, hasUserType, setUserType } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const hasPermission = allowedRoles.some((role) => hasUserType(role));
  const isActiveRoleAllowed = allowedRoles.includes(userType);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const redirectPath = `${location.pathname}${location.search}${location.hash}`;
      navigate(buildLoginRedirectPath(redirectPath, 'required'), { replace: true });
      return;
    }

    if (!hasPermission) {
      navigate(getHomePathByUserType(userType), { replace: true });
      return;
    }

    if (!allowedRoles.includes(userType)) {
      const nextUserType = allowedRoles.find((role) => hasUserType(role));
      if (nextUserType) {
        setUserType(nextUserType);
      }
    }
  }, [allowedRoles, hasPermission, hasUserType, isAuthenticated, isLoading, location.hash, location.pathname, location.search, navigate, setUserType, userType]);

  if (isLoading || !isAuthenticated || !hasPermission || !isActiveRoleAllowed) {
    return null;
  }

  return <>{children}</>;
}
