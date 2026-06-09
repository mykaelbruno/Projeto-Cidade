package com.mykael.prefeitura.core.organizacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioInstitucionalCreateRequestDTO(
		@NotBlank
		@Size(min = 2, max = 100)
		String nome,

		@NotBlank
		@Email
		@Size(max = 150)
		String email,

		@NotBlank
		@Pattern(regexp = "^[a-zA-Z0-9._-]{3,50}$", message = "O username deve ter 3 a 50 caracteres e usar apenas letras, numeros, ponto, underline ou hifen.")
		String username,

		@NotBlank
		@Size(min = 8, max = 72)
		String senha,

		@Size(max = 20)
		String telefone
) {
}
