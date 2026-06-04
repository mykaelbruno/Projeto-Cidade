package com.mykael.prefeitura.core.moderacao;

import com.mykael.prefeitura.core.moderacao.dto.ModeracaoRequestDTO;
import com.mykael.prefeitura.core.moderacao.dto.ModeracaoResponseDTO;
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

@Tag(name = "Moderacao", description = "Acoes de moderacao para manter denuncias, comentarios e usuarios adequados.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Apenas ADMIN_APP ou MODERADOR.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia, comentario ou usuario nao encontrado.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito de estado, como usuario ja suspenso ou comentario ja removido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface ModeracaoControllerOpenApi {

	@Operation(
			summary = "Arquiva denuncia por moderacao",
			description = """
					Permite que ADMIN_APP ou MODERADOR arquive uma denuncia com motivo obrigatorio.
					A acao altera o status para ARQUIVADO e registra evento destacado na timeline.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Denuncia arquivada.")
	ResponseEntity<ModeracaoResponseDTO> arquivarDenuncia(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ModeracaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.MODERACAO)))
			ModeracaoRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Remove comentario por moderacao",
			description = """
					Permite que ADMIN_APP ou MODERADOR remova logicamente um comentario com motivo obrigatorio.
					A acao mantem auditoria, reduz o contador de comentarios da denuncia e registra evento na timeline.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Comentario removido.")
	ResponseEntity<ModeracaoResponseDTO> removerComentario(
			@Parameter(description = "Identificador do comentario.", in = ParameterIn.PATH) Long comentarioId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ModeracaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.MODERACAO)))
			ModeracaoRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Adverte usuario",
			description = """
					Permite que ADMIN_APP ou MODERADOR registre uma advertencia no historico do usuario.
					A advertencia nao suspende a conta. MODERADOR so pode advertir MORADOR; contas administrativas ou moderadores exigem ADMIN_APP.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Advertencia registrada.")
	ResponseEntity<ModeracaoResponseDTO> advertirUsuario(
			@Parameter(description = "Identificador do usuario alvo.", in = ParameterIn.PATH) Long usuarioId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ModeracaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.MODERACAO_USUARIO)))
			ModeracaoRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Suspende usuario",
			description = """
					Permite que ADMIN_APP ou MODERADOR suspenda uma conta, marcando o usuario como inativo.
					MODERADOR so pode suspender MORADOR. O ultimo ADMIN_APP ativo nao pode ser suspenso.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Usuario suspenso.")
	ResponseEntity<ModeracaoResponseDTO> suspenderUsuario(
			@Parameter(description = "Identificador do usuario alvo.", in = ParameterIn.PATH) Long usuarioId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ModeracaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.MODERACAO_USUARIO)))
			ModeracaoRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Reativa usuario",
			description = """
					Permite que ADMIN_APP ou MODERADOR reative uma conta suspensa.
					MODERADOR so pode reativar MORADOR; contas administrativas ou moderadores exigem ADMIN_APP.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Usuario reativado.")
	ResponseEntity<ModeracaoResponseDTO> reativarUsuario(
			@Parameter(description = "Identificador do usuario alvo.", in = ParameterIn.PATH) Long usuarioId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ModeracaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.MODERACAO_USUARIO)))
			ModeracaoRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Lista historico de moderacao do usuario",
			description = "Retorna advertencias, suspensoes e reativacoes registradas para o usuario informado."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Historico de moderacao retornado.")
	Page<ModeracaoResponseDTO> listarHistoricoUsuario(
			@Parameter(description = "Identificador do usuario alvo.", in = ParameterIn.PATH) Long usuarioId,
			Pageable pageable
	);
}
