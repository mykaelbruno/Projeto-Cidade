package com.mykael.prefeitura.infra.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(
		Jwt jwt,
		Cookies cookies
) {

	public record Jwt(
			String secret,
			String issuer,
			Duration accessTokenDuration,
			Duration refreshTokenDuration
	) {
	}

	public record Cookies(
			boolean secure
	) {
	}
}
