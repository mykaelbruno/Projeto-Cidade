package com.mykael.prefeitura.core.comentario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioCreateRequestDTO(
		@NotBlank
		@Size(min = 1, max = 1000)
		String conteudo
) {
}
