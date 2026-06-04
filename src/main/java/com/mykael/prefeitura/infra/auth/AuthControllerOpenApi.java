package com.mykael.prefeitura.infra.auth;

import com.mykael.prefeitura.infra.auth.dto.AuthResponseDTO;
import com.mykael.prefeitura.infra.auth.dto.CadastroMoradorRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.LoginRequestDTO;
import com.mykael.prefeitura.infra.auth.dto.UsuarioLogadoResponseDTO;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Autenticacao", description = "Cadastro, login, renovacao de sessao e usuario autenticado.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "401", description = "Autenticacao obrigatoria ou credenciais invalidas.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "409", description = "Conflito de cadastro, como e-mail ou username ja existente.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes atingido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface AuthControllerOpenApi {

	@Operation(
			summary = "Cadastra morador",
			description = """
					Cria uma conta de morador e inicia a sessao usando cookies HttpOnly.
					Endpoint protegido por limite de requisicoes para reduzir cadastros abusivos.
					"""
	)
	@ApiResponse(responseCode = "200", description = "Morador cadastrado e sessao iniciada.")
	ResponseEntity<AuthResponseDTO> cadastrarMorador(
			@Valid
			@RequestBody(
					description = "Dados para autocadastro de morador.",
					required = true,
					content = @Content(schema = @Schema(implementation = CadastroMoradorRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.CADASTRO_MORADOR))
			)
			CadastroMoradorRequestDTO request
	);

	@Operation(
			summary = "Faz login",
			description = """
					Autentica usando e-mail ou username no campo identificador.
					Endpoint protegido por limite de requisicoes para reduzir tentativa de forca bruta.
					"""
	)
	@ApiResponse(responseCode = "200", description = "Login realizado e cookies de sessao emitidos.")
	ResponseEntity<AuthResponseDTO> login(
			@Valid
			@RequestBody(
					description = "Credenciais de login. O identificador aceita e-mail ou username.",
					required = true,
					content = @Content(schema = @Schema(implementation = LoginRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.LOGIN))
			)
			LoginRequestDTO request
	);

	@Operation(
			summary = "Renova access token",
			description = """
					Usa o refresh token em cookie HttpOnly para emitir um novo access token.
					Endpoint protegido por limite de requisicoes para reduzir abuso de renovacao.
					"""
	)
	@ApiResponse(responseCode = "200", description = "Access token renovado.")
	ResponseEntity<AuthResponseDTO> refresh(HttpServletRequest request);

	@Operation(
			summary = "Encerra sessao",
			description = "Revoga o refresh token atual e limpa os cookies de autenticacao."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "204", description = "Sessao encerrada.")
	ResponseEntity<Void> logout(HttpServletRequest request);

	@Operation(
			summary = "Consulta usuario logado",
			description = "Retorna os dados seguros do usuario autenticado."
	)
	@SecurityRequirement(name = "cookieAuth")
	@ApiResponse(responseCode = "200", description = "Usuario autenticado retornado.")
	ResponseEntity<UsuarioLogadoResponseDTO> me(Jwt jwt);
}
