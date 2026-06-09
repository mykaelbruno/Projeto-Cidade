import type { ErroApiResponse } from '../types/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8080';
let refreshPromise: Promise<boolean> | null = null;

export function getApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  if (API_BASE_URL.endsWith('/api') && normalizedPath === '/api') {
    return API_BASE_URL;
  }

  if (API_BASE_URL.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedPath.slice('/api'.length)}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export class ApiError extends Error {
  status: number;
  payload?: ErroApiResponse;

  constructor(status: number, message: string, payload?: ErroApiResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

function isAuthEndpoint(path: string): boolean {
  return path === '/api/auth/login'
    || path === '/api/auth/logout'
    || path === '/api/auth/refresh'
    || path === '/api/auth/me'
    || path === '/api/auth/cadastro-morador';
}

function buildLoginRedirectUrl(reason: 'expired' | 'required' = 'expired') {
  if (typeof window === 'undefined') {
    return '/';
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const params = new URLSearchParams();
  params.set('motivo', reason);

  if (currentPath && currentPath !== '/') {
    params.set('redirect', currentPath);
  }

  return `/?${params.toString()}`;
}

function redirectToLogin(reason: 'expired' | 'required' = 'expired') {
  if (typeof window === 'undefined') {
    return;
  }

  const destination = buildLoginRedirectUrl(reason);
  if (window.location.pathname + window.location.search + window.location.hash !== destination) {
    window.location.assign(destination);
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetch(getApiUrl('/api/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const errorPayload = data as ErroApiResponse | undefined;
    throw new ApiError(
      response.status,
      errorPayload?.mensagem || 'Erro ao se comunicar com o servidor.',
      errorPayload,
    );
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return doApiRequest<T>(path, options, true);
}

async function doApiRequest<T>(
  path: string,
  options: ApiRequestOptions,
  allowRefreshRetry: boolean,
): Promise<T> {
  const headers = new Headers(options.headers);
  const hasFormData = options.body instanceof FormData;

  if (options.body !== undefined && !hasFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    body: hasFormData ? options.body : JSON.stringify(options.body),
    credentials: 'include',
    headers,
  });

  if (response.status === 401 && allowRefreshRetry && !isAuthEndpoint(path)) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      return doApiRequest<T>(path, options, false);
    }

    redirectToLogin('expired');
  }

  return parseResponse<T>(response);
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro inesperado. Tente novamente.';
}
