package com.mykael.prefeitura.infra.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.util.StringUtils;

public class JwtCookieBearerTokenResolver implements BearerTokenResolver {

	private static final String ACCESS_TOKEN_COOKIE = "access_token";
	private static final Set<String> ROTAS_PUBLICAS_EXATAS = Set.of(
			"/api/auth/cadastro-morador",
			"/api/auth/login",
			"/api/auth/refresh",
			"/api/conta/verificacao-email/solicitacao",
			"/api/conta/verificacao-email/confirmacao",
			"/api/conta/recuperacao-senha/solicitacao",
			"/api/conta/recuperacao-senha/redefinicao",
			"/swagger-ui.html",
			"/actuator/health"
	);
	private static final Set<String> ROTAS_PUBLICAS_PREFIXADAS = Set.of(
			"/api-docs/",
			"/v3/api-docs/",
			"/swagger-ui/"
	);

	private final DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

	@Override
	public String resolve(HttpServletRequest request) {
		if (deveIgnorarCookie(request)) {
			return headerResolver.resolve(request);
		}

		String headerToken = headerResolver.resolve(request);
		if (StringUtils.hasText(headerToken)) {
			return headerToken;
		}

		String tokenDoHeaderCookie = extrairUltimoCookie(request.getHeader("Cookie"), ACCESS_TOKEN_COOKIE);
		if (StringUtils.hasText(tokenDoHeaderCookie)) {
			return tokenDoHeaderCookie;
		}

		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}

		String ultimoTokenEncontrado = null;
		for (Cookie cookie : cookies) {
			if (ACCESS_TOKEN_COOKIE.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
				ultimoTokenEncontrado = cookie.getValue();
			}
		}

		return ultimoTokenEncontrado;
	}

	private String extrairUltimoCookie(String cookieHeader, String nomeCookie) {
		if (!StringUtils.hasText(cookieHeader)) {
			return null;
		}

		String ultimoValorEncontrado = null;
		String prefixo = nomeCookie + "=";

		for (String trecho : cookieHeader.split(";")) {
			String cookie = trecho.trim();
			if (cookie.startsWith(prefixo)) {
				String valor = cookie.substring(prefixo.length()).trim();
				if (StringUtils.hasText(valor)) {
					ultimoValorEncontrado = valor;
				}
			}
		}

		return ultimoValorEncontrado;
	}

	private boolean deveIgnorarCookie(HttpServletRequest request) {
		String caminho = request.getServletPath();
		if (!StringUtils.hasText(caminho)) {
			caminho = request.getRequestURI();
		}

		if (!StringUtils.hasText(caminho)) {
			return false;
		}

		if (ROTAS_PUBLICAS_EXATAS.contains(caminho)) {
			return true;
		}

		if (ROTAS_PUBLICAS_PREFIXADAS.stream().anyMatch(caminho::startsWith)) {
			return true;
		}

		if ("GET".equalsIgnoreCase(request.getMethod()) && "/api/organizacoes/prefeituras".equals(caminho)) {
			return true;
		}

		return "GET".equalsIgnoreCase(request.getMethod())
				&& caminho.matches("^/api/prefeituras/\\d+/bairros/ativos$");
	}
}
