import { apiRequest } from './apiClient';
import type { PageResponse } from '../types/api';
import type { AuditoriaResponseDTO, ListarAuditoriasParams } from '../types/auditoria';

function appendParam(params: URLSearchParams, key: string, value: unknown) {
  if (value !== undefined && value !== null && value !== '') {
    params.set(key, String(value));
  }
}

export const auditoriaService = {
  listar(params: ListarAuditoriasParams = {}) {
    const searchParams = new URLSearchParams();

    appendParam(searchParams, 'acao', params.acao);
    appendParam(searchParams, 'alvoTipo', params.alvoTipo);
    appendParam(searchParams, 'alvoId', params.alvoId);
    appendParam(searchParams, 'atorId', params.atorId);
    appendParam(searchParams, 'page', params.page ?? 0);
    appendParam(searchParams, 'size', params.size ?? 20);

    return apiRequest<PageResponse<AuditoriaResponseDTO>>(`/api/auditorias?${searchParams.toString()}`);
  },

  listarDaPrefeitura(prefeituraId: number, params: ListarAuditoriasParams = {}) {
    const searchParams = new URLSearchParams();

    appendParam(searchParams, 'acao', params.acao);
    appendParam(searchParams, 'alvoTipo', params.alvoTipo);
    appendParam(searchParams, 'alvoId', params.alvoId);
    appendParam(searchParams, 'atorId', params.atorId);
    appendParam(searchParams, 'page', params.page ?? 0);
    appendParam(searchParams, 'size', params.size ?? 20);

    return apiRequest<PageResponse<AuditoriaResponseDTO>>(
      `/api/auditorias/prefeituras/${prefeituraId}?${searchParams.toString()}`,
    );
  },
};
