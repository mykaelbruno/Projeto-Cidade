package com.mykael.prefeitura.core.vinculo.dto;

import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import jakarta.validation.constraints.NotNull;

public record VinculoUsuarioOrganizacaoCreateRequestDTO(
		@NotNull
		Long usuarioId,

		@NotNull
		Long organizacaoId,

		@NotNull
		PapelUsuario papel,

		Boolean ativo
) {
}
