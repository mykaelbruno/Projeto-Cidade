package com.mykael.prefeitura.core.sinalizacao;

import com.mykael.prefeitura.core.sinalizacao.dto.SinalizacaoDenunciaRequestDTO;
import com.mykael.prefeitura.core.sinalizacao.dto.SinalizacaoDenunciaResponseDTO;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Sinalizacoes de Denuncia", description = "Reports de denuncias enviados por usuarios para revisao da moderacao.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para moderacao.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia ou sinalizacao nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Sinalizacao duplicada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes atingido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface SinalizacaoDenunciaControllerOpenApi {

	@Operation(summary = "Sinaliza denuncia", description = "Permite que qualquer usuario autenticado reporte uma denuncia para moderacao.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Sinalizacao criada.")
	ResponseEntity<SinalizacaoDenunciaResponseDTO> sinalizar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SinalizacaoDenunciaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SINALIZACAO)))
			SinalizacaoDenunciaRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Sinaliza comentario", description = "Permite que qualquer usuario autenticado reporte um comentario para moderacao.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Sinalizacao de comentario criada.")
	ResponseEntity<SinalizacaoDenunciaResponseDTO> sinalizarComentario(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Parameter(description = "Identificador do comentario.", in = ParameterIn.PATH) Long comentarioId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SinalizacaoDenunciaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SINALIZACAO)))
			SinalizacaoDenunciaRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Lista sinalizacoes para moderacao", description = "Retorna reports de denuncia para ADMIN e MODERADOR. Por padrao lista apenas pendentes.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Sinalizacoes retornadas.")
	Page<SinalizacaoDenunciaResponseDTO> listarParaModeracao(
			@Parameter(description = "Status da sinalizacao.", in = ParameterIn.QUERY) StatusSinalizacaoDenuncia status,
			Pageable pageable
	);

	@Operation(summary = "Marca sinalizacao como analisada", description = "Registra que uma sinalizacao pendente ja foi revisada pela moderacao.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Sinalizacao marcada como analisada.")
	ResponseEntity<SinalizacaoDenunciaResponseDTO> marcarComoAnalisada(
			@Parameter(description = "Identificador da sinalizacao.", in = ParameterIn.PATH) Long sinalizacaoId,
			Jwt jwt
	);
}
