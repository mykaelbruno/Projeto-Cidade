package com.mykael.prefeitura.core.interacao;

import com.mykael.prefeitura.core.interacao.dto.InteracaoDenunciaResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/denuncias/{denunciaId}")
public class InteracaoDenunciaController implements InteracaoDenunciaControllerOpenApi {

	private final InteracaoDenunciaService interacaoService;

	public InteracaoDenunciaController(InteracaoDenunciaService interacaoService) {
		this.interacaoService = interacaoService;
	}

	@Override
	@PostMapping("/confirmacoes")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<InteracaoDenunciaResponseDTO> confirmar(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(interacaoService.confirmar(denunciaId, usuarioId(jwt)));
	}

	@Override
	@DeleteMapping("/confirmacoes")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<InteracaoDenunciaResponseDTO> removerConfirmacao(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(interacaoService.removerConfirmacao(denunciaId, usuarioId(jwt)));
	}

	@Override
	@PostMapping("/urgencias")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<InteracaoDenunciaResponseDTO> marcarUrgente(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(interacaoService.marcarUrgente(denunciaId, usuarioId(jwt)));
	}

	@Override
	@DeleteMapping("/urgencias")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<InteracaoDenunciaResponseDTO> removerUrgencia(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(interacaoService.removerUrgencia(denunciaId, usuarioId(jwt)));
	}

	@Override
	@GetMapping("/interacoes/status")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<InteracaoDenunciaResponseDTO> obterStatusInteracao(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(interacaoService.obterStatusInteracao(denunciaId, usuarioId(jwt)));
	}

	private Long usuarioId(Jwt jwt) {
		return Long.valueOf(jwt.getSubject());
	}
}
