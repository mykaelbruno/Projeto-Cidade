package com.mykael.prefeitura.core.denuncia;

import com.mykael.prefeitura.core.denuncia.dto.DenunciaCreateRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaFiltroDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaSemelhanteResponseDTO;
import com.mykael.prefeitura.core.denuncia.dto.FeedbackConclusaoRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.StatusDenunciaUpdateRequestDTO;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/denuncias")
public class DenunciaController implements DenunciaControllerOpenApi {

	private final DenunciaService denunciaService;
	private final DenunciaSemelhanteService denunciaSemelhanteService;

	public DenunciaController(
			DenunciaService denunciaService,
			DenunciaSemelhanteService denunciaSemelhanteService
	) {
		this.denunciaService = denunciaService;
		this.denunciaSemelhanteService = denunciaSemelhanteService;
	}

	@Override
	@PostMapping
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<DenunciaResponseDTO> criar(
			@Valid @RequestBody DenunciaCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		DenunciaResponseDTO response = denunciaService.criar(request, Long.valueOf(jwt.getSubject()));
		return ResponseEntity.status(201).body(response);
	}

	@Override
	@PostMapping("/semelhantes")
	@PreAuthorize("hasRole('MORADOR')")
	public List<DenunciaSemelhanteResponseDTO> buscarSemelhantes(
			@Valid @RequestBody DenunciaCreateRequestDTO request
	) {
		return denunciaSemelhanteService.buscarSemelhantes(request);
	}

	@Override
	@GetMapping
	@PreAuthorize("isAuthenticated()")
	public Page<DenunciaResponseDTO> listar(
			@RequestParam(required = false) String cidade,
			@RequestParam(required = false) String bairro,
			@RequestParam(required = false) StatusDenuncia status,
			@RequestParam(required = false) Long categoriaId,
			@RequestParam(required = false) Long organizacaoResponsavelId,
			@RequestParam(required = false) String termo,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm") Pageable pageable
	) {
		return denunciaService.listar(
				new DenunciaFiltroDTO(cidade, bairro, status, categoriaId, organizacaoResponsavelId, null, termo),
				UsuarioAutenticado.from(jwt),
				pageable
		);
	}

	@Override
	@GetMapping("/minhas")
	@PreAuthorize("hasRole('MORADOR')")
	public Page<DenunciaResponseDTO> listarMinhas(
			@RequestParam(required = false) String cidade,
			@RequestParam(required = false) String bairro,
			@RequestParam(required = false) StatusDenuncia status,
			@RequestParam(required = false) Long categoriaId,
			@RequestParam(required = false) String termo,
			@AuthenticationPrincipal Jwt jwt,
			@PageableDefault(size = 20, sort = "criadoEm") Pageable pageable
	) {
		return denunciaService.listarMinhas(
				Long.valueOf(jwt.getSubject()),
				new DenunciaFiltroDTO(cidade, bairro, status, categoriaId, null, null, termo),
				pageable
		);
	}

	@Override
	@GetMapping("/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<DenunciaResponseDTO> detalhar(
			@PathVariable Long id,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(denunciaService.detalhar(id, UsuarioAutenticado.from(jwt)));
	}

	@Override
	@PatchMapping("/{id}/status")
	@PreAuthorize("hasAnyRole('ADMIN_PREFEITURA', 'ADMIN_SECRETARIA', 'ATENDENTE_SECRETARIA')")
	public ResponseEntity<DenunciaResponseDTO> atualizarStatus(
			@PathVariable Long id,
			@Valid @RequestBody StatusDenunciaUpdateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(denunciaService.atualizarStatus(id, Long.valueOf(jwt.getSubject()), request));
	}

	@Override
	@PostMapping("/{id}/conclusao/confirmacao")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<DenunciaResponseDTO> confirmarConclusao(
			@PathVariable Long id,
			@Valid @RequestBody FeedbackConclusaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(denunciaService.confirmarConclusao(id, Long.valueOf(jwt.getSubject()), request));
	}

	@Override
	@PostMapping("/{id}/conclusao/contestacao")
	@PreAuthorize("hasRole('MORADOR')")
	public ResponseEntity<DenunciaResponseDTO> contestarConclusao(
			@PathVariable Long id,
			@Valid @RequestBody FeedbackConclusaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		return ResponseEntity.ok(denunciaService.contestarConclusao(id, Long.valueOf(jwt.getSubject()), request));
	}

	@Override
	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('MORADOR') or hasRole('ADMIN_APP')")
	public ResponseEntity<Void> deletar(
			@PathVariable Long id,
			@AuthenticationPrincipal Jwt jwt
	) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		boolean isAdminApp = authentication != null && authentication.getAuthorities()
				.stream()
				.anyMatch(authority -> "ROLE_ADMIN_APP".equals(authority.getAuthority()));
		
		denunciaService.deletar(id, Long.valueOf(jwt.getSubject()), isAdminApp);
		return ResponseEntity.noContent().build();
	}
}
