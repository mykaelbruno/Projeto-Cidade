package com.mykael.prefeitura.infra.limite;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class LimiteRequisicaoFilter extends OncePerRequestFilter {

	private static final String HEADER_LIMITE = "X-RateLimit-Limit";
	private static final String HEADER_RESTANTES = "X-RateLimit-Remaining";

	private final LimiteRequisicaoService limiteRequisicaoService;
	private final LimiteRequisicaoProperties properties;
	private final AntPathMatcher pathMatcher = new AntPathMatcher();

	public LimiteRequisicaoFilter(
			LimiteRequisicaoService limiteRequisicaoService,
			LimiteRequisicaoProperties properties
	) {
		this.limiteRequisicaoService = limiteRequisicaoService;
		this.properties = properties;
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		Optional<TipoLimiteRequisicao> tipo = tipoLimite(request);
		if (tipo.isEmpty()) {
			filterChain.doFilter(request, response);
			return;
		}

		Optional<ResultadoLimiteRequisicao> resultado = limiteRequisicaoService.avaliar(
				tipo.get(),
				identificadorCliente(request)
		);
		if (resultado.isEmpty()) {
			filterChain.doFilter(request, response);
			return;
		}

		ResultadoLimiteRequisicao limite = resultado.get();
		response.setHeader(HEADER_LIMITE, String.valueOf(limite.limite()));
		response.setHeader(HEADER_RESTANTES, String.valueOf(limite.restantes()));

		if (limite.permitido()) {
			filterChain.doFilter(request, response);
			return;
		}

		escreverBloqueio(response, request, limite);
	}

	private Optional<TipoLimiteRequisicao> tipoLimite(HttpServletRequest request) {
		String metodo = request.getMethod();
		String caminho = request.getRequestURI();

		if ("POST".equals(metodo) && "/api/auth/login".equals(caminho)) {
			return Optional.of(TipoLimiteRequisicao.LOGIN);
		}
		if ("POST".equals(metodo) && "/api/auth/cadastro-morador".equals(caminho)) {
			return Optional.of(TipoLimiteRequisicao.CADASTRO_MORADOR);
		}
		if ("POST".equals(metodo) && "/api/auth/refresh".equals(caminho)) {
			return Optional.of(TipoLimiteRequisicao.REFRESH_TOKEN);
		}
		if ("POST".equals(metodo) && ("/api/conta/verificacao-email/solicitacao".equals(caminho)
				|| "/api/conta/verificacao-email/confirmacao".equals(caminho)
				|| "/api/conta/recuperacao-senha/solicitacao".equals(caminho)
				|| "/api/conta/recuperacao-senha/redefinicao".equals(caminho))) {
			return Optional.of(TipoLimiteRequisicao.CONTA);
		}
		if ("POST".equals(metodo) && "/api/denuncias".equals(caminho)) {
			return Optional.of(TipoLimiteRequisicao.CRIACAO_DENUNCIA);
		}
		if ("POST".equals(metodo) && pathMatcher.match("/api/denuncias/*/comentarios", caminho)) {
			return Optional.of(TipoLimiteRequisicao.COMENTARIO);
		}
		if ("POST".equals(metodo) && pathMatcher.match("/api/denuncias/*/sinalizacoes", caminho)) {
			return Optional.of(TipoLimiteRequisicao.SINALIZACAO);
		}
		if (("POST".equals(metodo) || "DELETE".equals(metodo))
				&& (pathMatcher.match("/api/denuncias/*/confirmacoes", caminho)
				|| pathMatcher.match("/api/denuncias/*/urgencias", caminho))) {
			return Optional.of(TipoLimiteRequisicao.INTERACAO);
		}
		if ("POST".equals(metodo) && pathMatcher.match("/api/denuncias/*/anexos", caminho)) {
			return Optional.of(TipoLimiteRequisicao.UPLOAD_ANEXO);
		}

		return Optional.empty();
	}

	private String identificadorCliente(HttpServletRequest request) {
		if (properties.usarXForwardedFor()) {
			String forwardedFor = request.getHeader("X-Forwarded-For");
			if (forwardedFor != null && !forwardedFor.isBlank()) {
				return forwardedFor.split(",")[0].trim();
			}
		}
		return request.getRemoteAddr();
	}

	private void escreverBloqueio(
			HttpServletResponse response,
			HttpServletRequest request,
			ResultadoLimiteRequisicao limite
	) throws IOException {
		long retryAfter = Math.max(1, limite.retryAfter().toSeconds());
		response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));

		String mensagem = "Muitas requisicoes de " + limite.tipo().getDescricao()
				+ ". Tente novamente em " + retryAfter + " segundos.";
		String erro = """
				{"timestamp":"%s","status":%d,"erro":"%s","mensagem":"%s","caminho":"%s"}
				""".formatted(
				Instant.now(),
				HttpStatus.TOO_MANY_REQUESTS.value(),
				"LIMITE_REQUISICOES",
				escaparJson(mensagem),
				escaparJson(request.getRequestURI())
		);
		response.getWriter().write(erro);
	}

	private String escaparJson(String valor) {
		return valor == null ? "" : valor
				.replace("\\", "\\\\")
				.replace("\"", "\\\"");
	}
}
