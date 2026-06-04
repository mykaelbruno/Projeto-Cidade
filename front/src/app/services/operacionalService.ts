import { apiRequest, getApiUrl } from './apiClient';
import type { PageResponse } from '../types/api';
import type { DenunciaResponseDTO } from '../types/denuncia';
import type {
  AlterarResponsavelDenunciaRequestDTO,
  FiltrosOperacionais,
  PainelOperacionalResumoDTO,
  PaginaSolicitacoesTransferencia,
  RespostaOficialCreateRequestDTO,
  SolicitacaoTransferenciaAprovacaoRequestDTO,
  SolicitacaoTransferenciaCreateRequestDTO,
  SolicitacaoTransferenciaRecusaRequestDTO,
  StatusDenunciaUpdateRequestDTO,
  StatusSolicitacaoTransferencia,
} from '../types/operacional';

function appendFiltroParams(params: URLSearchParams, filtros: FiltrosOperacionais = {}) {
  if (filtros.cidade?.trim()) {
    params.set('cidade', filtros.cidade.trim());
  }

  if (filtros.bairro?.trim()) {
    params.set('bairro', filtros.bairro.trim());
  }

  if (filtros.status) {
    params.set('status', filtros.status);
  }

  if (filtros.categoriaId) {
    params.set('categoriaId', String(filtros.categoriaId));
  }

  params.set('page', String(filtros.page ?? 0));
  params.set('size', String(filtros.size ?? 20));
}

export const operacionalService = {
  resumo(organizacaoId: number) {
    return apiRequest<PainelOperacionalResumoDTO>(
      `/api/paineis/operacional/organizacoes/${organizacaoId}/resumo`,
    );
  },

  listarDenuncias(organizacaoId: number, filtros: FiltrosOperacionais = {}) {
    const params = new URLSearchParams();
    appendFiltroParams(params, filtros);

    return apiRequest<PageResponse<DenunciaResponseDTO>>(
      `/api/operacional/organizacoes/${organizacaoId}/denuncias?${params.toString()}`,
    );
  },

  atualizarStatus(denunciaId: number, payload: StatusDenunciaUpdateRequestDTO) {
    return apiRequest<DenunciaResponseDTO>(`/api/denuncias/${denunciaId}/status`, {
      method: 'PATCH',
      body: payload,
    });
  },

  responderOficialmente(denunciaId: number, payload: RespostaOficialCreateRequestDTO) {
    return apiRequest(`/api/denuncias/${denunciaId}/respostas-oficiais`, {
      method: 'POST',
      body: payload,
    });
  },

  solicitarTransferencia(
    denunciaId: number,
    payload: SolicitacaoTransferenciaCreateRequestDTO,
  ) {
    return apiRequest(`/api/operacional/denuncias/${denunciaId}/solicitacoes-transferencia`, {
      method: 'POST',
      body: payload,
    });
  },

  listarTransferenciasPrefeitura(
    prefeituraId: number,
    status: StatusSolicitacaoTransferencia = 'PENDENTE',
    page = 0,
    size = 20,
  ) {
    const params = new URLSearchParams({
      status,
      page: String(page),
      size: String(size),
    });

    return apiRequest<PaginaSolicitacoesTransferencia>(
      `/api/operacional/prefeituras/${prefeituraId}/solicitacoes-transferencia?${params.toString()}`,
    );
  },

  aprovarTransferencia(
    solicitacaoId: number,
    payload: SolicitacaoTransferenciaAprovacaoRequestDTO,
  ) {
    return apiRequest(`/api/operacional/solicitacoes-transferencia/${solicitacaoId}/aprovacao`, {
      method: 'POST',
      body: payload,
    });
  },

  recusarTransferencia(
    solicitacaoId: number,
    payload: SolicitacaoTransferenciaRecusaRequestDTO,
  ) {
    return apiRequest(`/api/operacional/solicitacoes-transferencia/${solicitacaoId}/recusa`, {
      method: 'POST',
      body: payload,
    });
  },

  alterarResponsavel(denunciaId: number, payload: AlterarResponsavelDenunciaRequestDTO) {
    return apiRequest(`/api/operacional/denuncias/${denunciaId}/responsavel`, {
      method: 'PATCH',
      body: payload,
    });
  },

  async baixarCsv(organizacaoId: number, filtros: FiltrosOperacionais = {}) {
    const params = new URLSearchParams();
    appendFiltroParams(params, { ...filtros, page: undefined, size: undefined });
    params.delete('page');
    params.delete('size');

    const response = await fetch(
      getApiUrl(`/api/relatorios/operacional/organizacoes/${organizacaoId}/denuncias.csv?${params.toString()}`),
      { credentials: 'include' },
    );

    if (!response.ok) {
      throw new Error('Nao foi possivel exportar o relatorio operacional.');
    }

    return response.blob();
  },
};
