package com.mykael.prefeitura.infra.auth;

import com.mykael.prefeitura.core.usuario.Usuario;

public record AuthResult(
		Usuario usuario,
		AuthTokens tokens
) {
}
