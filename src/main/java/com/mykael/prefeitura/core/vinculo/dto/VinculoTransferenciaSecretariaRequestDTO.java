package com.mykael.prefeitura.core.vinculo.dto;

import jakarta.validation.constraints.NotNull;

public record VinculoTransferenciaSecretariaRequestDTO(
		@NotNull
		Long secretariaDestinoId
) {
}
