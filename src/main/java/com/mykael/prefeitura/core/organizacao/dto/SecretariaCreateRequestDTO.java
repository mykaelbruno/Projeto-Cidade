package com.mykael.prefeitura.core.organizacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SecretariaCreateRequestDTO(
		@NotBlank
		@Size(max = 150)
		String nome,
		
		List<Long> categoriasIds
) {
}
