package com.mykael.prefeitura.core.denuncia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DenunciaCreateRequestDTO(
		@NotBlank
		@Size(min = 5, max = 120)
		String titulo,

		@NotBlank
		@Size(min = 20, max = 2000)
		String descricao,

		@NotNull
		Long categoriaId,

		boolean anonima,

		@NotBlank
		@Size(max = 100)
		String cidade,

		@NotBlank
		@Size(max = 100)
		String bairro,

		@Size(max = 150)
		String rua,

		@Size(max = 200)
		String pontoReferencia,

		Double latitude,

		Double longitude
) {
}
