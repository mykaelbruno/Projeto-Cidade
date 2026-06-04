package com.mykael.prefeitura.core.vinculo;

import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoResponseDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoCreateRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoTransferenciaSecretariaRequestDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoUpdateRequestDTO;
import com.mykael.prefeitura.infra.security.AutorizacaoService;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/vinculos")
public class VinculoUsuarioOrganizacaoController implements VinculoUsuarioOrganizacaoControllerOpenApi {

	private final VinculoUsuarioOrganizacaoService vinculoService;
	private final AutorizacaoService autorizacaoService;
	private final UsuarioRepository usuarioRepository;

	public VinculoUsuarioOrganizacaoController(
			VinculoUsuarioOrganizacaoService vinculoService,
			AutorizacaoService autorizacaoService,
			UsuarioRepository usuarioRepository
	) {
		this.vinculoService = vinculoService;
		this.autorizacaoService = autorizacaoService;
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	@GetMapping
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public List<VinculoUsuarioOrganizacaoResponseDTO> listar() {
		var authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
			Long operadorId = Long.valueOf(jwt.getSubject());
			Usuario operador = usuarioRepository.findById(operadorId)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario nao encontrado."));

			var vinculos = vinculoService.listarPorUsuario(operadorId);
			var vinculoPrefeitura = vinculos.stream()
					.filter(v -> v.getPapel() == PapelUsuario.ADMIN_PREFEITURA)
					.findFirst();

			if (vinculoPrefeitura.isPresent()) {
				String cidade = vinculoPrefeitura.get().getOrganizacao().getCidade();
				return vinculoService.listarTodos()
						.stream()
						.filter(v -> {
							var org = v.getOrganizacao();
							return org != null && org.getCidade() != null && org.getCidade().equalsIgnoreCase(cidade);
						})
						.map(VinculoUsuarioOrganizacaoResponseDTO::from)
						.toList();
			}
		}

		return vinculoService.listarTodos()
				.stream()
				.map(VinculoUsuarioOrganizacaoResponseDTO::from)
				.toList();
	}

	@Override
	@PostMapping
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> criar(
			@Valid @RequestBody VinculoUsuarioOrganizacaoCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(
				usuarioId(jwt),
				request.organizacaoId(),
				isAdminApp()
		);
		return ResponseEntity.status(201).body(VinculoUsuarioOrganizacaoResponseDTO.from(vinculoService.criar(request)));
	}

	@Override
	@GetMapping("/organizacoes/{organizacaoId}")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public List<VinculoUsuarioOrganizacaoResponseDTO> listarPorOrganizacao(
			@PathVariable Long organizacaoId,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(usuarioId(jwt), organizacaoId, isAdminApp());
		return vinculoService.listarPorOrganizacao(organizacaoId)
				.stream()
				.map(VinculoUsuarioOrganizacaoResponseDTO::from)
				.toList();
	}

	@Override
	@PutMapping("/{vinculoId}")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> atualizar(
			@PathVariable Long vinculoId,
			@Valid @RequestBody VinculoUsuarioOrganizacaoUpdateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		VinculoUsuarioOrganizacao vinculo = vinculoService.buscar(vinculoId);
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(
				usuarioId(jwt),
				vinculo.getOrganizacao().getId(),
				isAdminApp()
		);
		return ResponseEntity.ok(VinculoUsuarioOrganizacaoResponseDTO.from(vinculoService.atualizar(vinculoId, request)));
	}

	@Override
	@PatchMapping("/{vinculoId}/secretaria")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> transferirSecretaria(
			@PathVariable Long vinculoId,
			@Valid @RequestBody VinculoTransferenciaSecretariaRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		VinculoUsuarioOrganizacao vinculo = vinculoService.buscar(vinculoId);
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(
				usuarioId(jwt),
				vinculo.getOrganizacao().getId(),
				isAdminApp()
		);
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(
				usuarioId(jwt),
				request.secretariaDestinoId(),
				isAdminApp()
		);
		return ResponseEntity.ok(VinculoUsuarioOrganizacaoResponseDTO.from(vinculoService.transferirSecretaria(vinculoId, request)));
	}

	@Override
	@GetMapping("/me")
	@PreAuthorize("isAuthenticated()")
	public List<VinculoUsuarioOrganizacaoResponseDTO> listarMeusVinculos(
			@AuthenticationPrincipal Jwt jwt
	) {
		return vinculoService.listarPorUsuario(usuarioId(jwt))
				.stream()
				.map(VinculoUsuarioOrganizacaoResponseDTO::from)
				.toList();
	}

	private Long usuarioId(Jwt jwt) {
		return Long.valueOf(jwt.getSubject());
	}

	private boolean isAdminApp() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		return authentication != null && authentication.getAuthorities()
				.stream()
				.anyMatch(authority -> "ROLE_ADMIN_APP".equals(authority.getAuthority()));
	}
}
