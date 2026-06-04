package com.mykael.prefeitura.infra.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mykael.prefeitura.infra.auth.dto.AuthResponseDTO;
import com.mykael.prefeitura.infra.auth.dto.CadastroMoradorRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.LoginRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.UsuarioLogadoResponseDTO;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(
		webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
		properties = {
				"spring.flyway.enabled=true",
				"spring.jpa.hibernate.ddl-auto=validate",
				"app.admin-inicial.habilitado=false",
				"app.storage.denuncia-anexos-dir=build/test-uploads/denuncias"
		}
)
class AuthIntegrationTest {

	@Container
	static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
			.withDatabaseName("cidadeativa_test")
			.withUsername("cidadeativa")
			.withPassword("cidadeativa-local-test");

	@LocalServerPort
	private int port;

	@Autowired
	private ObjectMapper objectMapper;

	private final HttpClient httpClient = HttpClient.newHttpClient();

	@DynamicPropertySource
	static void postgresProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", postgres::getJdbcUrl);
		registry.add("spring.datasource.username", postgres::getUsername);
		registry.add("spring.datasource.password", postgres::getPassword);
		registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
	}

	@Test
	void deveCadastrarMoradorLogarComUsernameEmailEAcessarUsuarioLogado() throws Exception {
		CadastroMoradorRequestDTO cadastro = new CadastroMoradorRequestDTO(
				"Maria Silva",
				"maria.integracao@example.com",
				"maria_integracao",
				"senha-segura",
				"83999990000",
				"Joao Pessoa",
				"Centro"
		);

		HttpResponse<String> cadastroResponse = post("/api/auth/cadastro-morador", cadastro);

		assertThat(cadastroResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
		AuthResponseDTO body = objectMapper.readValue(cadastroResponse.body(), AuthResponseDTO.class);
		assertThat(body.usuario().email()).isEqualTo("maria.integracao@example.com");
		assertThat(cadastroResponse.headers().allValues("set-cookie")).isNotEmpty();

		assertLoginComIdentificador("maria_integracao");
		assertLoginComIdentificador("maria.integracao@example.com");
		assertUsuarioLogadoComCookie(cadastroResponse.headers().allValues("set-cookie"));
	}

	private void assertLoginComIdentificador(String identificador) throws Exception {
		HttpResponse<String> response = post("/api/auth/login", new LoginRequestDTO(identificador, "senha-segura"));

		assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
		AuthResponseDTO body = objectMapper.readValue(response.body(), AuthResponseDTO.class);
		assertThat(body.usuario().username()).isEqualTo("maria_integracao");
		assertThat(response.headers().allValues("set-cookie")).isNotEmpty();
	}

	private void assertUsuarioLogadoComCookie(List<String> setCookies) throws Exception {
		HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(url("/api/auth/me")))
				.header("Cookie", cookieHeader(setCookies))
				.GET()
				.build();
		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

		assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
		UsuarioLogadoResponseDTO body = objectMapper.readValue(response.body(), UsuarioLogadoResponseDTO.class);
		assertThat(body.usuario().username()).isEqualTo("maria_integracao");
	}

	private String cookieHeader(List<String> setCookies) {
		return setCookies.stream()
				.map(cookie -> cookie.split(";", 2)[0])
				.reduce((left, right) -> left + "; " + right)
				.orElse("");
	}

	private HttpResponse<String> post(String path, Object body) throws Exception {
		HttpRequest request = HttpRequest.newBuilder()
				.uri(URI.create(url(path)))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
				.build();
		return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private String url(String path) {
		return "http://localhost:" + port + path;
	}
}
