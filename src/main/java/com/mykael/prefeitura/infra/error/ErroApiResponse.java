package com.mykael.prefeitura.infra.error;

import java.time.Instant;

public record ErroApiResponse(
		Instant timestamp,
		int status,
		String erro,
		String mensagem,
		String caminho
) {
}
