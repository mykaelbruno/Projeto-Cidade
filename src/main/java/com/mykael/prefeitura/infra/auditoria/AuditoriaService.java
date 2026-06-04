package com.mykael.prefeitura.infra.auditoria;

import com.mykael.prefeitura.infra.auditoria.dto.AuditoriaResponseDTO;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuditoriaService {

	private final AuditoriaRepository auditoriaRepository;

	public AuditoriaService(AuditoriaRepository auditoriaRepository) {
		this.auditoriaRepository = auditoriaRepository;
	}

	@Transactional(propagation = Propagation.MANDATORY)
	public void registrar(
			TipoAcaoAuditoria acao,
			TipoAlvoAuditoria alvoTipo,
			Long alvoId,
			String descricao,
			String detalhes
	) {
		Auditoria auditoria = new Auditoria();
		auditoria.setAcao(acao);
		auditoria.setAlvoTipo(alvoTipo);
		auditoria.setAlvoId(alvoId);
		auditoria.setDescricao(limitar(descricao, 255));
		auditoria.setDetalhes(limitar(detalhes, 1000));

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		auditoria.setAtorId(extrairAtorId(authentication));
		auditoria.setPerfilAtor(extrairPerfilAtor(authentication));

		AuditoriaContext.DadosRequisicao dados = AuditoriaContext.atual();
		if (dados != null) {
			auditoria.setMetodoHttp(limitar(dados.metodoHttp(), 10));
			auditoria.setCaminho(limitar(dados.caminho(), 300));
			auditoria.setIp(limitar(dados.ip(), 80));
		}

		auditoriaRepository.save(auditoria);
	}

	@Transactional(readOnly = true)
	public Page<AuditoriaResponseDTO> listar(
			TipoAcaoAuditoria acao,
			TipoAlvoAuditoria alvoTipo,
			Long alvoId,
			Long atorId,
			Pageable pageable
	) {
		return auditoriaRepository.findAll(filtro(acao, alvoTipo, alvoId, atorId), pageable)
				.map(AuditoriaResponseDTO::from);
	}

	private Specification<Auditoria> filtro(
			TipoAcaoAuditoria acao,
			TipoAlvoAuditoria alvoTipo,
			Long alvoId,
			Long atorId
	) {
		Specification<Auditoria> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

		if (acao != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("acao"), acao));
		}
		if (alvoTipo != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("alvoTipo"), alvoTipo));
		}
		if (alvoId != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("alvoId"), alvoId));
		}
		if (atorId != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("atorId"), atorId));
		}

		return specification;
	}

	private Long extrairAtorId(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
			return null;
		}
		try {
			return Long.valueOf(jwt.getSubject());
		}
		catch (NumberFormatException exception) {
			return null;
		}
	}

	private String extrairPerfilAtor(Authentication authentication) {
		if (authentication == null) {
			return null;
		}
		String perfil = authentication.getAuthorities()
				.stream()
				.map(GrantedAuthority::getAuthority)
				.filter(authority -> authority.startsWith("ROLE_"))
				.map(authority -> authority.substring("ROLE_".length()))
				.collect(Collectors.joining(","));
		return StringUtils.hasText(perfil) ? limitar(perfil, 80) : null;
	}

	private String limitar(String valor, int tamanhoMaximo) {
		if (!StringUtils.hasText(valor)) {
			return null;
		}
		String limpo = valor.trim();
		return limpo.length() <= tamanhoMaximo ? limpo : limpo.substring(0, tamanhoMaximo);
	}
}
