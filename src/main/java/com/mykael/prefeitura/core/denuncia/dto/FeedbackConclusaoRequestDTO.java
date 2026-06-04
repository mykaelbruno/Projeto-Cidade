package com.mykael.prefeitura.core.denuncia.dto;

import jakarta.validation.constraints.Size;

public record FeedbackConclusaoRequestDTO(
		@Size(max = 500)
		String feedback
) {
}
