package com.mykael.prefeitura.infra.auth;

import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoResponseDTO;
import com.mykael.prefeitura.infra.auth.dto.CadastroMoradorRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.LoginRequestDTO;
import com.mykael.prefeitura.infra.auth.token.RefreshToken;
import com.mykael.prefeitura.infra.auth.token.RefreshTokenRepository;
import com.mykael.prefeitura.infra.conta.ContaService;
import com.mykael.prefeitura.infra.security.JwtTokenService;
import com.mykael.prefeitura.infra.security.SecurityProperties;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

	private final UsuarioRepository usuarioRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenService jwtTokenService;
	private final TokenHashService tokenHashService;
	private final SecurityProperties securityProperties;
	private final ContaService contaService;

	public AuthService(
			UsuarioRepository usuarioRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			RefreshTokenRepository refreshTokenRepository,
			PasswordEncoder passwordEncoder,
			JwtTokenService jwtTokenService,
			TokenHashService tokenHashService,
			SecurityProperties securityProperties,
			ContaService contaService
	) {
		this.usuarioRepository = usuarioRepository;
		this.vinculoRepository = vinculoRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenService = jwtTokenService;
		this.tokenHashService = tokenHashService;
		this.securityProperties = securityProperties;
		this.contaService = contaService;
	}

	@Transactional
	public AuthResult cadastrarMorador(CadastroMoradorRequestDTO request) {
		validarEmailEUsernameDisponiveis(request.email(), request.username());

		Usuario usuario = new Usuario();
		usuario.setNome(request.nome().trim());
		usuario.setEmail(request.email().trim().toLowerCase());
		usuario.setUsername(request.username().trim().toLowerCase());
		usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
		usuario.setTelefone(request.telefone());
		usuario.setCidade(request.cidade().trim());
		usuario.setBairro(request.bairro().trim());
		usuario.setPerfilGlobal(PerfilUsuario.MORADOR);

		Usuario salvo = usuarioRepository.save(usuario);
		contaService.emitirVerificacaoEmail(salvo);
		return new AuthResult(salvo, gerarTokens(salvo));
	}

	@Transactional
	public AuthResult login(LoginRequestDTO request) {
		Usuario usuario = buscarPorIdentificador(request.identificador());
		if (!usuario.isAtivo() || !passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identificador ou senha invalidos.");
		}
		return new AuthResult(usuario, gerarTokens(usuario));
	}

	@Transactional
	public AuthTokens renovar(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token ausente.");
		}

		String tokenHash = tokenHashService.gerarHash(refreshToken);
		RefreshToken tokenSalvo = refreshTokenRepository.findByTokenHash(tokenHash)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token invalido."));

		if (!tokenSalvo.estaAtivo(Instant.now()) || !tokenSalvo.getUsuario().isAtivo()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expirado ou revogado.");
		}

		String novoAccessToken = jwtTokenService.gerarAccessToken(
				tokenSalvo.getUsuario(),
				buscarPapeisInstitucionais(tokenSalvo.getUsuario())
		);
		return new AuthTokens(novoAccessToken, refreshToken);
	}

	@Transactional
	public void logout(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			return;
		}

		String tokenHash = tokenHashService.gerarHash(refreshToken);
		refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
			token.setRevogadoEm(Instant.now());
			refreshTokenRepository.save(token);
		});
	}

	@Transactional(readOnly = true)
	public Usuario buscarUsuarioLogado(Long usuarioId) {
		return usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado."));
	}

	private void validarEmailEUsernameDisponiveis(String email, String username) {
		if (usuarioRepository.existsByEmail(email.trim().toLowerCase())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
		}
		if (usuarioRepository.existsByUsername(username.trim().toLowerCase())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ja cadastrado.");
		}
	}

	private Usuario buscarPorIdentificador(String identificador) {
		String normalizado = identificador.trim().toLowerCase();
		return usuarioRepository.findByEmailOrUsername(normalizado, normalizado)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identificador ou senha invalidos."));
	}

	private AuthTokens gerarTokens(Usuario usuario) {
		String accessToken = jwtTokenService.gerarAccessToken(usuario, buscarPapeisInstitucionais(usuario));
		String refreshToken = UUID.randomUUID().toString();

		RefreshToken tokenSalvo = new RefreshToken();
		tokenSalvo.setUsuario(usuario);
		tokenSalvo.setTokenHash(tokenHashService.gerarHash(refreshToken));
		tokenSalvo.setExpiraEm(Instant.now().plus(securityProperties.jwt().refreshTokenDuration()));
		refreshTokenRepository.save(tokenSalvo);

		return new AuthTokens(accessToken, refreshToken);
	}

	public List<String> buscarPapeisInstitucionais(Usuario usuario) {
		return vinculoRepository.findByUsuarioIdAndAtivoTrue(usuario.getId())
				.stream()
				.map(vinculo -> "ROLE_" + vinculo.getPapel().name())
				.toList();
	}

	@Transactional(readOnly = true)
	public List<VinculoUsuarioOrganizacaoResponseDTO> buscarVinculosInstitucionais(Usuario usuario) {
		return vinculoRepository.findByUsuarioIdAndAtivoTrue(usuario.getId())
				.stream()
				.map(VinculoUsuarioOrganizacaoResponseDTO::from)
				.toList();
	}
}
