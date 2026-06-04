package com.mykael.prefeitura.core.organizacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OrganizacaoUpdateRequestDTO(
		@NotBlank
		@Size(max = 150)
		String nome,

		@NotBlank
		@Size(max = 100)
		String cidade,

		@NotBlank
		@Size(min = 2, max = 2)
		String estado,

		boolean verificada
) {
}
