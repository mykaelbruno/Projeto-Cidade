package com.mykael.prefeitura.infra.conta;

import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import com.mykael.prefeitura.infra.auth.TokenHashService;
import com.mykael.prefeitura.infra.email.EmailService;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContaService {

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();
	private static final String CAMINHO_VERIFICACAO_EMAIL = "/verificar-email?token=";
	private static final String CAMINHO_RECUPERACAO_SENHA = "/redefinir-senha?token=";

	private final UsuarioRepository usuarioRepository;
	private final TokenContaRepository tokenContaRepository;
	private final TokenHashService tokenHashService;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final AuditoriaService auditoriaService;
	private final ContaProperties properties;

	public ContaService(
			UsuarioRepository usuarioRepository,
			TokenContaRepository tokenContaRepository,
			TokenHashService tokenHashService,
			PasswordEncoder passwordEncoder,
			EmailService emailService,
			AuditoriaService auditoriaService,
			ContaProperties properties
	) {
		this.usuarioRepository = usuarioRepository;
		this.tokenContaRepository = tokenContaRepository;
		this.tokenHashService = tokenHashService;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
		this.auditoriaService = auditoriaService;
		this.properties = properties;
	}

	@Transactional
	public void solicitarVerificacaoEmail(String email) {
		usuarioRepository.findByEmail(normalizarEmail(email))
				.filter(Usuario::isAtivo)
				.filter(usuario -> !usuario.isEmailVerificado())
				.ifPresent(this::emitirVerificacaoEmail);
	}

	@Transactional
	public void emitirVerificacaoEmail(Usuario usuario) {
		if (usuario.isEmailVerificado()) {
			return;
		}
		String token = criarToken(usuario, TipoTokenConta.VERIFICACAO_EMAIL, properties.verificacaoEmailTokenDuration());
		emailService.enviarVerificacaoEmail(usuario, montarLink(CAMINHO_VERIFICACAO_EMAIL, token));
	}

	@Transactional
	public void confirmarEmail(String token) {
		TokenConta tokenConta = buscarTokenAtivo(token, TipoTokenConta.VERIFICACAO_EMAIL);
		Usuario usuario = tokenConta.getUsuario();
		usuario.confirmarEmail();
		tokenConta.marcarComoUsado();
		auditoriaService.registrar(
				TipoAcaoAuditoria.EMAIL_VERIFICADO,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Email do usuario verificado.",
				null
		);
	}

	@Transactional
	public void solicitarRecuperacaoSenha(String email) {
		usuarioRepository.findByEmail(normalizarEmail(email))
				.filter(Usuario::isAtivo)
				.ifPresent(usuario -> {
					String token = criarToken(usuario, TipoTokenConta.RECUPERACAO_SENHA, properties.recuperacaoSenhaTokenDuration());
					emailService.enviarRecuperacaoSenha(usuario, montarLink(CAMINHO_RECUPERACAO_SENHA, token));
				});
	}

	@Transactional
	public void redefinirSenha(String token, String novaSenha) {
		TokenConta tokenConta = buscarTokenAtivo(token, TipoTokenConta.RECUPERACAO_SENHA);
		Usuario usuario = tokenConta.getUsuario();
		if (!usuario.isAtivo()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario inativo nao pode redefinir senha.");
		}
		usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
		tokenConta.marcarComoUsado();
		auditoriaService.registrar(
				TipoAcaoAuditoria.SENHA_REDEFINIDA,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Senha redefinida por fluxo de recuperacao.",
				null
		);
	}

	private String criarToken(Usuario usuario, TipoTokenConta tipo, Duration duracao) {
		String token = gerarTokenSeguro();
		TokenConta tokenConta = new TokenConta();
		tokenConta.setUsuario(usuario);
		tokenConta.setTipo(tipo);
		tokenConta.setTokenHash(tokenHashService.gerarHash(token));
		tokenConta.setExpiraEm(Instant.now().plus(duracao));
		tokenContaRepository.save(tokenConta);
		return token;
	}

	private TokenConta buscarTokenAtivo(String token, TipoTokenConta tipo) {
		TokenConta tokenConta = tokenContaRepository.findByTokenHashAndTipo(tokenHashService.gerarHash(token), tipo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token invalido ou expirado."));
		if (!tokenConta.estaAtivo(Instant.now())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token invalido ou expirado.");
		}
		return tokenConta;
	}

	private String gerarTokenSeguro() {
		byte[] bytes = new byte[32];
		SECURE_RANDOM.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private String montarLink(String caminho, String token) {
		String frontendUrl = StringUtils.hasText(properties.frontendUrl())
				? properties.frontendUrl().trim()
				: "http://localhost:5173";
		return frontendUrl.replaceAll("/+$", "") + caminho + token;
	}

	private String normalizarEmail(String email) {
		return email.trim().toLowerCase();
	}
}
