package com.mykael.prefeitura.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class JwtCookieBearerTokenResolverTest {

	private final JwtCookieBearerTokenResolver resolver = new JwtCookieBearerTokenResolver();

	@Test
	void deveIgnorarCookieEmRotaPublicaDeLogin() {
		MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
		request.setCookies(new Cookie("access_token", "jwt-invalido"));

		assertThat(resolver.resolve(request)).isNull();
	}

	@Test
	void deveUsarUltimoCookieQuandoExistiremCookiesDuplicados() {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/me");
		request.addHeader("Cookie", "access_token=jwt-antigo; access_token=jwt-atual");

		assertThat(resolver.resolve(request)).isEqualTo("jwt-atual");
	}
}
