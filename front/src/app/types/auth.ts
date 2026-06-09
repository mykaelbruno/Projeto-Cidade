export type PerfilUsuario = 'ADMIN' | 'MORADOR' | 'MODERADOR';

export type PapelUsuario =
  | 'PREFEITURA'
  | 'SECRETARIA';

export type UserType =
  | 'morador'
  | 'secretaria'
  | 'prefeitura'
  | 'admin'
  | 'moderador';

export interface UsuarioResponseDTO {
  id: number;
  nome: string;
  email: string;
  username: string;
  perfilGlobal: PerfilUsuario;
  telefone: string | null;
  cidade: string | null;
  bairro: string | null;
  fotoPerfilUrl: string | null;
  emailVerificado: boolean;
  emailVerificadoEm: string | null;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface VinculoUsuarioOrganizacaoResponseDTO {
  id: number;
  usuarioId: number;
  organizacaoId: number;
  nomeUsuario: string;
  emailUsuario: string;
  telefoneUsuario: string | null;
  nomeOrganizacao: string;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: string;
}

export interface UsuarioLogadoResponseDTO {
  usuario: UsuarioResponseDTO;
  papeis: string[];
  vinculosOperacionais: VinculoUsuarioOrganizacaoResponseDTO[];
}

export interface AuthResponseDTO {
  mensagem: string;
  usuario: UsuarioResponseDTO;
}

export interface LoginRequestDTO {
  identificador: string;
  senha: string;
}

export interface CadastroMoradorRequestDTO {
  nome: string;
  email: string;
  username: string;
  senha: string;
  telefone?: string;
  cidade: string;
  bairro: string;
}

export interface ErroApiResponse {
  timestamp?: string;
  status: number;
  erro?: string;
  mensagem: string;
  caminho?: string;
}
