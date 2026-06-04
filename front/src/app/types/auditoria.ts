export type TipoAcaoAuditoria =
  | 'USUARIO_CRIADO'
  | 'USUARIO_ATUALIZADO'
  | 'USUARIO_ATIVACAO_ALTERADA'
  | 'ORGANIZACAO_CRIADA'
  | 'ORGANIZACAO_ATUALIZADA'
  | 'ORGANIZACAO_ATIVACAO_ALTERADA'
  | 'USUARIO_INSTITUCIONAL_CRIADO'
  | 'BAIRRO_CRIADO'
  | 'BAIRRO_ATUALIZADO'
  | 'BAIRRO_ATIVACAO_ALTERADA'
  | 'CATEGORIA_CRIADA'
  | 'CATEGORIA_ATUALIZADA'
  | 'CATEGORIA_ATIVACAO_ALTERADA'
  | 'VINCULO_ATUALIZADO'
  | 'VINCULO_ORGANIZACAO_ALTERADA'
  | 'DENUNCIA_STATUS_ALTERADO'
  | 'DENUNCIA_CONCLUSAO_CONFIRMADA'
  | 'DENUNCIA_CONCLUSAO_CONTESTADA'
  | 'DENUNCIA_ARQUIVADA_MODERACAO'
  | 'COMENTARIO_REMOVIDO_MODERACAO'
  | 'USUARIO_ADVERTIDO_MODERACAO'
  | 'USUARIO_SUSPENSO_MODERACAO'
  | 'USUARIO_REATIVADO_MODERACAO'
  | 'SINALIZACAO_CRIADA'
  | 'SINALIZACAO_ANALISADA'
  | 'TRANSFERENCIA_SOLICITADA'
  | 'TRANSFERENCIA_APROVADA'
  | 'TRANSFERENCIA_RECUSADA'
  | 'RESPONSAVEL_DENUNCIA_ALTERADO'
  | 'EMAIL_VERIFICADO'
  | 'SENHA_REDEFINIDA';

export type TipoAlvoAuditoria =
  | 'USUARIO'
  | 'ORGANIZACAO'
  | 'BAIRRO'
  | 'CATEGORIA'
  | 'VINCULO'
  | 'DENUNCIA'
  | 'COMENTARIO'
  | 'SINALIZACAO'
  | 'SOLICITACAO_TRANSFERENCIA';

export interface AuditoriaResponseDTO {
  id: number;
  acao: TipoAcaoAuditoria;
  alvoTipo: TipoAlvoAuditoria;
  alvoId: number | null;
  atorId: number | null;
  perfilAtor: string | null;
  descricao: string;
  detalhes: string | null;
  metodoHttp: string | null;
  caminho: string | null;
  ip: string | null;
  criadoEm: string;
}

export interface ListarAuditoriasParams {
  acao?: TipoAcaoAuditoria | null;
  alvoTipo?: TipoAlvoAuditoria | null;
  alvoId?: number | null;
  atorId?: number | null;
  page?: number;
  size?: number;
}
