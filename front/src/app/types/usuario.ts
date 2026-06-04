import type { PerfilUsuario, UsuarioResponseDTO } from './auth';

export type { PerfilUsuario, UsuarioResponseDTO } from './auth';

export interface UsuarioCreateRequestDTO {
  nome: string;
  email: string;
  username: string;
  senha: string;
  perfilGlobal: PerfilUsuario;
  telefone?: string | null;
  cidade: string;
  bairro: string;
}

export interface UsuarioUpdateRequestDTO {
  nome: string;
  email: string;
  username: string;
  perfilGlobal: PerfilUsuario;
  telefone?: string | null;
  cidade: string;
  bairro: string;
  fotoPerfilUrl?: string | null;
}
