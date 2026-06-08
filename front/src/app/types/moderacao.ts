import type { PageResponse } from './api';

export type MotivoSinalizacaoDenuncia =
  | 'IMAGEM_INADEQUADA'
  | 'SPAM'
  | 'FAKE_NEWS'
  | 'CONTEUDO_OFENSIVO'
  | 'DADOS_PESSOAIS_EXPOSTOS'
  | 'DENUNCIA_DUPLICADA'
  | 'LOCALIZACAO_INCORRETA'
  | 'CATEGORIA_INCORRETA'
  | 'OUTRO';

export type StatusSinalizacaoDenuncia = 'PENDENTE' | 'ANALISADA';
export type TipoAlvoModeracao = 'DENUNCIA' | 'COMENTARIO' | 'USUARIO';
export type AcaoModeracaoUsuario = 'ADVERTENCIA' | 'SUSPENSAO' | 'REATIVACAO';

export interface PainelModeracaoResumoDTO {
  sinalizacoesPendentes: number;
  sinalizacoesAnalisadas: number;
  denunciasArquivadasModeracao: number;
  comentariosRemovidosModeracao: number;
  usuariosAdvertidosModeracao: number;
  usuariosSuspensosModeracao: number;
  usuariosReativadosModeracao: number;
}

export interface SinalizacaoDenunciaResponseDTO {
  id: number;
  denunciaId: number;
  denunciaTitulo: string;
  comentarioId: number | null;
  comentarioSinalizadoConteudo: string | null;
  autorId: number;
  autorNome: string;
  motivo: MotivoSinalizacaoDenuncia;
  comentario: string;
  status: StatusSinalizacaoDenuncia;
  analisadoPorId: number | null;
  analisadoPorNome: string | null;
  analisadoEm: string | null;
  criadoEm: string;
}

export interface ModeracaoRequestDTO {
  motivo: string;
}

export interface ModeracaoResponseDTO {
  id: number;
  tipoAlvo: TipoAlvoModeracao;
  denunciaId: number | null;
  comentarioId: number | null;
  usuarioAlvoId: number | null;
  usuarioAlvoNome: string | null;
  acaoUsuario: AcaoModeracaoUsuario | null;
  moderadorId: number;
  moderadorNome: string;
  motivo: string;
  criadoEm: string;
}

export type PaginaSinalizacoes = PageResponse<SinalizacaoDenunciaResponseDTO>;
export type PaginaHistoricoModeracao = PageResponse<ModeracaoResponseDTO>;
