package com.mykael.prefeitura.core.bairro;

import com.mykael.prefeitura.core.bairro.dto.BairroCreateRequestDTO;
import com.mykael.prefeitura.core.bairro.dto.BairroResponseDTO;
import com.mykael.prefeitura.core.bairro.dto.BairroUpdateRequestDTO;
import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.infra.security.AutorizacaoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prefeituras/{prefeituraId}/bairros")
public class BairroController implements BairroControllerOpenApi {

	private final BairroService bairroService;
	private final AutorizacaoService autorizacaoService;

	public BairroController(BairroService bairroService, AutorizacaoService autorizacaoService) {
		this.bairroService = bairroService;
		this.autorizacaoService = autorizacaoService;
	}

	@Override
	@GetMapping("/ativos")
	public List<BairroResponseDTO> listarAtivos(@PathVariable Long prefeituraId) {
		return bairroService.listar(prefeituraId, true);
	}

	@Override
	@GetMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public List<BairroResponseDTO> listarParaGestao(
			@PathVariable Long prefeituraId,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAdminPrefeituraOuAdminApp(usuarioId(jwt), prefeituraId, isAdminApp());
		return bairroService.listar(prefeituraId, false);
	}

	@Override
	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public ResponseEntity<BairroResponseDTO> criar(
			@PathVariable Long prefeituraId,
			@Valid @RequestBody BairroCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAdminPrefeituraOuAdminApp(usuarioId(jwt), prefeituraId, isAdminApp());
		return ResponseEntity.status(201).body(bairroService.criar(prefeituraId, request));
	}

	@Override
	@PutMapping("/{bairroId}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public ResponseEntity<BairroResponseDTO> atualizar(
			@PathVariable Long prefeituraId,
			@PathVariable Long bairroId,
			@Valid @RequestBody BairroUpdateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAdminPrefeituraOuAdminApp(usuarioId(jwt), prefeituraId, isAdminApp());
		validarBairroDaPrefeitura(bairroId, prefeituraId);
		return ResponseEntity.ok(bairroService.atualizar(bairroId, request));
	}

	@Override
	@PatchMapping("/{bairroId}/ativacao")
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public ResponseEntity<BairroResponseDTO> alterarAtivo(
			@PathVariable Long prefeituraId,
			@PathVariable Long bairroId,
			@RequestBody AtivacaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAdminPrefeituraOuAdminApp(usuarioId(jwt), prefeituraId, isAdminApp());
		validarBairroDaPrefeitura(bairroId, prefeituraId);
		return ResponseEntity.ok(bairroService.alterarAtivo(bairroId, request.ativo()));
	}

	private void validarBairroDaPrefeitura(Long bairroId, Long prefeituraId) {
		Bairro bairro = bairroService.buscar(bairroId);
		if (!bairro.getPrefeitura().getId().equals(prefeituraId)) {
			throw new org.springframework.web.server.ResponseStatusException(
					org.springframework.http.HttpStatus.BAD_REQUEST,
					"Bairro nao pertence a prefeitura informada."
			);
		}
	}

	private Long usuarioId(Jwt jwt) {
		return Long.valueOf(jwt.getSubject());
	}

	private boolean isAdminApp() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication != null && authentication.getAuthorities()
				.stream()
				.anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
	}
}
