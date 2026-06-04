import { apiRequest } from './apiClient';
import type { PageResponse } from '../types/api';
import type { FeedDenunciaFiltro, FeedDenunciaResponseDTO } from '../types/denuncia';

function appendParam(params: URLSearchParams, key: string, value: unknown) {
  if (value !== undefined && value !== null && value !== '') {
    params.set(key, String(value));
  }
}

export const feedService = {
  listarDenuncias(filtro: FeedDenunciaFiltro) {
    const params = new URLSearchParams();

    appendParam(params, 'cidade', filtro.cidade);
    appendParam(params, 'bairro', filtro.bairro);
    appendParam(params, 'status', filtro.status);
    appendParam(params, 'categoriaId', filtro.categoriaId);
    appendParam(params, 'modo', filtro.modo ?? 'MISTO');
    appendParam(params, 'excluirProprias', filtro.excluirProprias);
    appendParam(params, 'termo', filtro.termo?.trim());
    appendParam(params, 'page', filtro.page ?? 0);
    appendParam(params, 'size', filtro.size ?? 12);

    return apiRequest<PageResponse<FeedDenunciaResponseDTO>>(`/api/feed/denuncias?${params.toString()}`);
  },
};
