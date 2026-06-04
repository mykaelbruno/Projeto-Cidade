package com.mykael.prefeitura.core.denuncia.dto;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StatusDenunciaUpdateRequestDTO(
		@NotNull
		StatusDenuncia status,

		@NotNull
		Long organizacaoId,

		@Size(max = 300)
		String motivo
) {
}
