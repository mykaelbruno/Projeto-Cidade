import { apiRequest } from './apiClient';
import type { InteracaoDenunciaResponseDTO } from '../types/denuncia';

export const interacaoDenunciaService = {
  obterStatus(denunciaId: number) {
    return apiRequest<InteracaoDenunciaResponseDTO>(`/api/denuncias/${denunciaId}/interacoes/status`);
  },

  apoiar(denunciaId: number) {
    return apiRequest<InteracaoDenunciaResponseDTO>(`/api/denuncias/${denunciaId}/confirmacoes`, {
      method: 'POST',
    });
  },

  removerApoio(denunciaId: number) {
    return apiRequest<InteracaoDenunciaResponseDTO>(`/api/denuncias/${denunciaId}/confirmacoes`, {
      method: 'DELETE',
    });
  },

  marcarUrgente(denunciaId: number) {
    return apiRequest<InteracaoDenunciaResponseDTO>(`/api/denuncias/${denunciaId}/urgencias`, {
      method: 'POST',
    });
  },

  removerUrgente(denunciaId: number) {
    return apiRequest<InteracaoDenunciaResponseDTO>(`/api/denuncias/${denunciaId}/urgencias`, {
      method: 'DELETE',
    });
  },
};
