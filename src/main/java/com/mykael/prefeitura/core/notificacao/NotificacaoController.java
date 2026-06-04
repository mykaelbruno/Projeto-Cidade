package com.mykael.prefeitura.core.notificacao;

import com.mykael.prefeitura.core.notificacao.dto.NotificacaoResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController implements NotificacaoControllerOpenApi {

	private final NotificacaoService notificacaoService;

	public NotificacaoController(NotificacaoService notificacaoService) {
		this.notificacaoService = notificacaoService;
	}

	@Override
	@GetMapping("/minhas")
	@PreAuthorize("isAuthenticated()")
	public Page<NotificacaoResponseDTO> listarMinhas(
			@RequestParam(required = false, defaultValue = "false") boolean somenteNaoLidas,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return notificacaoService.listarMinhas(Long.valueOf(jwt.getSubject()), somenteNaoLidas, pageable);
	}

	@Override
	@PatchMapping("/leitura")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<Void> marcarTodasComoLidas(
			@AuthenticationPrincipal Jwt jwt
	) {
		notificacaoService.marcarTodasComoLidas(Long.valueOf(jwt.getSubject()));
		return ResponseEntity.noContent().build();
	}

	@Override
	@PatchMapping("/{notificacaoId}/leitura")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<NotificacaoResponseDTO> marcarComoLida(
			@PathVariable Long notificacaoId,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(notificacaoService.marcarComoLida(notificacaoId, Long.valueOf(jwt.getSubject())));
	}
}
