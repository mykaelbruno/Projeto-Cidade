package com.mykael.prefeitura.infra.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
		String denunciaAnexosDir,
		long denunciaAnexosMaxBytes,
		int denunciaImagemMaxLargura,
		int denunciaImagemMaxAltura,
		float denunciaImagemQualidade
) {
}
