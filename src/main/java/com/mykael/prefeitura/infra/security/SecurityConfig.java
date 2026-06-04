package com.mykael.prefeitura.infra.security;

import com.mykael.prefeitura.infra.antispam.AntispamProperties;
import com.mykael.prefeitura.infra.limite.LimiteRequisicaoProperties;
import com.mykael.prefeitura.infra.web.WebProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableConfigurationProperties({
		SecurityProperties.class,
		AntispamProperties.class,
		LimiteRequisicaoProperties.class,
		WebProperties.class
})
@EnableMethodSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			BearerTokenResolver bearerTokenResolver,
			UsuarioAtivoFilter usuarioAtivoFilter
	) throws Exception {
		return http
				.cors(Customizer.withDefaults())
				.csrf(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/organizacoes/prefeituras").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/prefeituras/*/bairros/ativos").permitAll()
						.requestMatchers(
								"/api/auth/cadastro-morador",
								"/api/auth/login",
								"/api/auth/refresh",
								"/api/conta/verificacao-email/solicitacao",
								"/api/conta/verificacao-email/confirmacao",
								"/api/conta/recuperacao-senha/solicitacao",
								"/api/conta/recuperacao-senha/redefinicao",
								"/api-docs/**",
								"/v3/api-docs/**",
								"/swagger-ui.html",
								"/swagger-ui/**",
								"/actuator/health"
						).permitAll()
						.anyRequest().authenticated()
				)
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint((request, response, authException) ->
								escreverErroSeguranca(request, response, HttpStatus.UNAUTHORIZED, "NAO_AUTENTICADO", "Autenticacao obrigatoria."))
						.accessDeniedHandler((request, response, accessDeniedException) ->
								escreverErroSeguranca(request, response, HttpStatus.FORBIDDEN, "ACESSO_NEGADO", "Usuario sem permissao para esta acao."))
				)
				.oauth2ResourceServer(oauth2 -> oauth2
						.bearerTokenResolver(bearerTokenResolver)
						.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
				)
				.addFilterAfter(usuarioAtivoFilter, BearerTokenAuthenticationFilter.class)
				.httpBasic(AbstractHttpConfigurer::disable)
				.headers(headers -> headers
						.contentTypeOptions(Customizer.withDefaults())
						.frameOptions(frame -> frame.deny())
						.referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
						.contentSecurityPolicy(csp -> csp.policyDirectives("""
								default-src 'self';
								script-src 'self' 'unsafe-inline';
								style-src 'self' 'unsafe-inline';
								img-src 'self' data:;
								object-src 'none';
								base-uri 'self';
								frame-ancestors 'none'
								""".replace("\n", " ")))
						.addHeaderWriter(new StaticHeadersWriter("Permissions-Policy", "geolocation=(), microphone=(), camera=()"))
				)
				.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(WebProperties webProperties) {
		WebProperties.Cors cors = webProperties.cors();
		var configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(nullSafeList(cors.allowedOrigins()));
		configuration.setAllowedMethods(nullSafeList(cors.allowedMethods()));
		configuration.setAllowedHeaders(nullSafeList(cors.allowedHeaders()));
		configuration.setExposedHeaders(nullSafeList(cors.exposedHeaders()));
		configuration.setAllowCredentials(cors.allowCredentials());
		configuration.setMaxAge(cors.maxAge().toSeconds());

		var source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	BearerTokenResolver bearerTokenResolver() {
		return new JwtCookieBearerTokenResolver();
	}

	@Bean
	JwtEncoder jwtEncoder(SecurityProperties securityProperties) {
		return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey(securityProperties)));
	}

	@Bean
	JwtDecoder jwtDecoder(SecurityProperties securityProperties) {
		return NimbusJwtDecoder.withSecretKey(jwtSecretKey(securityProperties)).build();
	}

	private SecretKey jwtSecretKey(SecurityProperties securityProperties) {
		String secret = securityProperties.jwt().secret();
		if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
			throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres.");
		}
		return new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
	}

	private JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
		authoritiesConverter.setAuthorityPrefix("");
		authoritiesConverter.setAuthoritiesClaimName("scope");

		JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
		authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
		return authenticationConverter;
	}

	private List<String> nullSafeList(List<String> values) {
		return values == null ? List.of() : values;
	}

	private void escreverErroSeguranca(
			HttpServletRequest request,
			HttpServletResponse response,
			HttpStatus status,
			String codigo,
			String mensagem
	) throws java.io.IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		String erro = """
				{"timestamp":"%s","status":%d,"erro":"%s","mensagem":"%s","caminho":"%s"}
				""".formatted(
				Instant.now(),
				status.value(),
				codigo,
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
