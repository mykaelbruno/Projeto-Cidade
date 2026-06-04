export type StatusDenuncia =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'ENCAMINHADO'
  | 'EM_ANDAMENTO'
  | 'PROGRAMADO'
  | 'CONCLUIDO'
  | 'REABERTO'
  | 'ARQUIVADO';

export type ModoOrdenacaoFeed = 'MISTO' | 'RECENTES' | 'EM_ALTA';

export interface DenunciaResponseDTO {
  id: number;
  titulo: string;
  descricao: string;
  categoriaId: number;
  categoriaNome: string;
  status: StatusDenuncia;
  autorId: number | null;
  autorNomeExibido: string;
  anonima: boolean;
  cidade: string;
  bairro: string;
  rua: string | null;
  pontoReferencia: string | null;
  latitude: number | null;
  longitude: number | null;
  organizacaoResponsavelId: number | null;
  organizacaoResponsavelNome: string | null;
  pontuacaoRelevancia: number;
  quantidadeConfirmacoes: number;
  quantidadeUrgencias: number;
  quantidadeComentarios: number;
  conclusaoConfirmadaEm: string | null;
  conclusaoContestadaEm: string | null;
  feedbackConclusao: string | null;
  imagemCapaUrl: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface FeedDenunciaResponseDTO {
  denuncia: DenunciaResponseDTO;
  modoOrdenacao: ModoOrdenacaoFeed;
  pontuacaoFeed: number;
  motivoOrdenacao: string;
  apoiadaPeloUsuario: boolean;
  urgentePeloUsuario: boolean;
}

export interface FeedDenunciaFiltro {
  cidade?: string | null;
  bairro?: string | null;
  status?: StatusDenuncia | null;
  categoriaId?: number | null;
  modo?: ModoOrdenacaoFeed;
  excluirProprias?: boolean;
  termo?: string | null;
  page?: number;
  size?: number;
}

export interface DenunciaCreateRequestDTO {
  titulo: string;
  descricao: string;
  categoriaId: number;
  anonima: boolean;
  cidade: string;
  bairro: string;
  rua?: string | null;
  pontoReferencia?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DenunciaSemelhanteResponseDTO {
  denunciaId: number;
  titulo: string;
  status: StatusDenuncia;
  cidade: string;
  bairro: string;
  rua: string | null;
  distanciaMetros: number | null;
  percentualSemelhancaTexto: number;
  pontuacaoSemelhanca: number;
  quantidadeConfirmacoes: number;
  quantidadeUrgencias: number;
  criadoEm: string;
  motivos: string[];
}

export interface InteracaoDenunciaResponseDTO {
  denunciaId: number;
  confirmadaPeloUsuario: boolean;
  marcadaUrgentePeloUsuario: boolean;
  quantidadeConfirmacoes: number;
  quantidadeUrgencias: number;
  quantidadeComentarios: number;
  pontuacaoRelevancia: number;
}

export interface ComentarioResponseDTO {
  id: number;
  denunciaId: number;
  autorId: number | null;
  autorNome: string;
  conteudo: string;
  oficial: boolean;
  organizacaoId: number | null;
  organizacaoNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface AnexoDenunciaResponseDTO {
  id: number;
  denunciaId: number;
  autorId: number | null;
  autorNome: string;
  nomeOriginal: string;
  contentType: string;
  tamanhoBytes: number;
  urlDownload: string;
  criadoEm: string;
}

export type TipoEventoTimeline =
  | 'DENUNCIA_CRIADA'
  | 'COMENTARIO_ADICIONADO'
  | 'RESPOSTA_OFICIAL_PUBLICADA'
  | 'STATUS_ALTERADO'
  | 'ANEXO_ADICIONADO'
  | 'DENUNCIA_ARQUIVADA_MODERACAO'
  | 'COMENTARIO_REMOVIDO_MODERACAO'
  | 'TRANSFERENCIA_SOLICITADA'
  | 'TRANSFERENCIA_APROVADA'
  | 'TRANSFERENCIA_RECUSADA'
  | 'RESPONSAVEL_ALTERADO_PREFEITURA'
  | 'CONCLUSAO_CONFIRMADA_MORADOR'
  | 'CONCLUSAO_CONTESTADA_MORADOR';

export interface TimelineDenunciaResponseDTO {
  id: number;
  denunciaId: number;
  tipo: TipoEventoTimeline;
  descricao: string;
  usuarioId: number | null;
  usuarioNome: string | null;
  organizacaoId: number | null;
  organizacaoNome: string | null;
  destaque: boolean;
  criadoEm: string;
}

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

export interface SinalizacaoDenunciaRequestDTO {
  motivo: MotivoSinalizacaoDenuncia;
  comentario: string;
}
