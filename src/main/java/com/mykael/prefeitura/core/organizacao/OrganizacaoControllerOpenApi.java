package com.mykael.prefeitura.core.organizacao;

import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.OrganizacaoResponseDTO;
import com.mykael.prefeitura.core.organizacao.dto.OrganizacaoUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.PrefeituraCreateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.SecretariaCreateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.SecretariaCategoriasUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.UsuarioInstitucionalCreateRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoResponseDTO;
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

@Tag(name = "Organizacoes", description = "Prefeituras e secretarias vinculadas ao sistema.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida ou organizacao fora do escopo permitido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para a organizacao.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Organizacao nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito de cadastro.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface OrganizacaoControllerOpenApi {

	@Operation(summary = "Lista organizacoes", description = "Retorna prefeituras e secretarias cadastradas.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Organizacoes retornadas.")
	List<OrganizacaoResponseDTO> listar();

	@Operation(summary = "Lista prefeituras ativas", description = "Retorna lista de prefeituras ativas para auto-preenchimento no cadastro de moradores.")
	@ApiResponse(responseCode = "200", description = "Prefeituras retornadas.")
	ResponseEntity<List<OrganizacaoResponseDTO>> listarPrefeiturasAtivas();

	@Operation(summary = "Cria prefeitura", description = "Permite que ADMIN cadastre uma prefeitura.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Prefeitura criada.")
	ResponseEntity<OrganizacaoResponseDTO> criarPrefeitura(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = PrefeituraCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.PREFEITURA)))
			PrefeituraCreateRequestDTO request
	);

	@Operation(summary = "Cria secretaria", description = "Permite que ADMIN ou PREFEITURA crie uma secretaria vinculada a uma prefeitura.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Secretaria criada.")
	ResponseEntity<OrganizacaoResponseDTO> criarSecretaria(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SecretariaCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SECRETARIA)))
			SecretariaCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Cria usuario institucional", description = "Cria usuario e vinculo institucional. Prefeitura aceita PREFEITURA; secretaria aceita SECRETARIA ou SECRETARIA.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Usuario institucional e vinculo criados.")
	ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> criarUsuarioInstitucional(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = UsuarioInstitucionalCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.USUARIO_INSTITUCIONAL)))
			UsuarioInstitucionalCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Atualiza organizacao", description = "Atualiza dados cadastrais de prefeitura ou secretaria, sem alterar tipo nem hierarquia.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Organizacao atualizada.")
	ResponseEntity<OrganizacaoResponseDTO> atualizar(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = OrganizacaoUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.ORGANIZACAO_UPDATE)))
			OrganizacaoUpdateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Atualiza categorias da secretaria", description = "Define quais categorias usam esta secretaria como responsavel padrao. Categorias removidas voltam para distribuicao manual.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Categorias da secretaria atualizadas.")
	ResponseEntity<OrganizacaoResponseDTO> atualizarCategoriasSecretaria(
			@Parameter(description = "Identificador da secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SecretariaCategoriasUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SECRETARIA_CATEGORIAS_UPDATE)))
			SecretariaCategoriasUpdateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Ativa ou desativa organizacao", description = "Altera a situacao de uma prefeitura ou secretaria.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Ativacao da organizacao alterada.")
	ResponseEntity<OrganizacaoResponseDTO> alterarAtiva(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			@RequestBody(content = @Content(schema = @Schema(implementation = AtivacaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.ATIVACAO)))
			AtivacaoRequestDTO request,
			Jwt jwt
	);
}
