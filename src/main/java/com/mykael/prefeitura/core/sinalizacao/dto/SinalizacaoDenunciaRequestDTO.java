package com.mykael.prefeitura.core.sinalizacao.dto;

import com.mykael.prefeitura.core.sinalizacao.MotivoSinalizacaoDenuncia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SinalizacaoDenunciaRequestDTO(
		@NotNull
		MotivoSinalizacaoDenuncia motivo,
		@NotBlank
		@Size(max = 500)
		String comentario
) {
}
