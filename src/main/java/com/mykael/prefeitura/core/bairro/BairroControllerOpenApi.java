package com.mykael.prefeitura.core.bairro;

import com.mykael.prefeitura.core.bairro.dto.BairroCreateRequestDTO;
import com.mykael.prefeitura.core.bairro.dto.BairroResponseDTO;
import com.mykael.prefeitura.core.bairro.dto.BairroUpdateRequestDTO;
import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Bairros", description = "Bairros controlados por prefeitura para cadastro, filtros e denuncias.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria para gestao.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao sobre a prefeitura.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Prefeitura ou bairro nao encontrado.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Bairro duplicado na prefeitura.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface BairroControllerOpenApi {

	@Operation(summary = "Lista bairros ativos", description = "Lista publica de bairros ativos de uma prefeitura, usada em cadastro, filtros e nova denuncia.")
	@ApiResponse(responseCode = "200", description = "Bairros ativos retornados.")
	List<BairroResponseDTO> listarAtivos(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId
	);

	@Operation(summary = "Lista bairros da prefeitura", description = "Permite que ADMIN_APP ou ADMIN_PREFEITURA liste bairros ativos e inativos da prefeitura.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Bairros retornados.")
	List<BairroResponseDTO> listarParaGestao(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId,
			Jwt jwt
	);

	@Operation(summary = "Cria bairro", description = "Permite que ADMIN_APP ou ADMIN_PREFEITURA cadastre um bairro da cidade. O centroide geografico e opcional e pode ser usado pelo frontend para centralizar mapas.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Bairro criado.")
	ResponseEntity<BairroResponseDTO> criar(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = BairroCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.BAIRRO)))
			BairroCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Atualiza bairro", description = "Permite que ADMIN_APP ou ADMIN_PREFEITURA altere o nome e o centroide opcional de um bairro.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Bairro atualizado.")
	ResponseEntity<BairroResponseDTO> atualizar(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId,
			@Parameter(description = "Identificador do bairro.", in = ParameterIn.PATH) Long bairroId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = BairroUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.BAIRRO)))
			BairroUpdateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Ativa ou desativa bairro", description = "Permite que ADMIN_APP ou ADMIN_PREFEITURA controle se o bairro aparece nas listas de cadastro e denuncia.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Ativacao do bairro alterada.")
	ResponseEntity<BairroResponseDTO> alterarAtivo(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId,
			@Parameter(description = "Identificador do bairro.", in = ParameterIn.PATH) Long bairroId,
			@RequestBody(content = @Content(schema = @Schema(implementation = AtivacaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.ATIVACAO)))
			AtivacaoRequestDTO request,
			Jwt jwt
	);
}
