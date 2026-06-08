package com.mykael.prefeitura.core.bairro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

public record BairroCreateRequestDTO(
		@NotBlank
		@Size(max = 100)
		String nome,

		@DecimalMin("-90.0")
		@DecimalMax("90.0")
		Double centroideLatitude,

		@DecimalMin("-180.0")
		@DecimalMax("180.0")
		Double centroideLongitude
) {
}
