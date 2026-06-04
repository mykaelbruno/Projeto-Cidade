package com.mykael.prefeitura.infra.limite;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LimiteRequisicaoService {

	private static final long INTERVALO_LIMPEZA = 1000;

	private final LimiteRequisicaoProperties properties;
	private final Clock clock;
	private final Map<String, ContadorJanela> contadores = new ConcurrentHashMap<>();
	private final AtomicLong avaliacoes = new AtomicLong();

	@Autowired
	public LimiteRequisicaoService(LimiteRequisicaoProperties properties) {
		this(properties, Clock.systemUTC());
	}

	LimiteRequisicaoService(LimiteRequisicaoProperties properties, Clock clock) {
		this.properties = properties;
		this.clock = clock;
	}

	public Optional<ResultadoLimiteRequisicao> avaliar(TipoLimiteRequisicao tipo, String identificador) {
		if (!properties.habilitado()) {
			return Optional.empty();
		}

		LimiteRequisicaoProperties.Regra regra = properties.regra(tipo);
		if (regra == null || !regra.aplicavel()) {
			return Optional.empty();
		}

		Instant agora = clock.instant();
		limparExpiradosPeriodicamente(agora);

		String chave = tipo.name() + ":" + identificador;
		Holder resultado = new Holder();

		contadores.compute(chave, (key, atual) -> {
			ContadorJanela contador = atual;
			if (contador == null || !contador.resetEm.isAfter(agora)) {
				contador = new ContadorJanela(0, agora.plus(regra.janela()));
			}

			if (contador.total >= regra.maxRequisicoes()) {
				resultado.valor = ResultadoLimiteRequisicao.bloqueado(
						tipo,
						regra.maxRequisicoes(),
						Duration.between(agora, contador.resetEm)
				);
				return contador;
			}

			contador.total++;
			resultado.valor = ResultadoLimiteRequisicao.permitido(
					tipo,
					regra.maxRequisicoes(),
					regra.maxRequisicoes() - contador.total
			);
			return contador;
		});

		return Optional.of(resultado.valor);
	}

	private void limparExpiradosPeriodicamente(Instant agora) {
		if (avaliacoes.incrementAndGet() % INTERVALO_LIMPEZA != 0) {
			return;
		}
		contadores.entrySet().removeIf(entry -> !entry.getValue().resetEm.isAfter(agora));
	}

	private static final class ContadorJanela {
		private int total;
		private final Instant resetEm;

		private ContadorJanela(int total, Instant resetEm) {
			this.total = total;
			this.resetEm = resetEm;
		}
	}

	private static final class Holder {
		private ResultadoLimiteRequisicao valor;
	}
}
