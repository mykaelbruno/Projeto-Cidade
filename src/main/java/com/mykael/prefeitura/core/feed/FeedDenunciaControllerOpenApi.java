package com.mykael.prefeitura.core.feed;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.feed.dto.FeedDenunciaResponseDTO;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Feed de Denuncias", description = "Timeline geral de denuncias com modos recentes, em alta e misto.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Filtro ou paginacao invalida.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface FeedDenunciaControllerOpenApi {

	@Operation(
			summary = "Lista feed geral de denuncias",
			description = """
					Retorna denuncias para a tela inicial do app.
					O modo MISTO combina relevancia e recencia, com limite para o peso da relevancia,
					evitando que denuncias muito engajadas fiquem sempre no topo.
					O filtro termo busca em titulo, descricao, cidade, bairro, rua, ponto de referencia e categoria.
					Cada denuncia pode trazer imagemCapaUrl quando houver anexo de imagem.
					Denuncias ARQUIVADAS nao aparecem para moradores comuns; moderacao e equipe institucional podem consultar quando aplicavel.
			"""
	)
	@ApiResponse(responseCode = "200", description = "Feed retornado com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	Page<FeedDenunciaResponseDTO> listar(
			@Parameter(description = "Filtra por cidade exata, ignorando maiusculas e minusculas.") String cidade,
			@Parameter(description = "Filtra por bairro exato, ignorando maiusculas e minusculas.") String bairro,
			@Parameter(description = "Filtra pelo status atual da denuncia.") StatusDenuncia status,
			@Parameter(description = "Filtra pela categoria da denuncia.") Long categoriaId,
			@Parameter(description = "Define a ordenacao do feed. Padrao: MISTO.") ModoOrdenacaoFeed modo,
			@Parameter(description = "Indica se deve excluir denuncias do proprio usuario.") Boolean excluirProprias,
			@Parameter(description = "Busca textual em titulo, descricao, cidade, bairro, rua, ponto de referencia e categoria.") String termo,
			@Parameter(hidden = true) Jwt jwt,
			@Parameter(description = "Paginacao do resultado. O modo escolhido controla a ordenacao principal.") Pageable pageable
	);
}
