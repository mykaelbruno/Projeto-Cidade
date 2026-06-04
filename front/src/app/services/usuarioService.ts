import { apiRequest } from './apiClient';
import type {
  PerfilUsuario,
  UsuarioCreateRequestDTO,
  UsuarioResponseDTO,
  UsuarioUpdateRequestDTO,
} from '../types/usuario';

interface ListarUsuariosParams {
  termo?: string;
  perfilGlobal?: PerfilUsuario | null;
  ativo?: boolean | null;
}

export const usuarioService = {
  listar(params: ListarUsuariosParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.termo?.trim()) {
      searchParams.set('termo', params.termo.trim());
    }
    if (params.perfilGlobal) {
      searchParams.set('perfilGlobal', params.perfilGlobal);
    }
    if (params.ativo !== undefined && params.ativo !== null) {
      searchParams.set('ativo', String(params.ativo));
    }

    const query = searchParams.toString();
    return apiRequest<UsuarioResponseDTO[]>(`/api/usuarios${query ? `?${query}` : ''}`);
  },

  criar(payload: UsuarioCreateRequestDTO) {
    return apiRequest<UsuarioResponseDTO>('/api/usuarios', {
      method: 'POST',
      body: payload,
    });
  },

  atualizar(usuarioId: number, payload: UsuarioUpdateRequestDTO) {
    return apiRequest<UsuarioResponseDTO>(`/api/usuarios/${usuarioId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  alterarAtivo(usuarioId: number, ativo: boolean) {
    return apiRequest<UsuarioResponseDTO>(`/api/usuarios/${usuarioId}/ativacao`, {
      method: 'PATCH',
      body: { ativo },
    });
  },
};
