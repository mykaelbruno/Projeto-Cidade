package com.mykael.prefeitura.core.comentario;

import com.mykael.prefeitura.core.comentario.dto.ComentarioCreateRequestDTO;
import com.mykael.prefeitura.core.comentario.dto.ComentarioResponseDTO;
import com.mykael.prefeitura.core.comentario.dto.RespostaOficialCreateRequestDTO;
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

@Tag(name = "Comentarios", description = "Comentarios de moradores e respostas oficiais em denuncias.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao ou sem vinculo institucional.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia ou organizacao nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito, como comentario repetido em janela curta.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes atingido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface ComentarioControllerOpenApi {

	@Operation(summary = "Comenta denuncia", description = "Cria um comentario comum em uma denuncia.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Comentario criado.")
	ResponseEntity<ComentarioResponseDTO> comentar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ComentarioCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.COMENTARIO)))
			ComentarioCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Responde oficialmente", description = "Cria uma resposta oficial em nome de uma prefeitura ou secretaria vinculada ao usuario.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Resposta oficial criada.")
	ResponseEntity<ComentarioResponseDTO> responderOficialmente(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = RespostaOficialCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.RESPOSTA_OFICIAL)))
			RespostaOficialCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Lista comentarios",
			description = "Lista comentarios e respostas oficiais visiveis. Comentarios removidos nao aparecem; autor de denuncia anonima permanece oculto."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Comentarios retornados.")
	Page<ComentarioResponseDTO> listar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Parameter(hidden = true) Jwt jwt,
			Pageable pageable
	);
}
