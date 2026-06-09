package com.mykael.prefeitura.infra.auditoria;

import com.mykael.prefeitura.infra.auditoria.dto.AuditoriaResponseDTO;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Tag(name = "Auditoria", description = "Consulta de acoes sensiveis registradas pelo backend.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Filtro ou paginacao invalida.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Acesso restrito ao ADMIN.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface AuditoriaControllerOpenApi {

	@Operation(
			summary = "Lista registros de auditoria",
			description = """
					Retorna acoes sensiveis registradas pelo sistema, como alteracoes de status,
					moderacao, transferencias, gestao de usuarios, organizacoes, categorias e vinculos.
					Acesso restrito ao ADMIN.
			"""
	)
	@ApiResponse(responseCode = "200", description = "Registros de auditoria retornados com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	Page<AuditoriaResponseDTO> listar(
			@Parameter(description = "Filtra por tipo de acao.") TipoAcaoAuditoria acao,
			@Parameter(description = "Filtra por tipo de alvo.") TipoAlvoAuditoria alvoTipo,
			@Parameter(description = "Filtra pelo identificador do alvo.") Long alvoId,
			@Parameter(description = "Filtra pelo identificador do usuario que executou a acao.") Long atorId,
			Pageable pageable
	);
}
