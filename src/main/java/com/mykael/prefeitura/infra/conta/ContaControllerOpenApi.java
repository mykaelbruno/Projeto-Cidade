package com.mykael.prefeitura.infra.conta;

import com.mykael.prefeitura.infra.conta.dto.ConfirmarVerificacaoEmailRequestDTO;
import com.mykael.prefeitura.infra.conta.dto.MensagemResponseDTO;
import com.mykael.prefeitura.infra.conta.dto.RedefinirSenhaRequestDTO;
import com.mykael.prefeitura.infra.conta.dto.SolicitarRecuperacaoSenhaRequestDTO;
import com.mykael.prefeitura.infra.conta.dto.SolicitarVerificacaoEmailRequestDTO;
import com.mykael.prefeitura.infra.doc.OpenApiExemplos;
import com.mykael.prefeitura.infra.error.ErroApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;

@Tag(name = "Conta", description = "Verificacao de e-mail e recuperacao de senha.")
@ApiResponses({
		@ApiResponse(responseCode = "400", description = "Token invalido, expirado ou requisicao invalida.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class), examples = @ExampleObject(value = OpenApiExemplos.ERRO_VALIDACAO))),
		@ApiResponse(responseCode = "429", description = "Limite de requisicoes atingido.", content = @Content(schema = @Schema(implementation = ErroApiResponse.class)))
})
public interface ContaControllerOpenApi {

	@Operation(
			summary = "Solicita verificacao de e-mail",
			description = """
					Gera um token de verificacao para uma conta ativa ainda nao verificada.
					A resposta e neutra para nao revelar se o e-mail existe ou nao.
					"""
	)
	@ApiResponse(responseCode = "200", description = "Solicitacao recebida com resposta neutra.")
	ResponseEntity<MensagemResponseDTO> solicitarVerificacaoEmail(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SolicitarVerificacaoEmailRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SOLICITAR_EMAIL)))
			SolicitarVerificacaoEmailRequestDTO request
	);

	@Operation(
			summary = "Confirma verificacao de e-mail",
			description = "Valida um token de verificacao de e-mail, marca a conta como verificada e inutiliza o token."
	)
	@ApiResponse(responseCode = "200", description = "E-mail verificado.")
	ResponseEntity<MensagemResponseDTO> confirmarEmail(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = ConfirmarVerificacaoEmailRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.CONFIRMAR_TOKEN)))
			ConfirmarVerificacaoEmailRequestDTO request
	);

	@Operation(
			summary = "Solicita recuperacao de senha",
			description = """
					Gera um token de recuperacao para uma conta ativa.
					A resposta e neutra para nao revelar se o e-mail existe ou nao.
					"""
	)
	@ApiResponse(responseCode = "200", description = "Solicitacao recebida com resposta neutra.")
	ResponseEntity<MensagemResponseDTO> solicitarRecuperacaoSenha(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = SolicitarRecuperacaoSenhaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.SOLICITAR_EMAIL)))
			SolicitarRecuperacaoSenhaRequestDTO request
	);

	@Operation(
			summary = "Redefine senha",
			description = "Valida um token de recuperacao, troca a senha do usuario e inutiliza o token."
	)
	@ApiResponse(responseCode = "200", description = "Senha redefinida.")
	ResponseEntity<MensagemResponseDTO> redefinirSenha(
			@Valid
			@RequestBody(content = @Content(schema = @Schema(implementation = RedefinirSenhaRequestDTO.class), examples = @ExampleObject(value = OpenApiExemplos.REDEFINIR_SENHA)))
			RedefinirSenhaRequestDTO request
	);
}
