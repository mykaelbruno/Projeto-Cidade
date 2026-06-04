package com.mykael.prefeitura.core.operacional.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitacaoTransferenciaRecusaRequestDTO(
		@NotBlank
		@Size(max = 500)
		String motivo
) {
}
