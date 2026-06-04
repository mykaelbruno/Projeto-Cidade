package com.mykael.prefeitura.infra.conta;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.conta")
public record ContaProperties(
		Duration verificacaoEmailTokenDuration,
		Duration recuperacaoSenhaTokenDuration,
		String frontendUrl
) {
}
