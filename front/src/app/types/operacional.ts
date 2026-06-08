import type { PageResponse } from './api';
import type { StatusDenuncia } from './denuncia';
import type { TipoOrganizacao } from './organizacao';

export type StatusSolicitacaoTransferencia = 'PENDENTE' | 'APROVADA' | 'RECUSADA';

export interface ContadoresDenunciaDTO {
  total: number;
  abertas: number;
  emAnalise: number;
  encaminhadas: number;
  emAndamento: number;
  programadas: number;
  concluidasAguardandoConfirmacao: number;
  concluidasConfirmadas: number;
  reabertas: number;
  arquivadas: number;
}

export interface DistribuicaoDenunciaDTO {
  nome: string;
  total: number;
}

export interface IndicadoresOperacionaisDTO {
  taxaConclusaoConfirmada: number;
  taxaReabertura: number;
  tempoMedioConfirmacaoHoras: number | null;
}

export interface PainelOperacionalResumoDTO {
  organizacaoId: number;
  organizacaoNome: string;
  tipoOrganizacao: TipoOrganizacao;
  denuncias: ContadoresDenunciaDTO;
  transferenciasPendentes: number;
  indicadores: IndicadoresOperacionaisDTO;
  bairrosMaisDemandados: DistribuicaoDenunciaDTO[];
  categoriasMaisDemandadas: DistribuicaoDenunciaDTO[];
}

export interface SolicitacaoTransferenciaResponseDTO {
  id: number;
  denunciaId: number;
  denunciaTitulo: string;
  prefeituraId: number;
  prefeituraNome: string;
  organizacaoOrigemId: number;
  organizacaoOrigemNome: string;
  organizacaoDestinoSugeridaId: number | null;
  organizacaoDestinoSugeridaNome: string | null;
  organizacaoDestinoFinalId: number | null;
  organizacaoDestinoFinalNome: string | null;
  solicitadoPorId: number;
  solicitadoPorNome: string;
  status: StatusSolicitacaoTransferencia;
  motivo: string;
  motivoDecisao: string | null;
  avaliadoPorId: number | null;
  avaliadoPorNome: string | null;
  avaliadoEm: string | null;
  criadoEm: string;
}

export interface FiltrosOperacionais {
  cidade?: string;
  bairro?: string;
  status?: StatusDenuncia | null;
  categoriaId?: number | null;
  termo?: string | null;
  page?: number;
  size?: number;
}

export interface StatusDenunciaUpdateRequestDTO {
  status: StatusDenuncia;
  organizacaoId: number;
  motivo?: string | null;
}

export interface RespostaOficialCreateRequestDTO {
  organizacaoId: number;
  conteudo: string;
}

export interface AlterarResponsavelDenunciaRequestDTO {
  organizacaoDestinoId: number;
  motivo?: string | null;
}

export interface SolicitacaoTransferenciaCreateRequestDTO {
  organizacaoDestinoSugeridaId?: number | null;
  motivo: string;
}

export interface SolicitacaoTransferenciaAprovacaoRequestDTO {
  organizacaoDestinoId?: number | null;
  motivo?: string | null;
}

export interface SolicitacaoTransferenciaRecusaRequestDTO {
  motivo: string;
}

export type PaginaSolicitacoesTransferencia = PageResponse<SolicitacaoTransferenciaResponseDTO>;
