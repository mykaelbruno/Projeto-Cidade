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
