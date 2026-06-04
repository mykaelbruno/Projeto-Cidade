import { apiRequest } from './apiClient';
import type {
  AuthResponseDTO,
  CadastroMoradorRequestDTO,
  LoginRequestDTO,
  UsuarioLogadoResponseDTO,
} from '../types/auth';

export const authService = {
  login(payload: LoginRequestDTO) {
    return apiRequest<AuthResponseDTO>('/api/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  cadastrarMorador(payload: CadastroMoradorRequestDTO) {
    return apiRequest<AuthResponseDTO>('/api/auth/cadastro-morador', {
      method: 'POST',
      body: payload,
    });
  },

  logout() {
    return apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    });
  },

  refresh() {
    return apiRequest<void>('/api/auth/refresh', {
      method: 'POST',
    });
  },

  me() {
    return apiRequest<UsuarioLogadoResponseDTO>('/api/auth/me');
  },
};
