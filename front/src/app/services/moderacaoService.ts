import { apiRequest } from './apiClient';
import type {
  AcaoModeracaoUsuario,
  ModeracaoRequestDTO,
  ModeracaoResponseDTO,
  PaginaHistoricoModeracao,
  PaginaSinalizacoes,
  PainelModeracaoResumoDTO,
  SinalizacaoDenunciaResponseDTO,
  StatusSinalizacaoDenuncia,
} from '../types/moderacao';

function queryPage(page = 0, size = 20) {
  return `page=${page}&size=${size}`;
}

export const moderacaoService = {
  resumo() {
    return apiRequest<PainelModeracaoResumoDTO>('/api/paineis/moderacao/resumo');
  },

  listarSinalizacoes(status: StatusSinalizacaoDenuncia = 'PENDENTE', page = 0, size = 50) {
    return apiRequest<PaginaSinalizacoes>(
      `/api/moderacoes/sinalizacoes-denuncia?status=${status}&${queryPage(page, size)}`,
    );
  },

  marcarSinalizacaoAnalisada(sinalizacaoId: number) {
    return apiRequest<SinalizacaoDenunciaResponseDTO>(
      `/api/moderacoes/sinalizacoes-denuncia/${sinalizacaoId}/analise`,
      { method: 'POST' },
    );
  },

  arquivarDenuncia(denunciaId: number, payload: ModeracaoRequestDTO) {
    return apiRequest<ModeracaoResponseDTO>(`/api/moderacoes/denuncias/${denunciaId}/arquivamento`, {
      method: 'POST',
      body: payload,
    });
  },

  removerComentario(comentarioId: number, payload: ModeracaoRequestDTO) {
    return apiRequest<ModeracaoResponseDTO>(`/api/moderacoes/comentarios/${comentarioId}/remocao`, {
      method: 'POST',
      body: payload,
    });
  },

  moderarUsuario(usuarioId: number, acao: AcaoModeracaoUsuario, payload: ModeracaoRequestDTO) {
    const pathByAction: Record<AcaoModeracaoUsuario, string> = {
      ADVERTENCIA: 'advertencia',
      SUSPENSAO: 'suspensao',
      REATIVACAO: 'reativacao',
    };

    return apiRequest<ModeracaoResponseDTO>(
      `/api/moderacoes/usuarios/${usuarioId}/${pathByAction[acao]}`,
      {
        method: 'POST',
        body: payload,
      },
    );
  },

  historicoUsuario(usuarioId: number, page = 0, size = 20) {
    return apiRequest<PaginaHistoricoModeracao>(
      `/api/moderacoes/usuarios/${usuarioId}/historico?${queryPage(page, size)}`,
    );
  },
};
