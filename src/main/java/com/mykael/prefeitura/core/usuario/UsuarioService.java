package com.mykael.prefeitura.core.usuario;

import com.mykael.prefeitura.core.usuario.dto.UsuarioCreateRequestDTO;
import com.mykael.prefeitura.core.usuario.dto.UsuarioUpdateRequestDTO;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UsuarioService {

	private final UsuarioRepository usuarioRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuditoriaService auditoriaService;

	public UsuarioService(
			UsuarioRepository usuarioRepository,
			PasswordEncoder passwordEncoder,
			AuditoriaService auditoriaService
	) {
		this.usuarioRepository = usuarioRepository;
		this.passwordEncoder = passwordEncoder;
		this.auditoriaService = auditoriaService;
	}

	@Transactional(readOnly = true)
	public List<Usuario> listarTodos() {
		return usuarioRepository.findAll();
	}

	@Transactional(readOnly = true)
	public List<Usuario> listarFiltrado(String cidadeEscopo, String termo, PerfilUsuario perfilGlobal, Boolean ativo) {
		String termoNormalizado = termo == null || termo.isBlank() ? null : termo.trim().toLowerCase();
		String cidadeNormalizada = cidadeEscopo == null || cidadeEscopo.isBlank() ? null : cidadeEscopo.trim().toLowerCase();

		return usuarioRepository.findAll((root, query, criteriaBuilder) -> {
			List<Predicate> predicates = new ArrayList<>();

			if (cidadeNormalizada != null) {
				predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("cidade")), cidadeNormalizada));
			}
			if (perfilGlobal != null) {
				predicates.add(criteriaBuilder.equal(root.get("perfilGlobal"), perfilGlobal));
			}
			if (ativo != null) {
				predicates.add(criteriaBuilder.equal(root.get("ativo"), ativo));
			}
			if (termoNormalizado != null) {
				String like = "%" + termoNormalizado + "%";
				predicates.add(criteriaBuilder.or(
						criteriaBuilder.like(criteriaBuilder.lower(root.get("nome")), like),
						criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), like),
						criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), like),
						criteriaBuilder.like(criteriaBuilder.lower(root.get("cidade")), like),
						criteriaBuilder.like(criteriaBuilder.lower(root.get("bairro")), like)
				));
			}

			query.orderBy(criteriaBuilder.asc(root.get("nome")));
			return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
		});
	}

	@Transactional
	public Usuario criarUsuario(UsuarioCreateRequestDTO request) {
		validarEmailEUsernameDisponiveis(request.email(), request.username());

		Usuario usuario = new Usuario();
		usuario.setNome(request.nome().trim());
		usuario.setEmail(request.email().trim().toLowerCase());
		usuario.setUsername(request.username().trim().toLowerCase());
		usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
		usuario.setPerfilGlobal(request.perfilGlobal());
		usuario.setTelefone(request.telefone());
		usuario.setCidade(request.cidade().trim());
		usuario.setBairro(request.bairro().trim());
		Usuario salvo = usuarioRepository.save(usuario);
		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_CRIADO,
				TipoAlvoAuditoria.USUARIO,
				salvo.getId(),
				"Usuario criado pelo ADMIN_APP.",
				"Perfil global: " + salvo.getPerfilGlobal()
		);
		return salvo;
	}

	@Transactional
	public Usuario atualizarUsuario(Long usuarioId, UsuarioUpdateRequestDTO request) {
		Usuario usuario = buscarUsuario(usuarioId);
		validarEmailDisponivelParaUsuario(request.email(), usuarioId);
		validarUsernameDisponivelParaUsuario(request.username(), usuarioId);

		usuario.setNome(request.nome().trim());
		usuario.setEmail(request.email().trim().toLowerCase());
		usuario.setUsername(request.username().trim().toLowerCase());
		usuario.setPerfilGlobal(request.perfilGlobal());
		usuario.setTelefone(request.telefone());
		usuario.setCidade(request.cidade().trim());
		usuario.setBairro(request.bairro().trim());
		usuario.setFotoPerfilUrl(trimOrNull(request.fotoPerfilUrl()));
		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_ATUALIZADO,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Usuario atualizado pelo ADMIN_APP.",
				"Perfil global atual: " + usuario.getPerfilGlobal()
		);
		return usuario;
	}

	@Transactional
	public Usuario alterarAtivo(Long usuarioId, boolean ativo) {
		Usuario usuario = buscarUsuario(usuarioId);
		if (!ativo && usuario.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			long adminsAtivos = usuarioRepository.countByPerfilGlobalAndAtivoTrue(PerfilUsuario.ADMIN_APP);
			if (adminsAtivos <= 1) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao e permitido desativar o ultimo ADMIN_APP ativo.");
			}
		}
		usuario.setAtivo(ativo);
		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_ATIVACAO_ALTERADA,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Situacao ativa do usuario alterada.",
				"Ativo: " + ativo
		);
		return usuario;
	}

	@Transactional(readOnly = true)
	public Usuario buscarPorId(Long usuarioId) {
		return buscarUsuario(usuarioId);
	}

	@Transactional(readOnly = true)
	public List<Usuario> listarPorCidade(String cidade) {
		return usuarioRepository.findByCidadeIgnoreCase(cidade);
	}

	private Usuario buscarUsuario(Long usuarioId) {
		return usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
	}

	private void validarEmailEUsernameDisponiveis(String email, String username) {
		if (usuarioRepository.existsByEmail(email.trim().toLowerCase())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
		}
		if (usuarioRepository.existsByUsername(username.trim().toLowerCase())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ja cadastrado.");
		}
	}

	private void validarEmailDisponivelParaUsuario(String email, Long usuarioId) {
		usuarioRepository.findByEmail(email.trim().toLowerCase())
				.filter(usuario -> !usuario.getId().equals(usuarioId))
				.ifPresent(usuario -> {
					throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado.");
				});
	}

	private void validarUsernameDisponivelParaUsuario(String username, Long usuarioId) {
		usuarioRepository.findByUsername(username.trim().toLowerCase())
				.filter(usuario -> !usuario.getId().equals(usuarioId))
				.ifPresent(usuario -> {
					throw new ResponseStatusException(HttpStatus.CONFLICT, "Username ja cadastrado.");
				});
	}

	private String trimOrNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}
}
