package com.mykael.prefeitura.infra.error;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.HashMap;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResponseStatusException.class)
	ResponseEntity<ErroApiResponse> tratarResponseStatusException(ResponseStatusException exception, HttpServletRequest request) {
		HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
		var response = new ErroApiResponse(
				Instant.now(),
				status.value(),
				status.name(),
				exception.getReason(),
				request.getRequestURI()
		);
		return ResponseEntity.status(status).body(response);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ErroApiResponse> tratarErroValidacao(MethodArgumentNotValidException exception, HttpServletRequest request) {
		var campos = new HashMap<String, String>();
		exception.getBindingResult().getFieldErrors()
				.forEach(error -> campos.put(error.getField(), error.getDefaultMessage()));

		var response = new ErroApiResponse(
				Instant.now(),
				HttpStatus.BAD_REQUEST.value(),
				"VALIDATION_ERROR",
				campos.toString(),
				request.getRequestURI()
		);
		return ResponseEntity.badRequest().body(response);
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	ResponseEntity<ErroApiResponse> tratarArquivoMuitoGrande(MaxUploadSizeExceededException exception, HttpServletRequest request) {
		var status = HttpStatus.BAD_REQUEST;
		var response = new ErroApiResponse(
				Instant.now(),
				status.value(),
				"ARQUIVO_MUITO_GRANDE",
				"Arquivo ultrapassa o tamanho maximo permitido.",
				request.getRequestURI()
		);
		return ResponseEntity.status(status).body(response);
	}

	@ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
	ResponseEntity<ErroApiResponse> tratarAcessoNegado(Exception exception, HttpServletRequest request) {
		var status = HttpStatus.FORBIDDEN;
		var response = new ErroApiResponse(
				Instant.now(),
				status.value(),
				"ACESSO_NEGADO",
				"Usuario sem permissao para esta acao.",
				request.getRequestURI()
		);
		return ResponseEntity.status(status).body(response);
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<ErroApiResponse> tratarErroInesperado(Exception exception, HttpServletRequest request) {
		var status = HttpStatus.INTERNAL_SERVER_ERROR;
		var response = new ErroApiResponse(
				Instant.now(),
				status.value(),
				"ERRO_INTERNO",
				"Nao foi possivel processar a solicitacao.",
				request.getRequestURI()
		);
		return ResponseEntity.status(status).body(response);
	}
}
