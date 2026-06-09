import type { UserType } from '../types/auth';

export function buildLoginRedirectPath(
  targetPath: string,
  reason: 'required' | 'expired' = 'required',
) {
  const params = new URLSearchParams();
  params.set('motivo', reason);

  if (targetPath && targetPath !== '/') {
    params.set('redirect', targetPath);
  }

  return `/?${params.toString()}`;
}

const pathPrefixesByUserType: Record<UserType, string[]> = {
  admin_app: ['/admin-app'],
  moderador: ['/moderador'],
  prefeitura: ['/prefeitura'],
  secretaria: ['/secretaria'],
  morador: ['/feed', '/mapa', '/minhas', '/perfil', '/relato', '/novo-relato'],
};

export function isRedirectPathCompatible(userType: UserType, targetPath: string | null | undefined) {
  if (!targetPath || !targetPath.startsWith('/')) {
    return false;
  }

  return pathPrefixesByUserType[userType].some((prefix) => (
    targetPath === prefix || targetPath.startsWith(`${prefix}/`)
  ));
}
