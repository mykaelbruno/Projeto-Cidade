import type { UserType, VinculoUsuarioOrganizacaoResponseDTO } from '../types/auth';

export function getVinculoOperacionalAtivo(
  userType: UserType,
  vinculos: VinculoUsuarioOrganizacaoResponseDTO[],
) {
  if (userType === 'prefeitura') {
    return vinculos.find((vinculo) => vinculo.ativo && vinculo.papel === 'ADMIN_PREFEITURA') ?? null;
  }

  if (userType === 'secretaria') {
    return (
      vinculos.find(
        (vinculo) =>
          vinculo.ativo &&
          (vinculo.papel === 'ADMIN_SECRETARIA' || vinculo.papel === 'ATENDENTE_SECRETARIA'),
      ) ?? null
    );
  }

  return null;
}

export function getOperationalPathPrefix(userType: UserType) {
  return userType === 'prefeitura' ? '/prefeitura' : '/secretaria';
}
