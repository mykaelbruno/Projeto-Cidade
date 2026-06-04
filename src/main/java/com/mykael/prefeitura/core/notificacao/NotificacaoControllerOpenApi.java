package com.mykael.prefeitura.core.notificacao;

import com.mykael.prefeitura.core.notificacao.dto.NotificacaoResponseDTO;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Notificacoes", description = "Notificacoes internas para usuarios autenticados.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Filtro ou paginacao invalida.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Notificacao nao encontrada para o usuario autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface NotificacaoControllerOpenApi {

	@Operation(summary = "Lista minhas notificacoes", description = "Retorna notificacoes do usuario autenticado, com filtro opcional para nao lidas.")
	@ApiResponse(responseCode = "200", description = "Notificacoes retornadas com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	Page<NotificacaoResponseDTO> listarMinhas(
			@Parameter(description = "Quando true, retorna apenas notificacoes ainda nao lidas.") boolean somenteNaoLidas,
			Jwt jwt,
			Pageable pageable
	);

	@Operation(summary = "Marca todas notificacoes como lidas", description = "Marca todas as notificacoes ainda nao lidas do usuario autenticado como lidas.")
	@ApiResponse(responseCode = "204", description = "Todas as notificacoes pendentes foram marcadas como lidas.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<Void> marcarTodasComoLidas(Jwt jwt);

	@Operation(summary = "Marca notificacao como lida", description = "Marca uma notificacao do usuario autenticado como lida.")
	@ApiResponse(responseCode = "200", description = "Notificacao marcada como lida com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<NotificacaoResponseDTO> marcarComoLida(
			@Parameter(description = "Identificador da notificacao.", in = ParameterIn.PATH) Long notificacaoId,
			Jwt jwt
	);
}
