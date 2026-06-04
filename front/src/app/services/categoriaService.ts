import { apiRequest } from './apiClient';
import type {
  CategoriaCreateRequestDTO,
  CategoriaResponseDTO,
  CategoriaUpdateRequestDTO,
} from '../types/categoria';

export const categoriaService = {
  listar() {
    return apiRequest<CategoriaResponseDTO[]>('/api/categorias');
  },

  criar(payload: CategoriaCreateRequestDTO) {
    return apiRequest<CategoriaResponseDTO>('/api/categorias', {
      method: 'POST',
      body: payload,
    });
  },

  atualizar(categoriaId: number, payload: CategoriaUpdateRequestDTO) {
    return apiRequest<CategoriaResponseDTO>(`/api/categorias/${categoriaId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  alterarAtiva(categoriaId: number, ativo: boolean) {
    return apiRequest<CategoriaResponseDTO>(`/api/categorias/${categoriaId}/ativacao`, {
      method: 'PATCH',
      body: { ativo },
    });
  },
};
