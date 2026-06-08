package com.mykael.prefeitura.infra.auditoria;

import com.mykael.prefeitura.infra.auditoria.dto.AuditoriaResponseDTO;
import com.mykael.prefeitura.infra.security.AutorizacaoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditorias")
public class AuditoriaController implements AuditoriaControllerOpenApi {

	private final AuditoriaService auditoriaService;
	private final AutorizacaoService autorizacaoService;

	public AuditoriaController(AuditoriaService auditoriaService, AutorizacaoService autorizacaoService) {
		this.auditoriaService = auditoriaService;
		this.autorizacaoService = autorizacaoService;
	}

	@Override
	@GetMapping
	@PreAuthorize("hasRole('ADMIN_APP')")
	public Page<AuditoriaResponseDTO> listar(
			@RequestParam(required = false) TipoAcaoAuditoria acao,
			@RequestParam(required = false) TipoAlvoAuditoria alvoTipo,
			@RequestParam(required = false) Long alvoId,
			@RequestParam(required = false) Long atorId,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return auditoriaService.listar(acao, alvoTipo, alvoId, atorId, pageable);
	}

	@GetMapping("/prefeituras/{prefeituraId}")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public Page<AuditoriaResponseDTO> listarDaPrefeitura(
			@PathVariable Long prefeituraId,
			@RequestParam(required = false) TipoAcaoAuditoria acao,
			@RequestParam(required = false) TipoAlvoAuditoria alvoTipo,
			@RequestParam(required = false) Long alvoId,
			@RequestParam(required = false) Long atorId,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		autorizacaoService.exigirAdminPrefeituraOuAdminApp(
				Long.valueOf(jwt.getSubject()),
				prefeituraId,
				isAdminApp()
		);
		return auditoriaService.listarDaPrefeitura(prefeituraId, acao, alvoTipo, alvoId, atorId, pageable);
	}

	private boolean isAdminApp() {
		return SecurityContextHolder.getContext().getAuthentication() != null
				&& SecurityContextHolder.getContext().getAuthentication().getAuthorities()
				.stream()
				.anyMatch(authority -> "ROLE_ADMIN_APP".equals(authority.getAuthority()));
	}
}
