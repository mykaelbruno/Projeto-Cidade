package com.mykael.prefeitura.core.relatorio;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Relatorios", description = "Exportacoes operacionais em formato de arquivo para prefeitura e secretarias.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Filtro invalido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem vinculo ou papel institucional exigido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Organizacao ativa nao encontrada.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface RelatorioOperacionalControllerOpenApi {

	@Operation(
			summary = "Exporta denuncias operacionais em CSV",
			description = """
					Gera um arquivo CSV com denuncias acessiveis pela organizacao informada.
					Para prefeitura, exige PREFEITURA vinculado e exporta denuncias da prefeitura e das secretarias filhas.
					Para secretaria, exige vinculo institucional ativo e exporta apenas denuncias atribuidas a secretaria.
					O arquivo nao inclui dados pessoais do autor da denuncia.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "CSV gerado com sucesso.", content = @Content(mediaType = "text/csv"))
	ResponseEntity<byte[]> exportarDenunciasCsv(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			@Parameter(description = "Cidade usada como filtro opcional.", in = ParameterIn.QUERY) String cidade,
			@Parameter(description = "Bairro usado como filtro opcional.", in = ParameterIn.QUERY) String bairro,
			@Parameter(description = "Status atual usado como filtro opcional.", in = ParameterIn.QUERY) StatusDenuncia status,
			@Parameter(description = "Identificador da categoria usado como filtro opcional.", in = ParameterIn.QUERY) Long categoriaId,
			@Parameter(hidden = true) Jwt jwt
	);
}
