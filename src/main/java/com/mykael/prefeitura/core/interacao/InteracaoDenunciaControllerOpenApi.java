package com.mykael.prefeitura.core.interacao;

import com.mykael.prefeitura.core.interacao.dto.InteracaoDenunciaResponseDTO;
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

@Tag(name = "Interacoes", description = "Confirmacoes e marcacoes de urgencia em denuncias.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Interacao invalida para a regra atual da denuncia.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Perfil sem permissao para interagir como morador.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia nao encontrada.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Interacao ja existe ou ja foi removida.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface InteracaoDenunciaControllerOpenApi {

	@Operation(summary = "Confirma problema", description = "Registra que o morador tambem viu ou confirma a existencia do problema.")
	@ApiResponse(responseCode = "200", description = "Confirmacao registrada com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<InteracaoDenunciaResponseDTO> confirmar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			Jwt jwt
	);

	@Operation(summary = "Remove confirmacao", description = "Remove a confirmacao do usuario autenticado na denuncia.")
	@ApiResponse(responseCode = "200", description = "Confirmacao removida com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<InteracaoDenunciaResponseDTO> removerConfirmacao(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			Jwt jwt
	);

	@Operation(summary = "Marca como urgente", description = "Registra que o morador considera o problema urgente.")
	@ApiResponse(responseCode = "200", description = "Urgencia registrada com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<InteracaoDenunciaResponseDTO> marcarUrgente(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			Jwt jwt
	);

	@Operation(summary = "Remove urgencia", description = "Remove a marcacao de urgencia do usuario autenticado na denuncia.")
	@ApiResponse(responseCode = "200", description = "Urgencia removida com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<InteracaoDenunciaResponseDTO> removerUrgencia(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			Jwt jwt
	);

	@Operation(summary = "Obtem status das interacoes do usuario", description = "Obtem se o usuario autenticado apoiou e/ou marcou urgencia na denuncia.")
	@ApiResponse(responseCode = "200", description = "Status obtido com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<InteracaoDenunciaResponseDTO> obterStatusInteracao(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			Jwt jwt
	);
}
