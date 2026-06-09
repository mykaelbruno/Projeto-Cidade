package com.mykael.prefeitura.core.usuario;

import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioCreateRequestDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioResponseDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioUpdateRequestDTO;
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
import java.util.List;
import org.springframework.http.ResponseEntity;

@Tag(name = "Usuarios", description = "Operacoes relacionadas aos moradores, servidores e administradores do sistema.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para gerenciar esta conta.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Usuario nao encontrado.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito de e-mail ou username.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface UsuarioControllerOpenApi {

	@Operation(summary = "Lista usuarios", description = "Retorna usuarios cadastrados com filtros opcionais. PREFEITURA enxerga apenas usuarios da propria cidade; ADMIN enxerga a base global.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Usuarios retornados.")
	List<UsuarioResponseDTO> listar(
			@Parameter(description = "Busca por nome, e-mail, username, cidade ou bairro.") String termo,
			@Parameter(description = "Filtra pelo perfil global do usuario.") PerfilUsuario perfilGlobal,
			@Parameter(description = "Filtra pela situacao ativa do usuario.") Boolean ativo
	);

	@Operation(summary = "Cria usuario", description = "Permite criar usuarios globais do sistema, incluindo ADMIN, MORADOR e MODERADOR. PREFEITURA fica limitada a usuarios da propria cidade.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Usuario criado.")
	ResponseEntity<UsuarioResponseDTO> criar(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = UsuarioCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.USUARIO)))
			UsuarioCreateRequestDTO request
	);

	@Operation(summary = "Atualiza usuario", description = "Atualiza dados cadastrais e perfil global de um usuario. PREFEITURA fica limitada a usuarios da propria cidade.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Usuario atualizado.")
	ResponseEntity<UsuarioResponseDTO> atualizar(
			@Parameter(description = "Identificador do usuario.", in = ParameterIn.PATH) Long usuarioId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = UsuarioUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.USUARIO_UPDATE)))
			UsuarioUpdateRequestDTO request
	);

	@Operation(summary = "Ativa ou desativa usuario", description = "Altera a situacao de um usuario dentro do escopo permitido. O ultimo ADMIN ativo nao pode ser desativado.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Ativacao do usuario alterada.")
	ResponseEntity<UsuarioResponseDTO> alterarAtivo(
			@Parameter(description = "Identificador do usuario.", in = ParameterIn.PATH) Long usuarioId,
			@RequestBody(content = @Content(schema = @Schema(implementation = AtivacaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.ATIVACAO)))
			AtivacaoRequestDTO request
	);
}
