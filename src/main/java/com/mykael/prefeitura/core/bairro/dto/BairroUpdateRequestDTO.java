package com.mykael.prefeitura.core.bairro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BairroUpdateRequestDTO(
		@NotBlank
		@Size(max = 100)
		String nome
) {
}
