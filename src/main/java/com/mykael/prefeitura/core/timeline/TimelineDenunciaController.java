package com.mykael.prefeitura.core.timeline;

import com.mykael.prefeitura.core.timeline.dto.TimelineDenunciaResponseDTO;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/denuncias/{denunciaId}/timeline")
public class TimelineDenunciaController implements TimelineDenunciaControllerOpenApi {

	private final TimelineDenunciaService timelineDenunciaService;

	public TimelineDenunciaController(TimelineDenunciaService timelineDenunciaService) {
		this.timelineDenunciaService = timelineDenunciaService;
	}

	@Override
	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public Page<TimelineDenunciaResponseDTO> listar(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
	) {
		return timelineDenunciaService.listarPorDenuncia(denunciaId, UsuarioAutenticado.from(jwt), pageable);
	}
}
