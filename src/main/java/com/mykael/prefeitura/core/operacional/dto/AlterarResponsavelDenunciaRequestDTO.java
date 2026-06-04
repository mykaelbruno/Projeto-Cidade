package com.mykael.prefeitura.core.operacional.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AlterarResponsavelDenunciaRequestDTO(
		@NotNull
		Long organizacaoDestinoId,

		@Size(max = 500)
		String motivo
) {
}
