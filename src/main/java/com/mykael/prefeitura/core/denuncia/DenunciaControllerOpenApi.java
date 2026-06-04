package com.mykael.prefeitura.core.denuncia;

import com.mykael.prefeitura.core.denuncia.dto.DenunciaCreateRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaSemelhanteResponseDTO;
import com.mykael.prefeitura.core.denuncia.dto.FeedbackConclusaoRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.StatusDenunciaUpdateRequestDTO;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Denuncias", description = "Denuncias urbanas registradas pelos moradores.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida ou regra de negocio descumprida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para esta acao.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia, categoria ou organizacao nao encontrada.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito, como denuncia repetida em janela curta.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes atingido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface DenunciaControllerOpenApi {

	@Operation(summary = "Cria denuncia", description = "Permite que um morador autenticado registre uma denuncia urbana.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "201", description = "Denuncia criada.")
	ResponseEntity<DenunciaResponseDTO> criar(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = DenunciaCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.DENUNCIA)))
			DenunciaCreateRequestDTO request,
			Jwt jwt
	);

	@Operation(
			summary = "Busca denuncias semelhantes",
			description = """
					Permite que um morador autenticado consulte possiveis denuncias parecidas antes de criar uma nova.
					A consulta nao bloqueia a criacao: ela serve para o frontend sugerir apoio a uma denuncia ativa existente.
					Usa criterios conservadores de mesma categoria, mesma cidade/bairro, status ativo, proximidade por coordenada quando houver e texto/rua parecidos.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Possiveis denuncias semelhantes retornadas.")
	List<DenunciaSemelhanteResponseDTO> buscarSemelhantes(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = DenunciaCreateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.DENUNCIA_SEMELHANTE)))
			DenunciaCreateRequestDTO request
	);

	@Operation(
			summary = "Lista denuncias",
			description = """
					Retorna denuncias paginadas com filtros opcionais por cidade, bairro, status, categoria,
					organizacao responsavel e busca textual.
					Para moradores comuns, denuncias ARQUIVADAS ficam ocultas mesmo quando o filtro status=ARQUIVADO for enviado.
					Cada item pode trazer imagemCapaUrl quando houver ao menos um anexo de imagem.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Denuncias retornadas.")
	Page<DenunciaResponseDTO> listar(
			@Parameter(description = "Cidade da denuncia.", in = ParameterIn.QUERY) String cidade,
			@Parameter(description = "Bairro da denuncia.", in = ParameterIn.QUERY) String bairro,
			@Parameter(description = "Status atual da denuncia.", in = ParameterIn.QUERY) StatusDenuncia status,
			@Parameter(description = "Identificador da categoria.", in = ParameterIn.QUERY) Long categoriaId,
			@Parameter(description = "Identificador da organizacao responsavel.", in = ParameterIn.QUERY) Long organizacaoResponsavelId,
			@Parameter(description = "Busca textual em titulo, descricao, cidade, bairro, rua, ponto de referencia e categoria.", in = ParameterIn.QUERY) String termo,
			@Parameter(hidden = true) Jwt jwt,
			Pageable pageable
	);

	@Operation(
			summary = "Lista minhas denuncias",
			description = "Retorna apenas as denuncias criadas pelo morador autenticado, com filtros opcionais por cidade, bairro, status, categoria e busca textual."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Denuncias do morador retornadas.")
	Page<DenunciaResponseDTO> listarMinhas(
			@Parameter(description = "Cidade da denuncia.", in = ParameterIn.QUERY) String cidade,
			@Parameter(description = "Bairro da denuncia.", in = ParameterIn.QUERY) String bairro,
			@Parameter(description = "Status atual da denuncia.", in = ParameterIn.QUERY) StatusDenuncia status,
			@Parameter(description = "Identificador da categoria.", in = ParameterIn.QUERY) Long categoriaId,
			@Parameter(description = "Busca textual em titulo, descricao, cidade, bairro, rua, ponto de referencia e categoria.", in = ParameterIn.QUERY) String termo,
			Jwt jwt,
			Pageable pageable
	);

	@Operation(
			summary = "Detalha denuncia",
			description = """
					Retorna os dados publicos de uma denuncia especifica.
					Denuncia anonima nao expoe dados do autor. Denuncia ARQUIVADA so fica visivel para autor, moderacao,
					ADMIN_APP ou usuario institucional responsavel.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Denuncia retornada.")
	ResponseEntity<DenunciaResponseDTO> detalhar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long id,
			@Parameter(hidden = true) Jwt jwt
	);

	@Operation(
			summary = "Atualiza status da denuncia",
			description = """
					Permite que um usuario institucional altere o status de uma denuncia pela organizacao que representa.
					A alteracao gera evento destacado na timeline historica da denuncia.
					"""
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Status atualizado.")
	ResponseEntity<DenunciaResponseDTO> atualizarStatus(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long id,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = StatusDenunciaUpdateRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.STATUS_DENUNCIA)))
			StatusDenunciaUpdateRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Confirma conclusao", description = "Permite que o morador autor confirme que a denuncia marcada como concluida foi realmente resolvida.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Conclusao confirmada.")
	ResponseEntity<DenunciaResponseDTO> confirmarConclusao(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long id,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = FeedbackConclusaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.FEEDBACK_CONCLUSAO)))
			FeedbackConclusaoRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Contesta conclusao", description = "Permite que o morador autor conteste a conclusao. A denuncia volta para REABERTO.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Conclusao contestada e denuncia reaberta.")
	ResponseEntity<DenunciaResponseDTO> contestarConclusao(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long id,
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = FeedbackConclusaoRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.FEEDBACK_CONCLUSAO)))
			FeedbackConclusaoRequestDTO request,
			Jwt jwt
	);

	@Operation(summary = "Exclui denuncia pelo autor", description = "Permite que o morador autor ou um ADMIN_APP exclua (arquive) a sua propria denuncia.")
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "204", description = "Denuncia excluida com sucesso.")
	ResponseEntity<Void> deletar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long id,
			Jwt jwt
	);
}
