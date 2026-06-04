package com.mykael.prefeitura.core.anexo;

import com.mykael.prefeitura.core.anexo.dto.AnexoDenunciaResponseDTO;
import com.mykael.prefeitura.core.anexo.dto.AnexoDenunciaUploadRequestOpenApi;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Anexos da Denuncia", description = "Fotos e evidencias anexadas a uma denuncia urbana.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Arquivo invalido, regra de upload violada ou paginacao invalida.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class),
						examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Usuario nao autenticado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "403", description = "Usuario sem permissao para acessar ou alterar anexos desta denuncia.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "404", description = "Denuncia ou anexo nao encontrado.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes excedido.",
				content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface AnexoDenunciaControllerOpenApi {

	@Operation(
			summary = "Anexa foto na denuncia",
			description = """
					Permite que o morador autor da denuncia envie uma imagem como evidencia.
					Formatos aceitos no MVP: JPEG, PNG e WEBP.
					Endpoint protegido por limite de requisicoes e limite de tamanho de arquivo.
					""",
			requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
					required = true,
					content = @Content(
							mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
							schema = @Schema(implementation = AnexoDenunciaUploadRequestOpenApi.class)
					)
			)
	)
	@ApiResponse(responseCode = "201", description = "Anexo cadastrado com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<AnexoDenunciaResponseDTO> anexar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Parameter(description = "Arquivo de imagem enviado no campo multipart `arquivo`.") MultipartFile arquivo,
			Jwt jwt
	);

	@Operation(
			summary = "Lista anexos da denuncia",
			description = "Retorna anexos cadastrados respeitando a visibilidade da denuncia e ocultando autor quando a denuncia for anonima."
	)
	@ApiResponse(responseCode = "200", description = "Anexos retornados com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	Page<AnexoDenunciaResponseDTO> listar(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Parameter(hidden = true) Jwt jwt,
			Pageable pageable
	);

	@Operation(
			summary = "Baixa arquivo do anexo",
			description = "Retorna o arquivo de imagem apenas quando o usuario pode visualizar a denuncia."
	)
	@ApiResponse(responseCode = "200", description = "Arquivo retornado com sucesso.")
	@SecurityRequirement(name = "cookieAuth")
	ResponseEntity<Resource> baixarArquivo(
			@Parameter(description = "Identificador da denuncia.", in = ParameterIn.PATH) Long denunciaId,
			@Parameter(description = "Identificador do anexo.", in = ParameterIn.PATH) Long anexoId,
			@Parameter(hidden = true) Jwt jwt
	);
}
