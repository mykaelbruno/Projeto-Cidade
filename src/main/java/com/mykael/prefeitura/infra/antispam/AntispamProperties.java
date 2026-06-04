package com.mykael.prefeitura.infra.antispam;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.antispam")
public record AntispamProperties(
		boolean habilitado,
		int maxLinksDenuncia,
		int maxLinksComentario,
		int maxCaracteresRepetidosSequencia,
		Duration janelaDenunciaRepetida,
		Duration janelaComentarioRepetido
) {

	public boolean aplicavel() {
		return habilitado;
	}
}
