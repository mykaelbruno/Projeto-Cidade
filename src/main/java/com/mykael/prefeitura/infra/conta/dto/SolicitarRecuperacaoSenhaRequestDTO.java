package com.mykael.prefeitura.infra.conta.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitarRecuperacaoSenhaRequestDTO(
		@NotBlank
		@Email
		@Size(max = 150)
		String email
) {
}
