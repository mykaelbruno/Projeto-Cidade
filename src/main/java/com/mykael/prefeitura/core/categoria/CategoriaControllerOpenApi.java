package com.mykael.prefeitura.core.categoria;

import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaCreateRequestDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaResponseDTO;
import com.mykael.prefeitura.core.categoria.dto.CategoriaUpdateRequestDTO;
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

@Tag(name = "Categorias", description = "Categorias usadas para classificar denuncias urbanas.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Apenas ADMIN_APP nas operacoes de escrita.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Categoria ou organizacao responsavel nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface CategoriaControllerOpenApi {

	@Operation(summary = "Lista categorias", description = "Retorna as categorias cadastradas no sistema.")
	@ApiResponse(responseCode = "200", description = "Categorias retornadas.")
	List<CategoriaResponseDTO> listar();

	@Operation(summary = "Cria categoria", description = "Permite que ADMIN_APP crie uma nova categoria de denuncia.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Categoria criada.")
	ResponseEntity<CategoriaResponseDTO> criar(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = CategoriaCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.CATEGORIA)))
			CategoriaCreateRequestDTO request
	);

	@Operation(summary = "Atualiza categoria", description = "Permite que ADMIN_APP altere nome, descricao e organizacao responsavel padrao.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Categoria atualizada.")
	ResponseEntity<CategoriaResponseDTO> atualizar(
			@Parameter(description = "Identificador da categoria.", in = ParameterIn.PATH) Long categoriaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = CategoriaUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.CATEGORIA)))
			CategoriaUpdateRequestDTO request
	);

	@Operation(summary = "Ativa ou desativa categoria", description = "Permite que ADMIN_APP altere a situacao de uma categoria.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Ativacao da categoria alterada.")
	ResponseEntity<CategoriaResponseDTO> alterarAtiva(
			@Parameter(description = "Identificador da categoria.", in = ParameterIn.PATH) Long categoriaId,
			@RequestBody(content = @Content(schema = @Schema(implementation = AtivacaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.ATIVACAO)))
			AtivacaoRequestDTO request
	);
}
