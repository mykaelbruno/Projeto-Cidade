package com.mykael.prefeitura.core.operacional;

import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.operacional.dto.AlterarResponsavelDenunciaRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaAprovacaoRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaCreateRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaRecusaRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaResponseDTO;
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

@Tag(name = "Operacional", description = "Rotina de atendimento de denuncias por prefeitura e secretarias.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida ou transferencia fora das regras.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem vinculo ou papel institucional exigido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia, organizacao ou solicitacao nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito, como solicitacao pendente ja existente.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface OperacionalDenunciaControllerOpenApi {

	@Operation(
			summary = "Lista denuncias acessiveis pela organizacao",
			description = """
			Quando a organizacao e prefeitura, retorna denuncias da prefeitura e de todas as suas secretarias.
			Quando a organizacao e secretaria, retorna apenas denuncias atribuidas a essa secretaria.
			Permite filtrar por cidade, bairro, status, categoria e termo textual para apoiar os paineis do frontend.
			"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Denuncias acessiveis retornadas.")
	Page<DenunciaResponseDTO> listarDenunciasDaOrganizacao(
			@Parameter(description = "Identificador da prefeitura ou secretaria.", in = ParameterIn.PATH) Long organizacaoId,
			@Parameter(description = "Cidade da denuncia.", in = ParameterIn.QUERY) String cidade,
			@Parameter(description = "Bairro da denuncia.", in = ParameterIn.QUERY) String bairro,
			@Parameter(description = "Status atual da denuncia.", in = ParameterIn.QUERY) StatusDenuncia status,
			@Parameter(description = "Identificador da categoria.", in = ParameterIn.QUERY) Long categoriaId,
			@Parameter(description = "Busca textual por titulo, descricao, cidade, bairro, rua, referencia ou categoria.", in = ParameterIn.QUERY) String termo,
			Jwt jwt,
			Pageable pageable
	);

	@Operation(
			summary = "Solicita transferencia de denuncia",
			description = "Permite que uma secretaria solicite para a prefeitura a transferencia da denuncia para outra secretaria."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Solicitacao criada.")
	ResponseEntity<SolicitacaoTransferenciaResponseDTO> solicitarTransferencia(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SolicitacaoTransferenciaCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SOLICITAR_TRANSFERENCIA)))
			SolicitacaoTransferenciaCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Lista solicitacoes de transferencia da prefeitura",
			description = "Retorna solicitacoes de transferencia para avaliacao da prefeitura. Por padrao, lista pendentes."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Solicitacoes retornadas.")
	Page<SolicitacaoTransferenciaResponseDTO> listarSolicitacoesDaPrefeitura(
			@Parameter(description = "Identificador da prefeitura.", in = ParameterIn.PATH) Long prefeituraId,
			@Parameter(description = "Status da solicitacao. Padrao: PENDENTE.", in = ParameterIn.QUERY) StatusSolicitacaoTransferencia status,
			Jwt jwt,
			Pageable pageable
	);

	@Operation(
			summary = "Aprova transferencia",
			description = "Permite que a prefeitura aprove a transferencia e defina a secretaria responsavel final."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Transferencia aprovada.")
	ResponseEntity<SolicitacaoTransferenciaResponseDTO> aprovarTransferencia(
			@Parameter(description = "Identificador da solicitacao.", in = ParameterIn.PATH) Long solicitacaoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SolicitacaoTransferenciaAprovacaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.APROVAR_TRANSFERENCIA)))
			SolicitacaoTransferenciaAprovacaoRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Recusa transferencia", description = "Permite que a prefeitura recuse uma solicitacao de transferencia.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Transferencia recusada.")
	ResponseEntity<SolicitacaoTransferenciaResponseDTO> recusarTransferencia(
			@Parameter(description = "Identificador da solicitacao.", in = ParameterIn.PATH) Long solicitacaoId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SolicitacaoTransferenciaRecusaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.RECUSAR_TRANSFERENCIA)))
			SolicitacaoTransferenciaRecusaRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Altera responsavel da denuncia",
			description = "Permite que a prefeitura altere manualmente a organizacao responsavel pela denuncia."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Responsavel alterado.")
	ResponseEntity<DenunciaResponseDTO> alterarResponsavelPelaPrefeitura(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = AlterarResponsavelDenunciaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.ALTERAR_RESPONSAVEL)))
			AlterarResponsavelDenunciaRequestDTO request,
			Jwt jwt
	);
}
