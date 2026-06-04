package com.mykael.prefeitura.infra.doc;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	OpenAPI cidadeAtivaOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("Cidade Ativa API")
						.version("v1")
						.description("""
								API para registro, acompanhamento e gestao de denuncias urbanas.

								Erros da API seguem o formato `ErroApiResponse`, com `timestamp`, `status`, `erro`,
								`mensagem` e `caminho`. Endpoints sensiveis podem retornar `429 LIMITE_REQUISICOES`
								quando houver muitas requisicoes em pouco tempo.
								""")
						.license(new License().name("Projeto privado")))
				.components(new Components()
						.addSecuritySchemes("cookieAuth", new SecurityScheme()
								.type(SecurityScheme.Type.APIKEY)
								.in(SecurityScheme.In.COOKIE)
								.name("access_token")
								.description("Cookie HttpOnly criado no login. Usado pela aplicacao web."))
						.addSecuritySchemes("bearerAuth", new SecurityScheme()
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")
								.description("Opcional para testes tecnicos via header Authorization.")));
	}
}
