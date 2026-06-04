package com.mykael.prefeitura.infra.auth.dto;

import com.mykael.prefeitura.core.usuario.dto.UsuarioResponseDTO;

public record AuthResponseDTO(
		String mensagem,
		UsuarioResponseDTO usuario
) {
}
