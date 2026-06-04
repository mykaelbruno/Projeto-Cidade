package com.mykael.prefeitura.infra.conta;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaRepository;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auth.TokenHashService;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ContaIntegrationTest {

	private static final AtomicInteger SEQUENCIA = new AtomicInteger();

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private TokenContaRepository tokenContaRepository;

	@Autowired
	private TokenHashService tokenHashService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private AuditoriaRepository auditoriaRepository;

	@Test
	void deveSolicitarEConfirmarVerificacaoDeEmail() throws Exception {
		Usuario usuario = usuario("senha-antiga-segura");

		mockMvc.perform(post("/api/conta/verificacao-email/solicitacao")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s"
								}
								""".formatted(usuario.getEmail())))
				.andExpect(status().isOk());

		assertThat(tokenContaRepository.findAll())
				.anySatisfy(token -> {
					assertThat(token.getUsuario().getId()).isEqualTo(usuario.getId());
					assertThat(token.getTipo()).isEqualTo(TipoTokenConta.VERIFICACAO_EMAIL);
				});

		String token = "token-verificacao-email";
		tokenConta(usuario, TipoTokenConta.VERIFICACAO_EMAIL, token);

		mockMvc.perform(post("/api/conta/verificacao-email/confirmacao")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s"
								}
								""".formatted(token)))
				.andExpect(status().isOk());

		Usuario atualizado = usuarioRepository.findById(usuario.getId()).orElseThrow();
		assertThat(atualizado.isEmailVerificado()).isTrue();
		assertThat(atualizado.getEmailVerificadoEm()).isNotNull();
		assertThat(auditoriaRepository.findAll())
				.anySatisfy(auditoria -> assertThat(auditoria.getAcao()).isEqualTo(TipoAcaoAuditoria.EMAIL_VERIFICADO));
	}

	@Test
	void deveRedefinirSenhaComTokenValido() throws Exception {
		Usuario usuario = usuario("senha-antiga-segura");
		String token = "token-recuperacao-senha";
		tokenConta(usuario, TipoTokenConta.RECUPERACAO_SENHA, token);

		mockMvc.perform(post("/api/conta/recuperacao-senha/redefinicao")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "token": "%s",
								  "novaSenha": "nova-senha-segura"
								}
								""".formatted(token)))
				.andExpect(status().isOk());

		Usuario atualizado = usuarioRepository.findById(usuario.getId()).orElseThrow();
		assertThat(passwordEncoder.matches("nova-senha-segura", atualizado.getSenhaHash())).isTrue();
		assertThat(passwordEncoder.matches("senha-antiga-segura", atualizado.getSenhaHash())).isFalse();
		assertThat(tokenContaRepository.findByTokenHashAndTipo(
						tokenHashService.gerarHash(token),
						TipoTokenConta.RECUPERACAO_SENHA
				))
				.hasValueSatisfying(tokenSalvo -> assertThat(tokenSalvo.getUsadoEm()).isNotNull());
		assertThat(auditoriaRepository.findAll())
				.anySatisfy(auditoria -> assertThat(auditoria.getAcao()).isEqualTo(TipoAcaoAuditoria.SENHA_REDEFINIDA));
	}

	@Test
	void deveResponderSolicitacaoDeRecuperacaoMesmoQuandoEmailNaoExiste() throws Exception {
		mockMvc.perform(post("/api/conta/recuperacao-senha/solicitacao")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "nao-existe@example.com"
								}
								"""))
				.andExpect(status().isOk());
	}

	private Usuario usuario(String senha) {
		int numero = SEQUENCIA.incrementAndGet();
		Usuario usuario = new Usuario();
		usuario.setNome("Usuario Conta " + numero);
		usuario.setEmail("usuario.conta" + numero + "@example.com");
		usuario.setUsername("usuario_conta_" + numero);
		usuario.setSenhaHash(passwordEncoder.encode(senha));
		usuario.setPerfilGlobal(PerfilUsuario.MORADOR);
		usuario.setCidade("Joao Pessoa");
		usuario.setBairro("Centro");
		return usuarioRepository.save(usuario);
	}

	private TokenConta tokenConta(Usuario usuario, TipoTokenConta tipo, String token) {
		TokenConta tokenConta = new TokenConta();
		tokenConta.setUsuario(usuario);
		tokenConta.setTipo(tipo);
		tokenConta.setTokenHash(tokenHashService.gerarHash(token));
		tokenConta.setExpiraEm(Instant.now().plusSeconds(600));
		return tokenContaRepository.save(tokenConta);
	}
}
