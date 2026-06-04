package com.mykael.prefeitura.core.painel;

import com.mykael.prefeitura.core.painel.dto.PainelModeracaoResumoDTO;
import com.mykael.prefeitura.core.painel.dto.PainelOperacionalResumoDTO;
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
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Paineis", description = "Resumos numericos para operacao da prefeitura, secretarias e moderacao.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Parametro invalido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para consultar este painel.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Organizacao nao encontrada.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface PainelControllerOpenApi {

	@Operation(
			summary = "Resumo operacional da organizacao",
			description = """
					Retorna contadores e metricas para montar um painel de atendimento.
					Para prefeitura, considera denuncias da prefeitura e de todas as secretarias filhas.
					Para secretaria, considera apenas denuncias atribuidas a ela.
					Inclui taxas percentuais, tempo medio ate confirmacao do morador e rankings de bairros/categorias.
			"""
	)
	@ApiResponse(responseCode = "200", description = "Resumo operacional retornado com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	PainelOperacionalResumoDTO gerarResumoOperacional(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			Jwt jwt
	);

	@Operation(
			summary = "Resumo de moderacao",
			description = "Retorna contadores globais para acompanhamento de sinalizacoes, moderacao de conteudo e moderacao de usuarios."
	)
	@ApiResponse(responseCode = "200", description = "Resumo de moderacao retornado com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	PainelModeracaoResumoDTO gerarResumoModeracao();
}
