package com.mykael.prefeitura.core.moderacao;

import com.mykael.prefeitura.core.moderacao.dto.ModeracaoRequestDTO;
import com.mykael.prefeitura.core.moderacao.dto.ModeracaoResponseDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/moderacoes")
public class ModeracaoController implements ModeracaoControllerOpenApi {

	private final ModeracaoService moderacaoService;

	public ModeracaoController(ModeracaoService moderacaoService) {
		this.moderacaoService = moderacaoService;
	}

	@Override
	@PostMapping("/denuncias/{denunciaId}/arquivamento")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public ResponseEntity<ModeracaoResponseDTO> arquivarDenuncia(
			@PathVariable Long denunciaId,
			@Valid @RequestBody ModeracaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(moderacaoService.arquivarDenuncia(
				denunciaId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@PostMapping("/comentarios/{comentarioId}/remocao")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public ResponseEntity<ModeracaoResponseDTO> removerComentario(
			@PathVariable Long comentarioId,
			@Valid @RequestBody ModeracaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(moderacaoService.removerComentario(
				comentarioId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@PostMapping("/usuarios/{usuarioId}/advertencia")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public ResponseEntity<ModeracaoResponseDTO> advertirUsuario(
			@PathVariable Long usuarioId,
			@Valid @RequestBody ModeracaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(moderacaoService.advertirUsuario(
				usuarioId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@PostMapping("/usuarios/{usuarioId}/suspensao")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public ResponseEntity<ModeracaoResponseDTO> suspenderUsuario(
			@PathVariable Long usuarioId,
			@Valid @RequestBody ModeracaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(moderacaoService.suspenderUsuario(
				usuarioId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@PostMapping("/usuarios/{usuarioId}/reativacao")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public ResponseEntity<ModeracaoResponseDTO> reativarUsuario(
			@PathVariable Long usuarioId,
			@Valid @RequestBody ModeracaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(moderacaoService.reativarUsuario(
				usuarioId,
				Long.valueOf(jwt.getSubject()),
				request
		));
	}

	@Override
	@GetMapping("/usuarios/{usuarioId}/historico")
	@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
	public Page<ModeracaoResponseDTO> listarHistoricoUsuario(
			@PathVariable Long usuarioId,
			@PageableDefault(size = 20, sort = "criadoEm") Pageable pageable
	) {
		return moderacaoService.listarHistoricoUsuario(usuarioId, pageable);
	}
}
