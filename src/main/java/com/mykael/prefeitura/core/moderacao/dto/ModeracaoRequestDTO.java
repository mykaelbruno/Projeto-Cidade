package com.mykael.prefeitura.core.moderacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ModeracaoRequestDTO(
		@NotBlank
		@Size(max = 500)
		String motivo
) {
}
