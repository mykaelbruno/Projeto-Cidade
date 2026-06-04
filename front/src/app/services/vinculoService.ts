import { apiRequest } from './apiClient';
import type {
  VinculoUsuarioOrganizacaoCreateRequestDTO,
  VinculoTransferenciaSecretariaRequestDTO,
  VinculoUsuarioOrganizacaoResponseDTO,
  VinculoUsuarioOrganizacaoUpdateRequestDTO,
} from '../types/vinculo';

export const vinculoService = {
  listar() {
    return apiRequest<VinculoUsuarioOrganizacaoResponseDTO[]>('/api/vinculos');
  },

  listarPorOrganizacao(organizacaoId: number) {
    return apiRequest<VinculoUsuarioOrganizacaoResponseDTO[]>(
      `/api/vinculos/organizacoes/${organizacaoId}`,
    );
  },

  criar(payload: VinculoUsuarioOrganizacaoCreateRequestDTO) {
    return apiRequest<VinculoUsuarioOrganizacaoResponseDTO>('/api/vinculos', {
      method: 'POST',
      body: payload,
    });
  },

  atualizar(vinculoId: number, payload: VinculoUsuarioOrganizacaoUpdateRequestDTO) {
    return apiRequest<VinculoUsuarioOrganizacaoResponseDTO>(`/api/vinculos/${vinculoId}`, {
      method: 'PUT',
      body: payload,
    });
  },

  transferirSecretaria(vinculoId: number, payload: VinculoTransferenciaSecretariaRequestDTO) {
    return apiRequest<VinculoUsuarioOrganizacaoResponseDTO>(`/api/vinculos/${vinculoId}/secretaria`, {
      method: 'PATCH',
      body: payload,
    });
  },
};
