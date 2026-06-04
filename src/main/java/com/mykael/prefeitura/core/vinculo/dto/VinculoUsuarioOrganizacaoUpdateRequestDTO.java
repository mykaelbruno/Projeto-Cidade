package com.mykael.prefeitura.core.vinculo.dto;

import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import jakarta.validation.constraints.NotNull;

public record VinculoUsuarioOrganizacaoUpdateRequestDTO(
		@NotNull
		PapelUsuario papel,

		boolean ativo
) {
}
