package com.mykael.prefeitura.core.vinculo;

import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoResponseDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoCreateRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoTransferenciaSecretariaRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoUpdateRequestDTO;
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
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Vinculos", description = "Vinculos entre usuarios, organizacoes e papeis institucionais.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para o vinculo ou organizacao.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Vinculo ou organizacao nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface VinculoUsuarioOrganizacaoControllerOpenApi {

	@Operation(summary = "Lista vinculos", description = "Retorna os vinculos entre usuarios e organizacoes.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Vinculos retornados.")
	List<VinculoUsuarioOrganizacaoResponseDTO> listar();

	@Operation(summary = "Cria vinculo para usuario existente", description = "Permite que ADMIN ou PREFEITURA vincule um usuario MORADOR ativo a uma organizacao ativa. O usuario nao pode possuir outro vinculo institucional ativo.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Vinculo criado.")
	ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> criar(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = VinculoUsuarioOrganizacaoCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.VINCULO_CREATE)))
			VinculoUsuarioOrganizacaoCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Lista vinculos da organizacao", description = "Retorna os vinculos ativos de uma prefeitura ou secretaria.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Vinculos da organizacao retornados.")
	List<VinculoUsuarioOrganizacaoResponseDTO> listarPorOrganizacao(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			Jwt jwt
	);

	@Operation(summary = "Atualiza vinculo", description = "Altera papel institucional e situacao ativa de um vinculo.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Vinculo atualizado.")
	ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> atualizar(
			@Parameter(description = "Identificador do vinculo.", in = ParameterIn.PATH) Long vinculoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = VinculoUsuarioOrganizacaoUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.VINCULO_UPDATE)))
			VinculoUsuarioOrganizacaoUpdateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Transfere vinculo para outra secretaria", description = "Permite que ADMIN ou PREFEITURA mova o vinculo institucional existente de uma secretaria para outra secretaria da mesma prefeitura, sem criar novo login.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Vinculo transferido para a secretaria de destino.")
	ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> transferirSecretaria(
			@Parameter(description = "Identificador do vinculo.", in = ParameterIn.PATH) Long vinculoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = VinculoTransferenciaSecretariaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.VINCULO_TRANSFERENCIA_SECRETARIA)))
			VinculoTransferenciaSecretariaRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Lista meus vinculos", description = "Retorna os vinculos ativos do usuario logado.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "VÃ­nculos do usuÃ¡rio retornados com sucesso.")
	List<VinculoUsuarioOrganizacaoResponseDTO> listarMeusVinculos(Jwt jwt);
}
