package com.mykael.prefeitura.infra.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.categoria.CategoriaRepository;
import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaRepository;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import jakarta.servlet.http.Cookie;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PermissaoPorPerfilIntegrationTest {

	private static final AtomicInteger SEQUENCIA = new AtomicInteger();

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private OrganizacaoRepository organizacaoRepository;

	@Autowired
	private VinculoUsuarioOrganizacaoRepository vinculoRepository;

	@Autowired
	private CategoriaRepository categoriaRepository;

	@Autowired
	private DenunciaRepository denunciaRepository;

	@Autowired
	private AuditoriaRepository auditoriaRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void deveExigirAutenticacaoParaRotaProtegida() throws Exception {
		mockMvc.perform(get("/api/usuarios"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void devePermitirLoginMesmoComCookieJwtInvalido() throws Exception {
		Usuario usuario = usuario(PerfilUsuario.MORADOR);
		usuario.setSenhaHash(passwordEncoder.encode("senha-segura"));
		usuarioRepository.save(usuario);

		mockMvc.perform(post("/api/auth/login")
						.cookie(new Cookie("access_token", "jwt-invalido"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "identificador": "%s",
								  "senha": "senha-segura"
								}
								""".formatted(usuario.getUsername())))
				.andExpect(status().isOk());
	}

	@Test
	void deveBloquearMoradorAoCriarUsuarioAdministrativo() throws Exception {
		Usuario morador = usuario(PerfilUsuario.MORADOR);

		mockMvc.perform(post("/api/usuarios")
						.with(jwtUsuario(morador, "MORADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "nome": "Moderador Teste",
								  "email": "moderador.teste@example.com",
								  "username": "moderador_teste",
								  "senha": "senha-segura",
								  "perfilGlobal": "MODERADOR",
								  "telefone": "83999990000",
								  "cidade": "Joao Pessoa",
								  "bairro": "Centro"
								}
								"""))
				.andExpect(status().isForbidden());
	}

	@Test
	void devePermitirAdminAppConsultarAuditoria() throws Exception {
		Usuario adminApp = usuario(PerfilUsuario.ADMIN_APP);

		mockMvc.perform(get("/api/auditorias")
						.with(jwtUsuario(adminApp, "ADMIN_APP")))
				.andExpect(status().isOk());
	}

	@Test
	void devePermitirAdminPrefeituraCriarSecretariaDaPropriaPrefeitura() throws Exception {
		Usuario adminPrefeitura = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		vinculo(adminPrefeitura, prefeitura, PapelUsuario.ADMIN_PREFEITURA);

		mockMvc.perform(post("/api/organizacoes/prefeituras/{prefeituraId}/secretarias", prefeitura.getId())
						.with(jwtUsuario(adminPrefeitura, "MORADOR", "ADMIN_PREFEITURA"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "nome": "Secretaria de Obras"
								}
								"""))
				.andExpect(status().isCreated());
	}

	@Test
	void devePermitirAdminPrefeituraListarVinculosDaSuaCidade() throws Exception {
		Usuario adminPrefeitura = usuario(PerfilUsuario.MORADOR);
		Usuario operadorSecretaria = usuario(PerfilUsuario.MORADOR);
		Usuario adminOutraPrefeitura = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao secretaria = secretaria(prefeitura);
		Organizacao outraPrefeitura = prefeitura("Campina Grande");

		vinculo(adminPrefeitura, prefeitura, PapelUsuario.ADMIN_PREFEITURA);
		vinculo(operadorSecretaria, secretaria, PapelUsuario.ADMIN_SECRETARIA);
		vinculo(adminOutraPrefeitura, outraPrefeitura, PapelUsuario.ADMIN_PREFEITURA);

		mockMvc.perform(get("/api/vinculos")
						.with(jwtUsuario(adminPrefeitura, "MORADOR", "ADMIN_PREFEITURA")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", org.hamcrest.Matchers.hasSize(2)));
	}

	@Test
	void deveBloquearMoradorNoFluxoOperacional() throws Exception {
		Usuario morador = usuario(PerfilUsuario.MORADOR);

		mockMvc.perform(get("/api/operacional/organizacoes/999/denuncias")
						.with(jwtUsuario(morador, "MORADOR")))
				.andExpect(status().isForbidden());
	}

	@Test
	void devePermitirModeradorArquivarDenuncia() throws Exception {
		Usuario moderador = usuario(PerfilUsuario.MODERADOR);
		Denuncia denuncia = denunciaComResponsavel(null);

		mockMvc.perform(post("/api/moderacoes/denuncias/{denunciaId}/arquivamento", denuncia.getId())
						.with(jwtUsuario(moderador, "MODERADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "Conteudo em desacordo com as regras."
								}
								"""))
				.andExpect(status().isOk());

		Denuncia atualizada = denunciaRepository.findById(denuncia.getId()).orElseThrow();
		assertThat(atualizada.getStatus()).isEqualTo(StatusDenuncia.ARQUIVADO);
		assertThat(auditoriaRepository.findAll())
				.anySatisfy(auditoria -> assertThat(auditoria.getAcao())
						.isEqualTo(TipoAcaoAuditoria.DENUNCIA_ARQUIVADA_MODERACAO));
	}

	@Test
	void devePermitirSecretariaAlterarStatusDaDenunciaAtribuida() throws Exception {
		Usuario adminSecretaria = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao secretaria = secretaria(prefeitura);
		vinculo(adminSecretaria, secretaria, PapelUsuario.ADMIN_SECRETARIA);
		Denuncia denuncia = denunciaComResponsavel(secretaria);

		mockMvc.perform(patch("/api/denuncias/{denunciaId}/status", denuncia.getId())
						.with(jwtUsuario(adminSecretaria, "MORADOR", "ADMIN_SECRETARIA"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "status": "EM_ANALISE",
								  "organizacaoId": %d,
								  "motivo": "Triagem inicial."
								}
								""".formatted(secretaria.getId())))
				.andExpect(status().isOk());
	}

	@Test
	void devePermitirAdminAppAtualizarVinculoSemErroInterno() throws Exception {
		Usuario adminApp = usuario(PerfilUsuario.ADMIN_APP);
		Usuario operador = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		VinculoUsuarioOrganizacao vinculo = vinculo(operador, prefeitura, PapelUsuario.ADMIN_PREFEITURA);

		mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/vinculos/{vinculoId}", vinculo.getId())
						.with(jwtUsuario(adminApp, "ADMIN_APP"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "papel": "ADMIN_PREFEITURA",
								  "ativo": false
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(vinculo.getId()))
				.andExpect(jsonPath("$.ativo").value(false));
	}

	@Test
	void deveBloquearSecretariaAoAprovarTransferencia() throws Exception {
		Usuario adminSecretaria = usuario(PerfilUsuario.MORADOR);

		mockMvc.perform(post("/api/operacional/solicitacoes-transferencia/999/aprovacao")
						.with(jwtUsuario(adminSecretaria, "MORADOR", "ADMIN_SECRETARIA"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "organizacaoDestinoId": 1,
								  "motivo": "Teste."
								}
								"""))
				.andExpect(status().isForbidden());
	}

	private JwtRequestPostProcessor jwtUsuario(Usuario usuario, String... papeis) {
		return jwt()
				.jwt(jwt -> jwt.subject(usuario.getId().toString()))
				.authorities(Arrays.stream(papeis)
						.map(papel -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + papel))
						.toList());
	}

	private Usuario usuario(PerfilUsuario perfil) {
		int numero = SEQUENCIA.incrementAndGet();
		Usuario usuario = new Usuario();
		usuario.setNome("Usuario Teste " + numero);
		usuario.setEmail("usuario" + numero + "@example.com");
		usuario.setUsername("usuario_" + numero);
		usuario.setSenhaHash("hash");
		usuario.setPerfilGlobal(perfil);
		usuario.setCidade("Joao Pessoa");
		usuario.setBairro("Centro");
		return usuarioRepository.save(usuario);
	}

	private Organizacao prefeitura() {
		return prefeitura("Joao Pessoa");
	}

	private Organizacao prefeitura(String cidade) {
		int numero = SEQUENCIA.incrementAndGet();
		Organizacao prefeitura = new Organizacao();
		prefeitura.setNome("Prefeitura Teste " + numero);
		prefeitura.setTipo(TipoOrganizacao.PREFEITURA);
		prefeitura.setCidade(cidade);
		prefeitura.setEstado("PB");
		prefeitura.setVerificada(true);
		return organizacaoRepository.save(prefeitura);
	}

	private Organizacao secretaria(Organizacao prefeitura) {
		int numero = SEQUENCIA.incrementAndGet();
		Organizacao secretaria = new Organizacao();
		secretaria.setNome("Secretaria Teste " + numero);
		secretaria.setTipo(TipoOrganizacao.SECRETARIA);
		secretaria.setCidade(prefeitura.getCidade());
		secretaria.setEstado(prefeitura.getEstado());
		secretaria.setOrganizacaoPai(prefeitura);
		secretaria.setVerificada(true);
		return organizacaoRepository.save(secretaria);
	}

	private VinculoUsuarioOrganizacao vinculo(Usuario usuario, Organizacao organizacao, PapelUsuario papel) {
		VinculoUsuarioOrganizacao vinculo = new VinculoUsuarioOrganizacao();
		vinculo.setUsuario(usuario);
		vinculo.setOrganizacao(organizacao);
		vinculo.setPapel(papel);
		return vinculoRepository.save(vinculo);
	}

	private Denuncia denunciaComResponsavel(Organizacao organizacao) {
		int numero = SEQUENCIA.incrementAndGet();
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = new Categoria();
		categoria.setNome("Categoria Teste " + numero);
		categoria.setDescricao("Categoria usada nos testes.");
		Categoria categoriaSalva = categoriaRepository.save(categoria);

		Denuncia denuncia = new Denuncia();
		denuncia.setTitulo("Denuncia Teste " + numero);
		denuncia.setDescricao("Descricao da denuncia de teste.");
		denuncia.setCategoria(categoriaSalva);
		denuncia.setAutor(autor);
		denuncia.setCidade("Joao Pessoa");
		denuncia.setBairro("Centro");
		denuncia.setStatus(StatusDenuncia.ABERTO);
		denuncia.setOrganizacaoResponsavel(organizacao);
		return denunciaRepository.save(denuncia);
	}
}
