package com.mykael.prefeitura.core.categoria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaCreateRequestDTO(
		@NotBlank
		@Size(max = 100)
		String nome,

		@Size(max = 500)
		String descricao,

		Long organizacaoResponsavelPadraoId
) {
}
