import type { PapelUsuario, VinculoUsuarioOrganizacaoResponseDTO } from './auth';

export type { PapelUsuario, VinculoUsuarioOrganizacaoResponseDTO } from './auth';

export interface VinculoUsuarioOrganizacaoUpdateRequestDTO {
  papel: PapelUsuario;
  ativo: boolean;
}

export interface VinculoUsuarioOrganizacaoCreateRequestDTO {
  usuarioId: number;
  organizacaoId: number;
  papel: PapelUsuario;
  ativo?: boolean | null;
}

export interface VinculoTransferenciaSecretariaRequestDTO {
  secretariaDestinoId: number;
}
