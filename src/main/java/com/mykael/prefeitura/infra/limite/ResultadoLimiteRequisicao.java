package com.mykael.prefeitura.infra.limite;

import java.time.Duration;

public record ResultadoLimiteRequisicao(
		boolean permitido,
		TipoLimiteRequisicao tipo,
		int limite,
		int restantes,
		Duration retryAfter
) {

	public static ResultadoLimiteRequisicao permitido(TipoLimiteRequisicao tipo, int limite, int restantes) {
		return new ResultadoLimiteRequisicao(true, tipo, limite, Math.max(restantes, 0), Duration.ZERO);
	}

	public static ResultadoLimiteRequisicao bloqueado(TipoLimiteRequisicao tipo, int limite, Duration retryAfter) {
		return new ResultadoLimiteRequisicao(false, tipo, limite, 0, retryAfter);
	}
}
