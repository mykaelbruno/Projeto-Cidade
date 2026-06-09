import type { PapelUsuario, VinculoUsuarioOrganizacaoResponseDTO } from './auth';

export type { PapelUsuario, VinculoUsuarioOrganizacaoResponseDTO } from './auth';

export interface VinculoUsuarioOrganizacaoUpdateRequestDTO {
  ativo: boolean;
}

export interface VinculoUsuarioOrganizacaoCreateRequestDTO {
  usuarioId: number;
  organizacaoId: number;
  ativo?: boolean | null;
}

export interface VinculoTransferenciaSecretariaRequestDTO {
  secretariaDestinoId: number;
}
