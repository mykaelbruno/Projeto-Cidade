export type TipoNotificacao =
  | 'DENUNCIA_ATRIBUIDA'
  | 'DENUNCIA_COMENTADA'
  | 'DENUNCIA_RESPONDIDA'
  | 'DENUNCIA_CONCLUIDA_AGUARDANDO_CONFIRMACAO'
  | 'TRANSFERENCIA_SOLICITADA'
  | 'TRANSFERENCIA_APROVADA'
  | 'TRANSFERENCIA_RECUSADA'
  | 'SINALIZACAO_DENUNCIA_RECEBIDA'
  | 'MODERACAO_DENUNCIA_ARQUIVADA'
  | 'MODERACAO_COMENTARIO_REMOVIDO'
  | 'MODERACAO_USUARIO_ADVERTIDO'
  | 'MODERACAO_USUARIO_SUSPENSO'
  | 'MODERACAO_USUARIO_REATIVADO';

export interface NotificacaoResponseDTO {
  id: number;
  tipo: TipoNotificacao;
  denunciaId: number | null;
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  lidaEm: string | null;
  criadoEm: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
