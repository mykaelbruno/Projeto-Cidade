package com.mykael.prefeitura.core.fluxo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.categoria.CategoriaRepository;
import com.mykael.prefeitura.core.bairro.Bairro;
import com.mykael.prefeitura.core.bairro.BairroRepository;
import com.mykael.prefeitura.core.comentario.Comentario;
import com.mykael.prefeitura.core.comentario.ComentarioRepository;
import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.operacional.SolicitacaoTransferenciaDenuncia;
import com.mykael.prefeitura.core.operacional.SolicitacaoTransferenciaDenunciaRepository;
import com.mykael.prefeitura.core.operacional.StatusSolicitacaoTransferencia;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.sinalizacao.SinalizacaoDenuncia;
import com.mykael.prefeitura.core.sinalizacao.SinalizacaoDenunciaRepository;
import com.mykael.prefeitura.core.sinalizacao.StatusSinalizacaoDenuncia;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class FluxosPrincipaisIntegrationTest {

	private static final AtomicInteger SEQUENCIA = new AtomicInteger();

	@Autowired
	private MockMvc mockMvc;

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Autowired
	private PasswordEncoder passwordEncoder;

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
	private ComentarioRepository comentarioRepository;

	@Autowired
	private SinalizacaoDenunciaRepository sinalizacaoRepository;

	@Autowired
	private SolicitacaoTransferenciaDenunciaRepository solicitacaoRepository;

	@Autowired
	private BairroRepository bairroRepository;

	@Test
	void deveCadastrarMoradorELogarComEmailEUsername() throws Exception {
		int numero = SEQUENCIA.incrementAndGet();
		String email = "cadastro.fluxo" + numero + "@example.com";
		String username = "cadastro_fluxo_" + numero;

		mockMvc.perform(post("/api/auth/cadastro-morador")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "nome": "Morador Fluxo",
								  "email": "%s",
								  "username": "%s",
								  "senha": "senha-segura",
								  "telefone": "83999990000",
								  "cidade": "Joao Pessoa",
								  "bairro": "Centro"
								}
								""".formatted(email, username)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.usuario.email").value(email))
				.andExpect(jsonPath("$.usuario.username").value(username))
				.andExpect(jsonPath("$.usuario.emailVerificado").value(false));

		assertLogin(username, username);
		assertLogin(email, username);
	}

	@Test
	void deveCriarDenunciaComentarEResponderOficialmente() throws Exception {
		Usuario morador = usuario(PerfilUsuario.MORADOR);
		Usuario adminSecretaria = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Bairro bairro = bairro(prefeitura, "Centro");
		Organizacao secretaria = secretaria(prefeitura);
		vinculo(adminSecretaria, secretaria, PapelUsuario.ADMIN_SECRETARIA);
		Categoria categoria = categoria(secretaria);

		Long denunciaId = criarDenunciaViaApi(morador, categoria, prefeitura, bairro);

		mockMvc.perform(post("/api/denuncias/{denunciaId}/comentarios", denunciaId)
						.with(jwtUsuario(morador, "MORADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "conteudo": "O problema continua acontecendo todos os dias."
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.oficial").value(false));

		mockMvc.perform(post("/api/denuncias/{denunciaId}/respostas-oficiais", denunciaId)
						.with(jwtUsuario(adminSecretaria, "MORADOR", "ADMIN_SECRETARIA"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "organizacaoId": %d,
								  "conteudo": "A secretaria ja abriu atendimento para esta ocorrencia."
								}
								""".formatted(secretaria.getId())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.oficial").value(true))
				.andExpect(jsonPath("$.organizacaoId").value(secretaria.getId()));

		mockMvc.perform(get("/api/denuncias/{denunciaId}/comentarios", denunciaId)
						.with(jwtUsuario(morador, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(2)));
	}

	@Test
	void deveSolicitarEAprovarTransferenciaDeDenuncia() throws Exception {
		Usuario adminSecretaria = usuario(PerfilUsuario.MORADOR);
		Usuario adminPrefeitura = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao origem = secretaria(prefeitura);
		Organizacao destino = secretaria(prefeitura);
		vinculo(adminSecretaria, origem, PapelUsuario.ADMIN_SECRETARIA);
		vinculo(adminPrefeitura, prefeitura, PapelUsuario.ADMIN_PREFEITURA);
		Denuncia denuncia = denunciaComResponsavel(origem);

		MvcResult solicitacaoResult = mockMvc.perform(post("/api/operacional/denuncias/{denunciaId}/solicitacoes-transferencia", denuncia.getId())
						.with(jwtUsuario(adminSecretaria, "MORADOR", "ADMIN_SECRETARIA"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "organizacaoDestinoSugeridaId": %d,
								  "motivo": "Esta demanda pertence a outra secretaria."
								}
								""".formatted(destino.getId())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value(StatusSolicitacaoTransferencia.PENDENTE.name()))
				.andReturn();

		Long solicitacaoId = idDaResposta(solicitacaoResult);

		mockMvc.perform(post("/api/operacional/solicitacoes-transferencia/{solicitacaoId}/aprovacao", solicitacaoId)
						.with(jwtUsuario(adminPrefeitura, "MORADOR", "ADMIN_PREFEITURA"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "organizacaoDestinoId": %d,
								  "motivo": "Transferencia aprovada pela prefeitura."
								}
								""".formatted(destino.getId())))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value(StatusSolicitacaoTransferencia.APROVADA.name()));

		Denuncia atualizada = denunciaRepository.findById(denuncia.getId()).orElseThrow();
		assertThat(atualizada.getOrganizacaoResponsavel().getId()).isEqualTo(destino.getId());
		SolicitacaoTransferenciaDenuncia solicitacao = solicitacaoRepository.findById(solicitacaoId).orElseThrow();
		assertThat(solicitacao.getStatus()).isEqualTo(StatusSolicitacaoTransferencia.APROVADA);
	}

	@Test
	void deveSinalizarAnalisarEExecutarModeracao() throws Exception {
		Usuario morador = usuario(PerfilUsuario.MORADOR);
		Usuario moderador = usuario(PerfilUsuario.MODERADOR);
		Denuncia denuncia = denunciaComResponsavel(null);
		Comentario comentario = comentario(denuncia, morador);

		MvcResult sinalizacaoResult = mockMvc.perform(post("/api/denuncias/{denunciaId}/sinalizacoes", denuncia.getId())
						.with(jwtUsuario(morador, "MORADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "SPAM",
								  "comentario": "Conteudo parece irregular."
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.motivo").value("SPAM"))
				.andExpect(jsonPath("$.comentario").value("Conteudo parece irregular."))
				.andExpect(jsonPath("$.status").value(StatusSinalizacaoDenuncia.PENDENTE.name()))
				.andReturn();

		Long sinalizacaoId = idDaResposta(sinalizacaoResult);

		mockMvc.perform(post("/api/moderacoes/sinalizacoes-denuncia/{sinalizacaoId}/analise", sinalizacaoId)
						.with(jwtUsuario(moderador, "MODERADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value(StatusSinalizacaoDenuncia.ANALISADA.name()));

		mockMvc.perform(post("/api/moderacoes/comentarios/{comentarioId}/remocao", comentario.getId())
						.with(jwtUsuario(moderador, "MODERADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "Comentario removido por violar as regras."
								}
								"""))
				.andExpect(status().isOk());

		SinalizacaoDenuncia sinalizacao = sinalizacaoRepository.findById(sinalizacaoId).orElseThrow();
		assertThat(sinalizacao.getStatus()).isEqualTo(StatusSinalizacaoDenuncia.ANALISADA);
		assertThat(comentarioRepository.findById(comentario.getId()).orElseThrow().getRemovidoEm()).isNotNull();
	}

	@Test
	void deveAdvertirSuspenderBloquearTokenEReativarUsuario() throws Exception {
		Usuario morador = usuario(PerfilUsuario.MORADOR);
		Usuario moderador = usuario(PerfilUsuario.MODERADOR);

		mockMvc.perform(post("/api/moderacoes/usuarios/{usuarioId}/advertencia", morador.getId())
						.with(jwtUsuario(moderador, "MODERADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "Usuario recebeu advertencia por comportamento inadequado."
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.tipoAlvo").value("USUARIO"))
				.andExpect(jsonPath("$.acaoUsuario").value("ADVERTENCIA"))
				.andExpect(jsonPath("$.usuarioAlvoId").value(morador.getId()));

		mockMvc.perform(post("/api/moderacoes/usuarios/{usuarioId}/suspensao", morador.getId())
						.with(jwtUsuario(moderador, "MODERADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "Usuario reincidiu em abuso."
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.acaoUsuario").value("SUSPENSAO"));

		assertThat(usuarioRepository.findById(morador.getId()).orElseThrow().isAtivo()).isFalse();

		mockMvc.perform(get("/api/auth/me")
						.with(jwtUsuario(morador, "MORADOR")))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.erro").value("USUARIO_INATIVO"));

		mockMvc.perform(post("/api/moderacoes/usuarios/{usuarioId}/reativacao", morador.getId())
						.with(jwtUsuario(moderador, "MODERADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "Usuario revisado e liberado."
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.acaoUsuario").value("REATIVACAO"));

		assertThat(usuarioRepository.findById(morador.getId()).orElseThrow().isAtivo()).isTrue();

		mockMvc.perform(get("/api/moderacoes/usuarios/{usuarioId}/historico", morador.getId())
						.with(jwtUsuario(moderador, "MODERADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(3)));
	}

	@Test
	void moderadorNaoDeveSuspenderContaAdministrativa() throws Exception {
		Usuario moderador = usuario(PerfilUsuario.MODERADOR);
		Usuario adminApp = usuario(PerfilUsuario.ADMIN_APP);

		mockMvc.perform(post("/api/moderacoes/usuarios/{usuarioId}/suspensao", adminApp.getId())
						.with(jwtUsuario(moderador, "MODERADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "motivo": "Tentativa indevida de suspensao administrativa."
								}
								"""))
				.andExpect(status().isForbidden());

		assertThat(usuarioRepository.findById(adminApp.getId()).orElseThrow().isAtivo()).isTrue();
	}

	@Test
	void deveRetornarMetricasAdministrativasRicasNoPainelOperacional() throws Exception {
		Usuario adminPrefeitura = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao secretaria = secretaria(prefeitura);
		vinculo(adminPrefeitura, prefeitura, PapelUsuario.ADMIN_PREFEITURA);
		Categoria infraestrutura = categoria(secretaria);
		Categoria iluminacao = categoria(secretaria);

		Denuncia concluidaConfirmada = denunciaComResponsavel(secretaria);
		concluidaConfirmada.setCategoria(infraestrutura);
		concluidaConfirmada.setBairro("Bairro Metricas A");
		concluidaConfirmada.setStatus(StatusDenuncia.CONCLUIDO);
		concluidaConfirmada.confirmarConclusao("Resolvido.");
		denunciaRepository.save(concluidaConfirmada);

		Denuncia reaberta = denunciaComResponsavel(secretaria);
		reaberta.setCategoria(infraestrutura);
		reaberta.setBairro("Bairro Metricas A");
		reaberta.setStatus(StatusDenuncia.REABERTO);
		denunciaRepository.save(reaberta);

		Denuncia aberta = denunciaComResponsavel(secretaria);
		aberta.setCategoria(iluminacao);
		aberta.setBairro("Bairro Metricas B");
		aberta.setStatus(StatusDenuncia.ABERTO);
		denunciaRepository.save(aberta);

		mockMvc.perform(get("/api/paineis/operacional/organizacoes/{organizacaoId}/resumo", prefeitura.getId())
						.with(jwtUsuario(adminPrefeitura, "MORADOR", "ADMIN_PREFEITURA")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.denuncias.total").value(3))
				.andExpect(jsonPath("$.indicadores.taxaConclusaoConfirmada").value(33.33))
				.andExpect(jsonPath("$.indicadores.taxaReabertura").value(33.33))
				.andExpect(jsonPath("$.bairrosMaisDemandados[0].nome").value("Bairro Metricas A"))
				.andExpect(jsonPath("$.bairrosMaisDemandados[0].total").value(2))
				.andExpect(jsonPath("$.categoriasMaisDemandadas[0].nome").value(infraestrutura.getNome()))
				.andExpect(jsonPath("$.categoriasMaisDemandadas[0].total").value(2));
	}

	@Test
	void deveRetornarResumoOperacionalDaSecretaria() throws Exception {
		Usuario adminSecretaria = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao secretaria = secretaria(prefeitura);
		vinculo(adminSecretaria, secretaria, PapelUsuario.ADMIN_SECRETARIA);
		Categoria categoria = categoria(secretaria);

		Denuncia concluidaConfirmada = denunciaComResponsavel(secretaria);
		concluidaConfirmada.setCategoria(categoria);
		concluidaConfirmada.setBairro("Centro");
		concluidaConfirmada.setStatus(StatusDenuncia.CONCLUIDO);
		concluidaConfirmada.confirmarConclusao("Resolvido pela secretaria.");
		denunciaRepository.save(concluidaConfirmada);

		Denuncia emAnalise = denunciaComResponsavel(secretaria);
		emAnalise.setCategoria(categoria);
		emAnalise.setBairro("Centro");
		emAnalise.setStatus(StatusDenuncia.EM_ANALISE);
		denunciaRepository.save(emAnalise);

		mockMvc.perform(get("/api/paineis/operacional/organizacoes/{organizacaoId}/resumo", secretaria.getId())
						.with(jwtUsuario(adminSecretaria, "MORADOR", "ADMIN_SECRETARIA")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.organizacaoId").value(secretaria.getId()))
				.andExpect(jsonPath("$.tipoOrganizacao").value(TipoOrganizacao.SECRETARIA.name()))
				.andExpect(jsonPath("$.denuncias.total").value(2))
				.andExpect(jsonPath("$.denuncias.emAnalise").value(1))
				.andExpect(jsonPath("$.denuncias.concluidasConfirmadas").value(1))
				.andExpect(jsonPath("$.transferenciasPendentes").value(0))
				.andExpect(jsonPath("$.bairrosMaisDemandados[0].nome").value("Centro"))
				.andExpect(jsonPath("$.categoriasMaisDemandadas[0].nome").value(categoria.getNome()));
	}

	@Test
	void deveExportarDenunciasOperacionaisEmCsvSemDadosDoAutor() throws Exception {
		Usuario adminPrefeitura = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao secretaria = secretaria(prefeitura);
		vinculo(adminPrefeitura, prefeitura, PapelUsuario.ADMIN_PREFEITURA);
		Categoria categoria = categoria(secretaria);

		Denuncia exportada = denunciaComResponsavel(secretaria);
		exportada.setTitulo("Relatorio buraco exportavel");
		exportada.setCategoria(categoria);
		exportada.setBairro("Bairro Relatorio");
		exportada.setRua(null);
		exportada.setPontoReferencia("Em frente ao posto");
		denunciaRepository.save(exportada);

		Denuncia foraDoFiltro = denunciaComResponsavel(secretaria);
		foraDoFiltro.setTitulo("Relatorio nao deve aparecer");
		foraDoFiltro.setCategoria(categoria);
		foraDoFiltro.setBairro("Outro Bairro");
		denunciaRepository.save(foraDoFiltro);

		MvcResult result = mockMvc.perform(get("/api/relatorios/operacional/organizacoes/{organizacaoId}/denuncias.csv", prefeitura.getId())
						.param("bairro", "Bairro Relatorio")
						.with(jwtUsuario(adminPrefeitura, "MORADOR", "ADMIN_PREFEITURA")))
				.andExpect(status().isOk())
				.andReturn();

		String csv = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
		assertThat(result.getResponse().getContentType()).contains("text/csv");
		assertThat(result.getResponse().getHeader(HttpHeaders.CONTENT_DISPOSITION)).contains("attachment; filename=");
		assertThat(csv).contains("id;titulo;status;categoria;cidade;bairro");
		assertThat(csv).contains("Relatorio buraco exportavel");
		assertThat(csv).contains(categoria.getNome());
		assertThat(csv).contains("Bairro Relatorio");
		assertThat(csv).doesNotContain("Relatorio nao deve aparecer");
		assertThat(csv).doesNotContain(exportada.getAutor().getEmail());
		assertThat(csv).doesNotContain(exportada.getAutor().getNome());
	}

	private void assertLogin(String identificador, String usernameEsperado) throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "identificador": "%s",
								  "senha": "senha-segura"
								}
								""".formatted(identificador)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.usuario.username").value(usernameEsperado));
	}

	private Long criarDenunciaViaApi(Usuario morador, Categoria categoria, Organizacao prefeitura, Bairro bairro) throws Exception {
		MvcResult result = mockMvc.perform(post("/api/denuncias")
						.with(jwtUsuario(morador, "MORADOR"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "titulo": "Buraco grande na rua",
								  "descricao": "Existe um buraco grande na rua principal do bairro ha varios dias.",
								  "categoriaId": %d,
								  "prefeituraId": %d,
								  "bairroId": %d,
								  "anonima": false,
								  "cidade": "Joao Pessoa",
								  "bairro": "Centro",
								  "rua": "Rua Principal",
								  "pontoReferencia": "Perto da praca",
								  "latitude": -7.12,
								  "longitude": -34.86
								}
								""".formatted(categoria.getId(), prefeitura.getId(), bairro.getId())))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value(StatusDenuncia.ABERTO.name()))
				.andReturn();
		return idDaResposta(result);
	}

	private Long idDaResposta(MvcResult result) throws Exception {
		JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
		return json.get("id").asLong();
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
		usuario.setNome("Usuario Fluxo " + numero);
		usuario.setEmail("usuario.fluxo" + numero + "@example.com");
		usuario.setUsername("usuario_fluxo_" + numero);
		usuario.setSenhaHash(passwordEncoder.encode("senha-segura"));
		usuario.setPerfilGlobal(perfil);
		usuario.setCidade("Joao Pessoa");
		usuario.setBairro("Centro");
		return usuarioRepository.save(usuario);
	}

	private Organizacao prefeitura() {
		int numero = SEQUENCIA.incrementAndGet();
		Organizacao prefeitura = new Organizacao();
		prefeitura.setNome("Prefeitura Fluxo " + numero);
		prefeitura.setTipo(TipoOrganizacao.PREFEITURA);
		prefeitura.setCidade("Joao Pessoa");
		prefeitura.setEstado("PB");
		prefeitura.setVerificada(true);
		return organizacaoRepository.save(prefeitura);
	}

	private Organizacao secretaria(Organizacao prefeitura) {
		int numero = SEQUENCIA.incrementAndGet();
		Organizacao secretaria = new Organizacao();
		secretaria.setNome("Secretaria Fluxo " + numero);
		secretaria.setTipo(TipoOrganizacao.SECRETARIA);
		secretaria.setCidade(prefeitura.getCidade());
		secretaria.setEstado(prefeitura.getEstado());
		secretaria.setOrganizacaoPai(prefeitura);
		secretaria.setVerificada(true);
		return organizacaoRepository.save(secretaria);
	}

	private Bairro bairro(Organizacao prefeitura, String nome) {
		Bairro bairro = new Bairro();
		bairro.setPrefeitura(prefeitura);
		bairro.setNome(nome);
		return bairroRepository.save(bairro);
	}

	private VinculoUsuarioOrganizacao vinculo(Usuario usuario, Organizacao organizacao, PapelUsuario papel) {
		VinculoUsuarioOrganizacao vinculo = new VinculoUsuarioOrganizacao();
		vinculo.setUsuario(usuario);
		vinculo.setOrganizacao(organizacao);
		vinculo.setPapel(papel);
		return vinculoRepository.save(vinculo);
	}

	private Categoria categoria(Organizacao organizacaoResponsavelPadrao) {
		int numero = SEQUENCIA.incrementAndGet();
		Categoria categoria = new Categoria();
		categoria.setNome("Categoria Fluxo " + numero);
		categoria.setDescricao("Categoria usada nos testes de fluxo.");
		categoria.setOrganizacaoResponsavelPadrao(organizacaoResponsavelPadrao);
		return categoriaRepository.save(categoria);
	}

	private Denuncia denunciaComResponsavel(Organizacao organizacao) {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Denuncia denuncia = new Denuncia();
		denuncia.setTitulo("Denuncia Fluxo " + SEQUENCIA.incrementAndGet());
		denuncia.setDescricao("Descricao suficiente para denuncia de fluxo principal.");
		denuncia.setCategoria(categoria(organizacao));
		denuncia.setAutor(autor);
		denuncia.setCidade("Joao Pessoa");
		denuncia.setBairro("Centro");
		denuncia.setStatus(StatusDenuncia.ABERTO);
		denuncia.setOrganizacaoResponsavel(organizacao);
		return denunciaRepository.save(denuncia);
	}

	private Comentario comentario(Denuncia denuncia, Usuario autor) {
		Comentario comentario = new Comentario();
		comentario.setDenuncia(denuncia);
		comentario.setAutor(autor);
		comentario.setConteudo("Comentario criado para teste de moderacao.");
		comentario.setOficial(false);
		return comentarioRepository.save(comentario);
	}
}
