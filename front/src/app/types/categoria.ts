export interface CategoriaResponseDTO {
  id: number;
  nome: string;
  descricao: string | null;
  organizacaoResponsavelPadraoId: number | null;
  ativa: boolean;
}

export interface CategoriaCreateRequestDTO {
  nome: string;
  descricao?: string | null;
  organizacaoResponsavelPadraoId?: number | null;
}

export interface CategoriaUpdateRequestDTO {
  nome: string;
  descricao?: string | null;
  organizacaoResponsavelPadraoId?: number | null;
}
