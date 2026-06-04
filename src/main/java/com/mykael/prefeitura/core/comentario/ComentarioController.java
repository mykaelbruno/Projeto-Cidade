package com.mykael.prefeitura.core.comentario;

import com.mykael.prefeitura.core.comentario.dto.ComentarioCreateRequestDTO;
import com.mykael.prefeitura.core.comentario.dto.ComentarioResponseDTO;
import com.mykael.prefeitura.core.comentario.dto.RespostaOficialCreateRequestDTO;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
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
@RequestMapping("/api/denuncias/{denunciaId}")
public class ComentarioController implements ComentarioControllerOpenApi {

	private final ComentarioService comentarioService;

	public ComentarioController(ComentarioService comentarioService) {
		this.comentarioService = comentarioService;
	}

	@Override
	@PostMapping("/comentarios")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<ComentarioResponseDTO> comentar(
			@PathVariable Long denunciaId,
			@Valid @RequestBody ComentarioCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		ComentarioResponseDTO response = comentarioService.comentar(denunciaId, usuarioId(jwt), request);
		return ResponseEntity.status(201).body(response);
	}

	@Override
	@PostMapping("/respostas-oficiais")
	@PreAuthorize("hasAnyRole('ADMIN_PREFEITURA', 'ADMIN_SECRETARIA', 'ATENDENTE_SECRETARIA', 'ADMIN_APP')")
	public ResponseEntity<ComentarioResponseDTO> responderOficialmente(
			@PathVariable Long denunciaId,
			@Valid @RequestBody RespostaOficialCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		ComentarioResponseDTO response = comentarioService.responderOficialmente(denunciaId, usuarioId(jwt), request);
		return ResponseEntity.status(201).body(response);
	}

	@Override
	@GetMapping("/comentarios")
	@PreAuthorize("isAuthenticated()")
	public Page<ComentarioResponseDTO> listar(
			@PathVariable Long denunciaId,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm") Pageable pageable
	) {
		return comentarioService.listarPorDenuncia(denunciaId, UsuarioAutenticado.from(jwt), pageable);
	}

	private Long usuarioId(Jwt jwt) {
		return Long.valueOf(jwt.getSubject());
	}
}
