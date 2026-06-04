package com.mykael.prefeitura.core.comentario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RespostaOficialCreateRequestDTO(
		@NotNull
		Long organizacaoId,

		@NotBlank
		@Size(min = 5, max = 2000)
		String conteudo
) {
}
