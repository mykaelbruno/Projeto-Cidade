package com.mykael.prefeitura.core.usuario;

import com.mykael.prefeitura.core.comum.dto.AtivacaoRequestDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioCreateRequestDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioResponseDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioUpdateRequestDTO;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController implements UsuarioControllerOpenApi {

	private final UsuarioService usuarioService;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;

	public UsuarioController(
			UsuarioService usuarioService,
			VinculoUsuarioOrganizacaoRepository vinculoRepository
	) {
		this.usuarioService = usuarioService;
		this.vinculoRepository = vinculoRepository;
	}

	@Override
	@GetMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public List<UsuarioResponseDTO> listar(
			@RequestParam(required = false) String termo,
			@RequestParam(required = false) PerfilUsuario perfilGlobal,
			@RequestParam(required = false) Boolean ativo
	) {
		return usuarioService.listarFiltrado(cidadeEscopoPrefeitura(), termo, perfilGlobal, ativo)
				.stream()
				.map(UsuarioResponseDTO::from)
				.toList();
	}

	@Override
	@PostMapping
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public ResponseEntity<UsuarioResponseDTO> criar(@Valid @RequestBody UsuarioCreateRequestDTO request) {
		validarCidadeOperador(request.cidade());
		Usuario usuario = usuarioService.criarUsuario(request);
		return ResponseEntity.status(201).body(UsuarioResponseDTO.from(usuario));
	}

	@Override
	@PutMapping("/{usuarioId}")
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public ResponseEntity<UsuarioResponseDTO> atualizar(
			@PathVariable Long usuarioId,
			@Valid @RequestBody UsuarioUpdateRequestDTO request
	) {
		validarCidadeDoAfetado(usuarioId);
		validarCidadeOperador(request.cidade());
		return ResponseEntity.ok(UsuarioResponseDTO.from(usuarioService.atualizarUsuario(usuarioId, request)));
	}

	@Override
	@PatchMapping("/{usuarioId}/ativacao")
	@PreAuthorize("hasRole('ADMIN') or hasRole('PREFEITURA')")
	public ResponseEntity<UsuarioResponseDTO> alterarAtivo(
			@PathVariable Long usuarioId,
			@RequestBody AtivacaoRequestDTO request
	) {
		validarCidadeDoAfetado(usuarioId);
		return ResponseEntity.ok(UsuarioResponseDTO.from(usuarioService.alterarAtivo(usuarioId, request.ativo())));
	}

	private void validarCidadeOperador(String cidadeUsuario) {
		String cidade = cidadeEscopoPrefeitura();
		if (cidade != null && (cidadeUsuario == null || !cidade.equalsIgnoreCase(cidadeUsuario.trim()))) {
			throw new ResponseStatusException(
					HttpStatus.FORBIDDEN,
					"Operador da prefeitura nao pode gerenciar contas fora de sua cidade."
			);
		}
	}

	private String cidadeEscopoPrefeitura() {
		var authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
			Long operadorId = Long.valueOf(jwt.getSubject());
			
			var vinculos = vinculoRepository.findByUsuarioIdAndAtivoTrue(operadorId);
			var vinculoPrefeitura = vinculos.stream()
					.filter(v -> v.getPapel() == PapelUsuario.PREFEITURA)
					.findFirst();

			if (vinculoPrefeitura.isPresent()) {
				return vinculoPrefeitura.get().getOrganizacao().getCidade();
			}
		}
		return null;
	}

	private void validarCidadeDoAfetado(Long usuarioId) {
		var authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
			Long operadorId = Long.valueOf(jwt.getSubject());
			
			var vinculos = vinculoRepository.findByUsuarioIdAndAtivoTrue(operadorId);
			var vinculoPrefeitura = vinculos.stream()
					.filter(v -> v.getPapel() == PapelUsuario.PREFEITURA)
					.findFirst();

			if (vinculoPrefeitura.isPresent()) {
				String cidade = vinculoPrefeitura.get().getOrganizacao().getCidade();
				Usuario afetado = usuarioService.buscarPorId(usuarioId);
				if (!cidade.equalsIgnoreCase(afetado.getCidade())) {
					throw new ResponseStatusException(
							HttpStatus.FORBIDDEN,
							"Operador da prefeitura nao pode gerenciar contas fora de sua cidade."
					);
				}
			}
		}
	}
}
