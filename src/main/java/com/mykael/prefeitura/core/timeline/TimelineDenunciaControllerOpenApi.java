package com.mykael.prefeitura.core.timeline;

import com.mykael.prefeitura.core.timeline.dto.TimelineDenunciaResponseDTO;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Timeline da Denuncia", description = "Historico auditavel de eventos importantes de uma denuncia.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Parametro ou paginacao invalida.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para ver a timeline desta denuncia.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia nao encontrada.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface TimelineDenunciaControllerOpenApi {

	@Operation(
			summary = "Lista timeline da denuncia",
			description = "Retorna eventos historicos respeitando visibilidade da denuncia e ocultacao de autor anonimo."
	)
	@ApiResponse(responseCode = "200", description = "Timeline retornada com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	Page<TimelineDenunciaResponseDTO> listar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Parameter(hidden = true) Jwt jwt,
			Pageable pageable
	);
}
