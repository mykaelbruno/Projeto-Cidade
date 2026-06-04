package com.mykael.prefeitura.infra.conta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmarVerificacaoEmailRequestDTO(
		@NotBlank
		@Size(max = 200)
		String token
) {
}
