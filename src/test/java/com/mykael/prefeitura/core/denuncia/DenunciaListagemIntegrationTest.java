package com.mykael.prefeitura.core.denuncia;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.categoria.CategoriaRepository;
import com.mykael.prefeitura.core.comentario.Comentario;
import com.mykael.prefeitura.core.comentario.ComentarioRepository;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DenunciaListagemIntegrationTest {

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
	private ComentarioRepository comentarioRepository;

	@Test
	void deveListarApenasDenunciasDoMoradorAutenticado() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Usuario outroMorador = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		Denuncia denunciaDoAutor = denuncia(autor, categoria, null, StatusDenuncia.ABERTO, "Bairro Minhas");
		denuncia(outroMorador, categoria, null, StatusDenuncia.ABERTO, "Bairro Minhas");

		mockMvc.perform(get("/api/denuncias/minhas")
						.param("bairro", "Bairro Minhas")
						.with(jwtUsuario(autor, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)))
				.andExpect(jsonPath("$.content[0].id").value(denunciaDoAutor.getId()));
	}

	@Test
	void deveFiltrarDenunciasOperacionaisDaPrefeitura() throws Exception {
		Usuario adminPrefeitura = usuario(PerfilUsuario.MORADOR);
		Organizacao prefeitura = prefeitura();
		Organizacao secretariaObras = secretaria(prefeitura);
		Organizacao secretariaSaude = secretaria(prefeitura);
		vinculo(adminPrefeitura, prefeitura, PapelUsuario.ADMIN_PREFEITURA);
		Categoria categoriaObras = categoria();
		Categoria categoriaSaude = categoria();
		Denuncia denunciaEsperada = denuncia(
				usuario(PerfilUsuario.MORADOR),
				categoriaObras,
				secretariaObras,
				StatusDenuncia.EM_ANALISE,
				"Bairro Operacional"
		);
		denuncia(
				usuario(PerfilUsuario.MORADOR),
				categoriaSaude,
				secretariaSaude,
				StatusDenuncia.ABERTO,
				"Bairro Operacional"
		);

		mockMvc.perform(get("/api/operacional/organizacoes/{organizacaoId}/denuncias", prefeitura.getId())
						.param("bairro", "Bairro Operacional")
						.param("status", "EM_ANALISE")
						.param("categoriaId", categoriaObras.getId().toString())
						.with(jwtUsuario(adminPrefeitura, "MORADOR", "ADMIN_PREFEITURA")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)))
				.andExpect(jsonPath("$.content[0].id").value(denunciaEsperada.getId()));
	}

	@Test
	void deveOcultarDenunciaArquivadaDaListagemGeralParaMoradorComum() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Usuario outroMorador = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		Denuncia arquivada = denuncia(autor, categoria, null, StatusDenuncia.ARQUIVADO, "Bairro Arquivado");

		mockMvc.perform(get("/api/denuncias")
						.param("status", "ARQUIVADO")
						.with(jwtUsuario(outroMorador, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(0)));

		mockMvc.perform(get("/api/denuncias/{id}", arquivada.getId())
						.with(jwtUsuario(outroMorador, "MORADOR")))
				.andExpect(status().isNotFound());
	}

	@Test
	void deveOcultarDenunciaArquivadaDoFeedParaMoradorComum() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Usuario leitor = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		denuncia(autor, categoria, null, StatusDenuncia.ARQUIVADO, "Bairro Feed Arquivado");

		mockMvc.perform(get("/api/feed/denuncias")
						.param("status", "ARQUIVADO")
						.with(jwtUsuario(leitor, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(0)));
	}

	@Test
	void devePermitirAutorConsultarPropriaDenunciaArquivada() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		Denuncia arquivada = denuncia(autor, categoria, null, StatusDenuncia.ARQUIVADO, "Bairro Arquivado Autor");

		mockMvc.perform(get("/api/denuncias/{id}", arquivada.getId())
						.with(jwtUsuario(autor, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(arquivada.getId()));
	}

	@Test
	void deveOcultarAutorDeComentarioDoAutorEmDenunciaAnonima() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Usuario leitor = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		Denuncia anonima = denuncia(autor, categoria, null, StatusDenuncia.ABERTO, "Bairro Anonimo");
		anonima.setAnonima(true);
		denunciaRepository.save(anonima);
		comentario(anonima, autor, "Ainda esta acontecendo.");

		mockMvc.perform(get("/api/denuncias/{denunciaId}/comentarios", anonima.getId())
						.with(jwtUsuario(leitor, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)))
				.andExpect(jsonPath("$.content[0].autorId", nullValue()))
				.andExpect(jsonPath("$.content[0].autorNome").value("Morador anonimo"));
	}

	@Test
	void deveSugerirDenunciaSemelhanteAtivaEProxima() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Usuario leitor = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		Denuncia existente = denuncia(autor, categoria, null, StatusDenuncia.ABERTO, "Centro");
		existente.setTitulo("Buraco grande perto da praca");
		existente.setDescricao("Existe um buraco grande na rua principal causando risco para carros e pedestres.");
		existente.setRua("Rua Principal");
		existente.setLatitude(-7.1200);
		existente.setLongitude(-34.8600);
		denunciaRepository.save(existente);

		mockMvc.perform(post("/api/denuncias/semelhantes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "titulo": "Buraco grande na Rua Principal",
								  "descricao": "O buraco na rua principal continua causando risco para pedestres e motoristas.",
								  "categoriaId": %d,
								  "anonima": false,
								  "cidade": "Joao Pessoa",
								  "bairro": "Centro",
								  "rua": "Rua Principal",
								  "pontoReferencia": "Perto da praca",
								  "latitude": -7.1203,
								  "longitude": -34.8602
								}
								""".formatted(categoria.getId()))
						.with(jwtUsuario(leitor, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].denunciaId").value(existente.getId()))
				.andExpect(jsonPath("$[0].motivos", hasItem("Localizacao proxima")))
				.andExpect(jsonPath("$[0].motivos", hasItem("Texto parecido")));
	}

	@Test
	void naoDeveSugerirDenunciaArquivadaOuConcluidaComoSemelhante() throws Exception {
		Usuario autor = usuario(PerfilUsuario.MORADOR);
		Usuario leitor = usuario(PerfilUsuario.MORADOR);
		Categoria categoria = categoria();
		Denuncia arquivada = denuncia(autor, categoria, null, StatusDenuncia.ARQUIVADO, "Centro Duplicidade");
		arquivada.setTitulo("Buraco grande perto da escola");
		arquivada.setDescricao("Existe um buraco grande perto da escola municipal.");
		arquivada.setRua("Rua da Escola");
		arquivada.setLatitude(-7.1300);
		arquivada.setLongitude(-34.8700);
		denunciaRepository.save(arquivada);

		Denuncia concluida = denuncia(autor, categoria, null, StatusDenuncia.CONCLUIDO, "Centro Duplicidade");
		concluida.setTitulo("Buraco grande perto da escola");
		concluida.setDescricao("Existe um buraco grande perto da escola municipal.");
		concluida.setRua("Rua da Escola");
		concluida.setLatitude(-7.1301);
		concluida.setLongitude(-34.8701);
		denunciaRepository.save(concluida);

		mockMvc.perform(post("/api/denuncias/semelhantes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "titulo": "Buraco grande perto da escola",
								  "descricao": "O mesmo buraco perto da escola municipal ainda esta aberto.",
								  "categoriaId": %d,
								  "anonima": false,
								  "cidade": "Joao Pessoa",
								  "bairro": "Centro Duplicidade",
								  "rua": "Rua da Escola",
								  "pontoReferencia": "Em frente a escola",
								  "latitude": -7.1302,
								  "longitude": -34.8702
								}
								""".formatted(categoria.getId()))
						.with(jwtUsuario(leitor, "MORADOR")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
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
		usuario.setNome("Usuario Listagem " + numero);
		usuario.setEmail("usuario.listagem" + numero + "@example.com");
		usuario.setUsername("usuario_listagem_" + numero);
		usuario.setSenhaHash("hash");
		usuario.setPerfilGlobal(perfil);
		usuario.setCidade("Joao Pessoa");
		usuario.setBairro("Centro");
		return usuarioRepository.save(usuario);
	}

	private Organizacao prefeitura() {
		int numero = SEQUENCIA.incrementAndGet();
		Organizacao prefeitura = new Organizacao();
		prefeitura.setNome("Prefeitura Listagem " + numero);
		prefeitura.setTipo(TipoOrganizacao.PREFEITURA);
		prefeitura.setCidade("Joao Pessoa");
		prefeitura.setEstado("PB");
		prefeitura.setVerificada(true);
		return organizacaoRepository.save(prefeitura);
	}

	private Organizacao secretaria(Organizacao prefeitura) {
		int numero = SEQUENCIA.incrementAndGet();
		Organizacao secretaria = new Organizacao();
		secretaria.setNome("Secretaria Listagem " + numero);
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

	private Categoria categoria() {
		int numero = SEQUENCIA.incrementAndGet();
		Categoria categoria = new Categoria();
		categoria.setNome("Categoria Listagem " + numero);
		categoria.setDescricao("Categoria usada nos testes de listagem.");
		return categoriaRepository.save(categoria);
	}

	private Denuncia denuncia(
			Usuario autor,
			Categoria categoria,
			Organizacao organizacao,
			StatusDenuncia status,
			String bairro
	) {
		int numero = SEQUENCIA.incrementAndGet();
		Denuncia denuncia = new Denuncia();
		denuncia.setTitulo("Denuncia Listagem " + numero);
		denuncia.setDescricao("Descricao da denuncia de teste.");
		denuncia.setCategoria(categoria);
		denuncia.setAutor(autor);
		denuncia.setCidade("Joao Pessoa");
		denuncia.setBairro(bairro);
		denuncia.setStatus(status);
		denuncia.setOrganizacaoResponsavel(organizacao);
		return denunciaRepository.save(denuncia);
	}

	private Comentario comentario(Denuncia denuncia, Usuario autor, String conteudo) {
		Comentario comentario = new Comentario();
		comentario.setDenuncia(denuncia);
		comentario.setAutor(autor);
		comentario.setConteudo(conteudo);
		comentario.setOficial(false);
		return comentarioRepository.save(comentario);
	}
}
