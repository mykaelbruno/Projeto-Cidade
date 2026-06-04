package com.mykael.prefeitura.core.organizacao.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SecretariaCategoriasUpdateRequestDTO(
		@NotNull
		List<Long> categoriasIds
) {
}
