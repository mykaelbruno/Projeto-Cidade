package com.mykael.prefeitura.infra.antispam;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class AntispamServiceTest {

	@Test
	void deveBloquearDenunciaComLinksEmExcesso() {
		AntispamService service = new AntispamService(properties(true), relogio());

		assertThatThrownBy(() -> service.validarConteudoDenuncia(
				"Buraco na rua",
				"Veja http://a.com www.b.com https://c.com"
		))
				.isInstanceOf(ResponseStatusException.class)
				.extracting("statusCode")
				.isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void deveBloquearComentarioRepetidoNaJanela() {
		AntispamService service = new AntispamService(properties(true), relogio());
		String assinatura = service.assinatura("O problema continua aqui.");

		assertThatThrownBy(() -> service.validarComentarioNaoRepetido(assinatura, List.of(assinatura)))
				.isInstanceOf(ResponseStatusException.class)
				.extracting("statusCode")
				.isEqualTo(HttpStatus.CONFLICT);
	}

	@Test
	void deveNormalizarAssinaturaIgnorandoAcentosPontuacaoEEspacos() {
		AntispamService service = new AntispamService(properties(true), relogio());

		assertThat(service.assinatura("Iluminacao publica!!!", "na praca"))
				.isEqualTo(service.assinatura("Iluminação   pública", "na praça."));
	}

	@Test
	void deveIgnorarRegrasQuandoAntispamEstiverDesabilitado() {
		AntispamService service = new AntispamService(properties(false), relogio());

		assertThatCode(() -> service.validarConteudoComentario("http://a.com http://b.com http://c.com"))
				.doesNotThrowAnyException();
		assertThat(service.inicioJanelaComentarioRepetido()).isEmpty();
	}

	private AntispamProperties properties(boolean habilitado) {
		return new AntispamProperties(
				habilitado,
				2,
				1,
				12,
				Duration.ofMinutes(30),
				Duration.ofMinutes(10)
		);
	}

	private Clock relogio() {
		return Clock.fixed(Instant.parse("2026-05-29T12:00:00Z"), ZoneOffset.UTC);
	}
}
