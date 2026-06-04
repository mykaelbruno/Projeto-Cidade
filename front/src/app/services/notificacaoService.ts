import { apiRequest } from './apiClient';
import type { NotificacaoResponseDTO, PageResponse } from '../types/notificacao';

interface ListarNotificacoesParams {
  somenteNaoLidas?: boolean;
  page?: number;
  size?: number;
}

export const notificacaoService = {
  listarMinhas(params: ListarNotificacoesParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.somenteNaoLidas !== undefined) {
      searchParams.set('somenteNaoLidas', String(params.somenteNaoLidas));
    }
    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.size !== undefined) {
      searchParams.set('size', String(params.size));
    }

    const query = searchParams.toString();
    return apiRequest<PageResponse<NotificacaoResponseDTO>>(
      `/api/notificacoes/minhas${query ? `?${query}` : ''}`,
    );
  },

  marcarComoLida(notificacaoId: number) {
    return apiRequest<NotificacaoResponseDTO>(`/api/notificacoes/${notificacaoId}/leitura`, {
      method: 'PATCH',
    });
  },

  marcarTodasComoLidas() {
    return apiRequest<void>('/api/notificacoes/leitura', {
      method: 'PATCH',
    });
  },
};
