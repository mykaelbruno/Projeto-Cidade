package com.mykael.prefeitura.core.organizacao;

import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.OrganizacaoResponseDTO;
import com.mykael.prefeitura.core.organizacao.dto.OrganizacaoUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.PrefeituraCreateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.SecretariaCreateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.SecretariaCategoriasUpdateRequestDTO;
import com.mykael.prefeitura.core.organizacao.dto.UsuarioInstitucionalCreateRequestDTO;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoResponseDTO;
import com.mykael.prefeitura.infra.security.AutorizacaoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organizacoes")
public class OrganizacaoController implements OrganizacaoControllerOpenApi {

	private final OrganizacaoService organizacaoService;
	private final AutorizacaoService autorizacaoService;

	public OrganizacaoController(OrganizacaoService organizacaoService, AutorizacaoService autorizacaoService) {
		this.organizacaoService = organizacaoService;
		this.autorizacaoService = autorizacaoService;
	}

	@Override
	@GetMapping
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public List<OrganizacaoResponseDTO> listar() {
		return organizacaoService.listarTodas()
				.stream()
				.map(OrganizacaoResponseDTO::from)
				.toList();
	}

	@Override
	@GetMapping("/prefeituras")
	public ResponseEntity<List<OrganizacaoResponseDTO>> listarPrefeiturasAtivas() {
		var prefeituras = organizacaoService.listarPrefeiturasAtivas()
				.stream()
				.map(OrganizacaoResponseDTO::from)
				.toList();
		return ResponseEntity.ok(prefeituras);
	}

	@Override
	@PostMapping("/prefeituras")
	@PreAuthorize("hasRole('ADMIN_APP')")
	public ResponseEntity<OrganizacaoResponseDTO> criarPrefeitura(@Valid @RequestBody PrefeituraCreateRequestDTO request) {
		var prefeitura = organizacaoService.criarPrefeitura(request);
		return ResponseEntity.status(201).body(OrganizacaoResponseDTO.from(prefeitura));
	}

	@Override
	@PostMapping("/prefeituras/{prefeituraId}/secretarias")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<OrganizacaoResponseDTO> criarSecretaria(
			@PathVariable Long prefeituraId,
			@Valid @RequestBody SecretariaCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAdminPrefeituraOuAdminApp(usuarioId(jwt), prefeituraId, isAdminApp());
		var secretaria = organizacaoService.criarSecretaria(prefeituraId, request);
		return ResponseEntity.status(201).body(OrganizacaoResponseDTO.from(secretaria));
	}

	@Override
	@PostMapping("/{organizacaoId}/usuarios-institucionais")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<VinculoUsuarioOrganizacaoResponseDTO> criarUsuarioInstitucional(
			@PathVariable Long organizacaoId,
			@Valid @RequestBody UsuarioInstitucionalCreateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(usuarioId(jwt), organizacaoId, isAdminApp());
		VinculoUsuarioOrganizacao vinculo = organizacaoService.criarUsuarioInstitucional(organizacaoId, request);
		return ResponseEntity.status(201).body(VinculoUsuarioOrganizacaoResponseDTO.from(vinculo));
	}

	@Override
	@PutMapping("/{organizacaoId}")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<OrganizacaoResponseDTO> atualizar(
			@PathVariable Long organizacaoId,
			@Valid @RequestBody OrganizacaoUpdateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(usuarioId(jwt), organizacaoId, isAdminApp());
		return ResponseEntity.ok(OrganizacaoResponseDTO.from(organizacaoService.atualizarOrganizacao(organizacaoId, request)));
	}

	@Override
	@PatchMapping("/{organizacaoId}/categorias")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<OrganizacaoResponseDTO> atualizarCategoriasSecretaria(
			@PathVariable Long organizacaoId,
			@Valid @RequestBody SecretariaCategoriasUpdateRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(usuarioId(jwt), organizacaoId, isAdminApp());
		return ResponseEntity.ok(OrganizacaoResponseDTO.from(organizacaoService.atualizarCategoriasSecretaria(organizacaoId, request)));
	}

	@Override
	@PatchMapping("/{organizacaoId}/ativacao")
	@PreAuthorize("hasRole('ADMIN_APP') or hasRole('ADMIN_PREFEITURA')")
	public ResponseEntity<OrganizacaoResponseDTO> alterarAtiva(
			@PathVariable Long organizacaoId,
			@RequestBody AtivacaoRequestDTO request,
			@AuthenticationPrincipal Jwt jwt
	) {
		autorizacaoService.exigirAcessoDaPrefeituraAoDestino(usuarioId(jwt), organizacaoId, isAdminApp());
		return ResponseEntity.ok(OrganizacaoResponseDTO.from(organizacaoService.alterarAtiva(organizacaoId, request.ativo())));
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
