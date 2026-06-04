package com.mykael.prefeitura.infra.antispam;

import java.text.Normalizer;
import java.time.Clock;
import java.time.Instant;
import java.util.Collection;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AntispamService {

	private static final Pattern LINK_PATTERN = Pattern.compile("(?i)\\b(?:https?://|www\\.)\\S+");
	private static final Pattern ESPACOS = Pattern.compile("\\s+");
	private static final Pattern NAO_ALFANUMERICO = Pattern.compile("[^a-z0-9 ]");
	private static final Pattern ACENTOS = Pattern.compile("\\p{M}");

	private final AntispamProperties properties;
	private final Clock clock;

	@Autowired
	public AntispamService(AntispamProperties properties) {
		this(properties, Clock.systemUTC());
	}

	AntispamService(AntispamProperties properties, Clock clock) {
		this.properties = properties;
		this.clock = clock;
	}

	public void validarConteudoDenuncia(String titulo, String descricao) {
		if (!properties.aplicavel()) {
			return;
		}
		String conteudo = juntar(titulo, descricao);
		validarQuantidadeLinks(conteudo, properties.maxLinksDenuncia(), "A denuncia possui links em excesso.");
		validarSequenciaRepetida(conteudo);
	}

	public void validarConteudoComentario(String conteudo) {
		if (!properties.aplicavel()) {
			return;
		}
		validarQuantidadeLinks(conteudo, properties.maxLinksComentario(), "O comentario possui links em excesso.");
		validarSequenciaRepetida(conteudo);
	}

	public Optional<Instant> inicioJanelaDenunciaRepetida() {
		return inicioJanela(properties.janelaDenunciaRepetida());
	}

	public Optional<Instant> inicioJanelaComentarioRepetido() {
		return inicioJanela(properties.janelaComentarioRepetido());
	}

	public String assinatura(String... valores) {
		String normalizado = Normalizer.normalize(juntar(valores), Normalizer.Form.NFD);
		normalizado = ACENTOS.matcher(normalizado).replaceAll("");
		normalizado = normalizado.toLowerCase(Locale.ROOT);
		normalizado = NAO_ALFANUMERICO.matcher(normalizado).replaceAll(" ");
		return ESPACOS.matcher(normalizado).replaceAll(" ").trim();
	}

	public void validarDenunciaNaoRepetida(String assinaturaNova, Collection<String> assinaturasRecentes) {
		if (!properties.aplicavel()) {
			return;
		}
		if (assinaturasRecentes.contains(assinaturaNova)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Denuncia repetida em um intervalo muito curto.");
		}
	}

	public void validarComentarioNaoRepetido(String assinaturaNova, Collection<String> assinaturasRecentes) {
		if (!properties.aplicavel()) {
			return;
		}
		if (assinaturasRecentes.contains(assinaturaNova)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Comentario repetido em um intervalo muito curto.");
		}
	}

	private Optional<Instant> inicioJanela(java.time.Duration janela) {
		if (!properties.aplicavel() || janela == null || janela.isZero() || janela.isNegative()) {
			return Optional.empty();
		}
		return Optional.of(clock.instant().minus(janela));
	}

	private void validarQuantidadeLinks(String conteudo, int limite, String mensagem) {
		if (limite < 0) {
			return;
		}
		long links = LINK_PATTERN.matcher(nullSafe(conteudo)).results().count();
		if (links > limite) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
		}
	}

	private void validarSequenciaRepetida(String conteudo) {
		int limite = properties.maxCaracteresRepetidosSequencia();
		if (limite <= 0) {
			return;
		}

		char anterior = 0;
		int repeticoes = 0;
		for (char atual : nullSafe(conteudo).toCharArray()) {
			if (Character.isWhitespace(atual)) {
				anterior = 0;
				repeticoes = 0;
				continue;
			}
			if (Character.toLowerCase(atual) == Character.toLowerCase(anterior)) {
				repeticoes++;
				if (repeticoes >= limite) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conteudo com sequencia repetitiva suspeita.");
				}
			} else {
				anterior = atual;
				repeticoes = 1;
			}
		}
	}

	private String juntar(String... valores) {
		return String.join(" ", java.util.Arrays.stream(valores)
				.map(this::nullSafe)
				.filter(StringUtils::hasText)
				.toList());
	}

	private String nullSafe(String valor) {
		return valor == null ? "" : valor;
	}
}
