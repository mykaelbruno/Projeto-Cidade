package com.mykael.prefeitura.infra.limite;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class LimiteRequisicaoServiceTest {

	@Test
	void deveBloquearQuandoUltrapassaLimiteDaJanela() {
		LimiteRequisicaoService service = new LimiteRequisicaoService(properties(true), relogio());

		assertThat(service.avaliar(TipoLimiteRequisicao.LOGIN, "127.0.0.1"))
				.hasValueSatisfying(resultado -> assertThat(resultado.permitido()).isTrue());
		assertThat(service.avaliar(TipoLimiteRequisicao.LOGIN, "127.0.0.1"))
				.hasValueSatisfying(resultado -> assertThat(resultado.permitido()).isTrue());
		assertThat(service.avaliar(TipoLimiteRequisicao.LOGIN, "127.0.0.1"))
				.hasValueSatisfying(resultado -> {
					assertThat(resultado.permitido()).isFalse();
					assertThat(resultado.retryAfter()).isPositive();
				});
	}

	@Test
	void deveIgnorarLimiteQuandoDesabilitadoGlobalmente() {
		LimiteRequisicaoService service = new LimiteRequisicaoService(properties(false), relogio());

		assertThat(service.avaliar(TipoLimiteRequisicao.LOGIN, "127.0.0.1")).isEmpty();
	}

	private LimiteRequisicaoProperties properties(boolean habilitado) {
		var regra = new LimiteRequisicaoProperties.Regra(true, 2, Duration.ofMinutes(1));
		return new LimiteRequisicaoProperties(
				habilitado,
				false,
				regra,
				regra,
				regra,
				regra,
				regra,
				regra,
				regra,
				regra,
				regra
		);
	}

	private Clock relogio() {
		return Clock.fixed(Instant.parse("2026-05-27T12:00:00Z"), ZoneOffset.UTC);
	}
}
