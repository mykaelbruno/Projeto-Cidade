package com.mykael.prefeitura.infra.auditoria;

import com.mykael.prefeitura.infra.auditoria.dto.AuditoriaResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditorias")
public class AuditoriaController implements AuditoriaControllerOpenApi {

	private final AuditoriaService auditoriaService;

	public AuditoriaController(AuditoriaService auditoriaService) {
		this.auditoriaService = auditoriaService;
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
}
