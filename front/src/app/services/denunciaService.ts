import { apiRequest } from './apiClient';
import type { PageResponse } from '../types/api';
import type {
  AnexoDenunciaResponseDTO,
  ComentarioResponseDTO,
  DenunciaCreateRequestDTO,
  DenunciaResponseDTO,
  DenunciaSemelhanteResponseDTO,
  SinalizacaoDenunciaRequestDTO,
  TimelineDenunciaResponseDTO,
} from '../types/denuncia';

export const denunciaService = {
  criar(payload: DenunciaCreateRequestDTO) {
    return apiRequest<DenunciaResponseDTO>('/api/denuncias', {
      method: 'POST',
      body: payload,
    });
  },

  buscarSemelhantes(payload: DenunciaCreateRequestDTO) {
    return apiRequest<DenunciaSemelhanteResponseDTO[]>('/api/denuncias/semelhantes', {
      method: 'POST',
      body: payload,
    });
  },

  detalhar(denunciaId: number) {
    return apiRequest<DenunciaResponseDTO>(`/api/denuncias/${denunciaId}`);
  },

  listarMinhas(page = 0, size = 50) {
    return apiRequest<PageResponse<DenunciaResponseDTO>>(
      `/api/denuncias/minhas?page=${page}&size=${size}`,
    );
  },

  listarAnexos(denunciaId: number) {
    return apiRequest<PageResponse<AnexoDenunciaResponseDTO>>(
      `/api/denuncias/${denunciaId}/anexos?page=0&size=20`,
    );
  },

  anexar(denunciaId: number, arquivo: File) {
    const formData = new FormData();
    formData.append('arquivo', arquivo);

    return apiRequest<AnexoDenunciaResponseDTO>(`/api/denuncias/${denunciaId}/anexos`, {
      method: 'POST',
      body: formData,
    });
  },

  listarComentarios(denunciaId: number) {
    return apiRequest<PageResponse<ComentarioResponseDTO>>(
      `/api/denuncias/${denunciaId}/comentarios?page=0&size=50`,
    );
  },

  comentar(denunciaId: number, conteudo: string) {
    return apiRequest<ComentarioResponseDTO>(`/api/denuncias/${denunciaId}/comentarios`, {
      method: 'POST',
      body: { conteudo },
    });
  },

  removerComentario(denunciaId: number, comentarioId: number) {
    return apiRequest<void>(`/api/denuncias/${denunciaId}/comentarios/${comentarioId}`, {
      method: 'DELETE',
    });
  },

  listarTimeline(denunciaId: number) {
    return apiRequest<PageResponse<TimelineDenunciaResponseDTO>>(
      `/api/denuncias/${denunciaId}/timeline?page=0&size=30`,
    );
  },

  confirmarConclusao(denunciaId: number, feedback: string) {
    return apiRequest<DenunciaResponseDTO>(`/api/denuncias/${denunciaId}/conclusao/confirmacao`, {
      method: 'POST',
      body: { feedback },
    });
  },

  contestarConclusao(denunciaId: number, feedback: string) {
    return apiRequest<DenunciaResponseDTO>(`/api/denuncias/${denunciaId}/conclusao/contestacao`, {
      method: 'POST',
      body: { feedback },
    });
  },

  sinalizar(denunciaId: number, payload: SinalizacaoDenunciaRequestDTO) {
    return apiRequest(`/api/denuncias/${denunciaId}/sinalizacoes`, {
      method: 'POST',
      body: payload,
    });
  },

  sinalizarComentario(denunciaId: number, comentarioId: number, payload: SinalizacaoDenunciaRequestDTO) {
    return apiRequest(`/api/denuncias/${denunciaId}/comentarios/${comentarioId}/sinalizacoes`, {
      method: 'POST',
      body: payload,
    });
  },
};
