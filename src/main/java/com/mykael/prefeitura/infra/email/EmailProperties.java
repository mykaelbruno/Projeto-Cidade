package com.mykael.prefeitura.infra.email;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.email")
public record EmailProperties(
		boolean envioRealHabilitado,
		boolean notificacoesHabilitadas,
		String remetente,
		String nomeRemetente
) {
}
