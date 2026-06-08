package com.mykael.prefeitura.infra.auth;

import com.mykael.prefeitura.core.usuario.dto.UsuarioResponseDTO;
import com.mykael.prefeitura.infra.auth.dto.AuthResponseDTO;
import com.mykael.prefeitura.infra.auth.dto.CadastroMoradorRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.LoginRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.UsuarioLogadoResponseDTO;
import com.mykael.prefeitura.infra.security.SecurityProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController implements AuthControllerOpenApi {

	private static final String ACCESS_TOKEN_COOKIE = "access_token";
	private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
	private static final List<String> CAMINHOS_COOKIES_LEGADOS = List.of("/api", "/api/auth");

	private final AuthService authService;
	private final SecurityProperties securityProperties;

	public AuthController(AuthService authService, SecurityProperties securityProperties) {
		this.authService = authService;
		this.securityProperties = securityProperties;
	}

	@Override
	@PostMapping("/cadastro-morador")
	public ResponseEntity<AuthResponseDTO> cadastrarMorador(@Valid @RequestBody CadastroMoradorRequestDTO request) {
		AuthResult result = authService.cadastrarMorador(request);
		return respostaAutenticada("Morador cadastrado com sucesso.", result);
	}

	@Override
	@PostMapping("/login")
	public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
		AuthResult result = authService.login(request);
		return respostaAutenticada("Login realizado com sucesso.", result);
	}

	@Override
	@PostMapping("/refresh")
	public ResponseEntity<AuthResponseDTO> refresh(HttpServletRequest request) {
		AuthTokens tokens = authService.renovar(cookieValue(request, REFRESH_TOKEN_COOKIE));
		ResponseEntity.BodyBuilder response = ResponseEntity.ok();
		adicionarLimpezaCookiesLegados(response, ACCESS_TOKEN_COOKIE);
		response.header(HttpHeaders.SET_COOKIE, accessTokenCookie(tokens.accessToken()).toString());
		return response.body(new AuthResponseDTO("Sessao renovada com sucesso.", null));
	}

	@Override
	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
		authService.logout(cookieValue(request, REFRESH_TOKEN_COOKIE));
		ResponseEntity.HeadersBuilder<?> response = ResponseEntity.noContent();
		response.header(HttpHeaders.SET_COOKIE, limparCookie(ACCESS_TOKEN_COOKIE).toString());
		response.header(HttpHeaders.SET_COOKIE, limparCookie(REFRESH_TOKEN_COOKIE).toString());
		adicionarLimpezaCookiesLegados(response, ACCESS_TOKEN_COOKIE);
		adicionarLimpezaCookiesLegados(response, REFRESH_TOKEN_COOKIE);
		return response.build();
	}

	@Override
	@GetMapping("/me")
	public ResponseEntity<UsuarioLogadoResponseDTO> me(@AuthenticationPrincipal Jwt jwt) {
		Long usuarioId = Long.valueOf(jwt.getSubject());
		var usuario = authService.buscarUsuarioLogado(usuarioId);
		var papeis = authService.buscarPapeisInstitucionais(usuario);
		var vinculos = authService.buscarVinculosInstitucionais(usuario);
		return ResponseEntity.ok(new UsuarioLogadoResponseDTO(UsuarioResponseDTO.from(usuario), papeis, vinculos));
	}

	private ResponseEntity<AuthResponseDTO> respostaAutenticada(String mensagem, AuthResult result) {
		ResponseEntity.BodyBuilder response = ResponseEntity.ok();
		adicionarLimpezaCookiesLegados(response, ACCESS_TOKEN_COOKIE);
		adicionarLimpezaCookiesLegados(response, REFRESH_TOKEN_COOKIE);
		response.header(HttpHeaders.SET_COOKIE, accessTokenCookie(result.tokens().accessToken()).toString());
		response.header(HttpHeaders.SET_COOKIE, refreshTokenCookie(result.tokens().refreshToken()).toString());
		return response.body(new AuthResponseDTO(mensagem, UsuarioResponseDTO.from(result.usuario())));
	}

	private ResponseCookie accessTokenCookie(String value) {
		return cookie(ACCESS_TOKEN_COOKIE, value, securityProperties.jwt().accessTokenDuration());
	}

	private ResponseCookie refreshTokenCookie(String value) {
		return cookie(REFRESH_TOKEN_COOKIE, value, securityProperties.jwt().refreshTokenDuration());
	}

	private ResponseCookie cookie(String name, String value, Duration maxAge) {
		return ResponseCookie.from(name, value)
				.httpOnly(true)
				.secure(securityProperties.cookies().secure())
				.sameSite("Lax")
				.path("/")
				.maxAge(maxAge)
				.build();
	}

	private ResponseCookie limparCookie(String name) {
		return limparCookie(name, "/");
	}

	private ResponseCookie limparCookie(String name, String path) {
		return ResponseCookie.from(name, "")
				.httpOnly(true)
				.secure(securityProperties.cookies().secure())
				.sameSite("Lax")
				.path(path)
				.maxAge(Duration.ZERO)
				.build();
	}

	private void adicionarLimpezaCookiesLegados(ResponseEntity.HeadersBuilder<?> response, String nomeCookie) {
		for (String caminho : CAMINHOS_COOKIES_LEGADOS) {
			response.header(HttpHeaders.SET_COOKIE, limparCookie(nomeCookie, caminho).toString());
		}
	}

	private String cookieValue(HttpServletRequest request, String name) {
		String valorDoHeaderCookie = extrairUltimoCookie(request.getHeader("Cookie"), name);
		if (valorDoHeaderCookie != null) {
			return valorDoHeaderCookie;
		}

		Cookie[] cookies = request.getCookies();
		if (cookies == null) {
			return null;
		}
		String ultimoValorEncontrado = null;
		for (Cookie cookie : cookies) {
			if (name.equals(cookie.getName())) {
				ultimoValorEncontrado = cookie.getValue();
			}
		}
		return ultimoValorEncontrado;
	}

	private String extrairUltimoCookie(String cookieHeader, String nomeCookie) {
		if (cookieHeader == null || cookieHeader.isBlank()) {
			return null;
		}

		String ultimoValorEncontrado = null;
		String prefixo = nomeCookie + "=";

		for (String trecho : cookieHeader.split(";")) {
			String cookie = trecho.trim();
			if (cookie.startsWith(prefixo)) {
				String valor = cookie.substring(prefixo.length()).trim();
				if (!valor.isBlank()) {
					ultimoValorEncontrado = valor;
				}
			}
		}

		return ultimoValorEncontrado;
	}
}
