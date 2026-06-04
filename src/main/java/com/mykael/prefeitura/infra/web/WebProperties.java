package com.mykael.prefeitura.infra.web;

import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.web")
public record WebProperties(
		Cors cors
) {

	public record Cors(
			List<String> allowedOrigins,
			List<String> allowedMethods,
			List<String> allowedHeaders,
			List<String> exposedHeaders,
			boolean allowCredentials,
			Duration maxAge
	) {
	}
}
