package com.mykael.prefeitura.infra.auth.admin;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.admin-inicial")
public record AdminAppInicialProperties(
		boolean habilitado,
		String username,
		String email,
		String senha,
		String nome,
		String cidade,
		String bairro
) {
}
