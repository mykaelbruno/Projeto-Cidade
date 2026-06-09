export type TipoOrganizacao = 'PREFEITURA' | 'SECRETARIA';

export interface OrganizacaoResponseDTO {
  id: number;
  nome: string;
  tipo: TipoOrganizacao;
  cidade: string;
  estado: string;
  organizacaoPaiId: number | null;
  verificada: boolean;
  ativa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface BairroResponseDTO {
  id: number;
  prefeituraId: number;
  prefeituraNome: string;
  cidade: string;
  estado: string;
  nome: string;
  centroideLatitude: number | null;
  centroideLongitude: number | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PrefeituraCreateRequestDTO {
  nome: string;
  cidade: string;
  estado: string;
  verificada: boolean;
}

export interface SecretariaCreateRequestDTO {
  nome: string;
  categoriasIds: number[];
}

export interface SecretariaCategoriasUpdateRequestDTO {
  categoriasIds: number[];
}

export interface OrganizacaoUpdateRequestDTO {
  nome: string;
  cidade: string;
  estado: string;
  verificada: boolean;
}

export interface UsuarioInstitucionalCreateRequestDTO {
  nome: string;
  email: string;
  username: string;
  senha: string;
  telefone?: string | null;
}
