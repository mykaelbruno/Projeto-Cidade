package com.mykael.prefeitura.infra.auth;

public record AuthTokens(
		String accessToken,
		String refreshToken
) {
}
