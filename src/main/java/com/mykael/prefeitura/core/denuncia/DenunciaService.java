package com.mykael.prefeitura.core.denuncia;

import com.mykael.prefeitura.core.anexo.AnexoDenunciaRepository;
import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.categoria.CategoriaRepository;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaCreateRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaFiltroDTO;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.denuncia.dto.FeedbackConclusaoRequestDTO;
import com.mykael.prefeitura.core.denuncia.dto.StatusDenunciaUpdateRequestDTO;
import com.mykael.prefeitura.core.notificacao.NotificacaoService;
import com.mykael.prefeitura.core.notificacao.TipoNotificacao;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.timeline.TimelineDenunciaService;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.comentario.Comentario;
import com.mykael.prefeitura.core.comentario.ComentarioRepository;
import com.mykael.prefeitura.infra.antispam.AntispamService;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DenunciaService {

	private final DenunciaRepository denunciaRepository;
	private final UsuarioRepository usuarioRepository;
	private final CategoriaRepository categoriaRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final TimelineDenunciaService timelineDenunciaService;
	private final NotificacaoService notificacaoService;
	private final AuditoriaService auditoriaService;
	private final AntispamService antispamService;
	private final VisibilidadeDenunciaService visibilidadeDenunciaService;
	private final ComentarioRepository comentarioRepository;
	private final AnexoDenunciaRepository anexoRepository;

	public DenunciaService(
			DenunciaRepository denunciaRepository,
			UsuarioRepository usuarioRepository,
			CategoriaRepository categoriaRepository,
			OrganizacaoRepository organizacaoRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			TimelineDenunciaService timelineDenunciaService,
			NotificacaoService notificacaoService,
			AuditoriaService auditoriaService,
			AntispamService antispamService,
			VisibilidadeDenunciaService visibilidadeDenunciaService,
			ComentarioRepository comentarioRepository,
			AnexoDenunciaRepository anexoRepository
	) {
		this.denunciaRepository = denunciaRepository;
		this.usuarioRepository = usuarioRepository;
		this.categoriaRepository = categoriaRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.vinculoRepository = vinculoRepository;
		this.timelineDenunciaService = timelineDenunciaService;
		this.notificacaoService = notificacaoService;
		this.auditoriaService = auditoriaService;
		this.antispamService = antispamService;
		this.visibilidadeDenunciaService = visibilidadeDenunciaService;
		this.comentarioRepository = comentarioRepository;
		this.anexoRepository = anexoRepository;
	}

	@Transactional
	public DenunciaResponseDTO criar(DenunciaCreateRequestDTO request, Long autorId) {
		Usuario autor = usuarioRepository.findById(autorId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado."));
		Categoria categoria = categoriaRepository.findById(request.categoriaId())
				.filter(Categoria::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria ativa nao encontrada."));

		antispamService.validarConteudoDenuncia(request.titulo(), request.descricao());
		validarDenunciaRepetida(request, autorId, categoria.getId());

		Denuncia denuncia = new Denuncia();
		denuncia.setTitulo(request.titulo().trim());
		denuncia.setDescricao(request.descricao().trim());
		denuncia.setCategoria(categoria);
		denuncia.setStatus(StatusDenuncia.ABERTO);
		denuncia.setAutor(autor);
		denuncia.setAnonima(request.anonima());
		denuncia.setCidade(request.cidade().trim());
		denuncia.setBairro(request.bairro().trim());
		denuncia.setRua(trimOrNull(request.rua()));
		denuncia.setPontoReferencia(trimOrNull(request.pontoReferencia()));
		denuncia.setLatitude(request.latitude());
		denuncia.setLongitude(request.longitude());
		denuncia.setOrganizacaoResponsavel(categoria.getOrganizacaoResponsavelPadrao());
		denuncia.setPontuacaoRelevancia(0);

		Denuncia salva = denunciaRepository.save(denuncia);
		timelineDenunciaService.registrarDenunciaCriada(salva, autor);
		if (salva.getOrganizacaoResponsavel() != null) {
			notificacaoService.notificarOrganizacao(
					salva.getOrganizacaoResponsavel().getId(),
					salva,
					TipoNotificacao.DENUNCIA_ATRIBUIDA,
					"Nova denuncia atribuida",
					"Uma nova denuncia foi atribuida para sua organizacao.",
					"/denuncias/" + salva.getId()
			);
		}
		return DenunciaResponseDTO.from(salva);
	}

	@Transactional(readOnly = true)
	public Page<DenunciaResponseDTO> listar(DenunciaFiltroDTO filtro, UsuarioAutenticado usuario, Pageable pageable) {
		Page<Denuncia> denuncias = denunciaRepository.findAll(
						montarFiltro(filtro, visibilidadeDenunciaService.deveOcultarArquivadasNaListagemGeral(usuario)),
						pageable
				);
		return mapearComCapas(denuncias, false);
	}

	@Transactional(readOnly = true)
	public Page<DenunciaResponseDTO> listarMinhas(Long autorId, DenunciaFiltroDTO filtro, Pageable pageable) {
		DenunciaFiltroDTO filtroDoAutor = new DenunciaFiltroDTO(
				filtro.cidade(),
				filtro.bairro(),
				filtro.status(),
				filtro.categoriaId(),
				filtro.organizacaoResponsavelId(),
				autorId,
				filtro.termo()
		);
		Page<Denuncia> denuncias = denunciaRepository.findAll(montarFiltro(filtroDoAutor, false), pageable);
		return mapearComCapas(denuncias, false);
	}

	@Transactional(readOnly = true)
	public DenunciaResponseDTO detalhar(Long id, UsuarioAutenticado usuario) {
		Denuncia denuncia = denunciaRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
		visibilidadeDenunciaService.exigirPodeVisualizar(denuncia, usuario);
		boolean isAutor = usuario != null && denuncia.getAutor().getId().equals(usuario.id());
		return DenunciaResponseDTO.from(denuncia, isAutor, imagemCapaUrl(denuncia.getId()));
	}

	@Transactional
	public DenunciaResponseDTO atualizarStatus(
			Long denunciaId,
			Long usuarioId,
			StatusDenunciaUpdateRequestDTO request
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario usuario = usuarioRepository.findById(usuarioId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));
		Organizacao organizacao = organizacaoRepository.findById(request.organizacaoId())
				.filter(Organizacao::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao ativa nao encontrada."));

		boolean usuarioRepresentaOrganizacao = false;
		if (usuario.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			usuarioRepresentaOrganizacao = true;
		} else {
			boolean vinculoDireto = vinculoRepository
					.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(usuarioId, organizacao.getId());
			if (vinculoDireto) {
				usuarioRepresentaOrganizacao = true;
			} else {
				List<VinculoUsuarioOrganizacao> vinculos = vinculoRepository.findByUsuarioIdAndAtivoTrue(usuarioId);
				for (VinculoUsuarioOrganizacao v : vinculos) {
					if (v.getPapel() == PapelUsuario.ADMIN_PREFEITURA) {
						Long prefeituraId = v.getOrganizacao().getId();
						if (organizacao.getOrganizacaoPai() != null && organizacao.getOrganizacaoPai().getId().equals(prefeituraId)) {
							usuarioRepresentaOrganizacao = true;
							break;
						}
					}
				}
			}
		}

		if (!usuarioRepresentaOrganizacao) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui vinculo ativo com a organizacao informada.");
		}

		validarOrganizacaoResponsavel(denuncia, organizacao, usuario);

		StatusDenuncia statusAnterior = denuncia.getStatus();
		if (statusAnterior == request.status()) {
			return DenunciaResponseDTO.from(denuncia);
		}

		denuncia.setStatus(request.status());
		if (denuncia.getOrganizacaoResponsavel() == null) {
			denuncia.setOrganizacaoResponsavel(organizacao);
		}

		if (StringUtils.hasText(request.motivo())) {
			Comentario comentarioStatus = new Comentario();
			comentarioStatus.setDenuncia(denuncia);
			comentarioStatus.setAutor(usuario);
			comentarioStatus.setConteudo("Alteracao de status para " + request.status().name().replace('_', ' ') + ". Justificativa: " + request.motivo().trim());
			comentarioStatus.setOficial(true);
			comentarioStatus.setOrganizacao(organizacao);
			denuncia.incrementarComentarios();
			comentarioRepository.save(comentarioStatus);
		}

		timelineDenunciaService.registrarStatusAlterado(
				denuncia,
				usuario,
				organizacao,
				statusAnterior,
				request.status(),
				request.motivo()
		);
		auditoriaService.registrar(
				TipoAcaoAuditoria.DENUNCIA_STATUS_ALTERADO,
				TipoAlvoAuditoria.DENUNCIA,
				denuncia.getId(),
				"Status da denuncia alterado.",
				"Status anterior: " + statusAnterior
						+ ", status novo: " + request.status()
						+ ", organizacao id: " + organizacao.getId()
		);
		if (request.status() == StatusDenuncia.CONCLUIDO) {
			notificacaoService.notificarUsuario(
					denuncia.getAutor(),
					denuncia,
					TipoNotificacao.DENUNCIA_CONCLUIDA_AGUARDANDO_CONFIRMACAO,
					"Confirme a conclusao da denuncia",
					"A organizacao responsavel marcou sua denuncia como concluida. Confirme se o problema foi resolvido.",
					"/denuncias/" + denuncia.getId()
			);
		}

		return DenunciaResponseDTO.from(denuncia);
	}

	@Transactional
	public DenunciaResponseDTO confirmarConclusao(
			Long denunciaId,
			Long usuarioId,
			FeedbackConclusaoRequestDTO request
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		exigirAutorDaDenuncia(denuncia, usuarioId);
		if (denuncia.getStatus() != StatusDenuncia.CONCLUIDO) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas denuncias concluidas podem ser confirmadas.");
		}
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		denuncia.confirmarConclusao(trimOrNull(request.feedback()));
		timelineDenunciaService.registrarConclusaoConfirmadaPeloMorador(denuncia, usuario, request.feedback());
		auditoriaService.registrar(
				TipoAcaoAuditoria.DENUNCIA_CONCLUSAO_CONFIRMADA,
				TipoAlvoAuditoria.DENUNCIA,
				denuncia.getId(),
				"Conclusao da denuncia confirmada pelo morador.",
				null
		);
		return DenunciaResponseDTO.from(denuncia);
	}

	@Transactional
	public DenunciaResponseDTO contestarConclusao(
			Long denunciaId,
			Long usuarioId,
			FeedbackConclusaoRequestDTO request
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		exigirAutorDaDenuncia(denuncia, usuarioId);
		if (denuncia.getStatus() != StatusDenuncia.CONCLUIDO) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas denuncias concluidas podem ser contestadas.");
		}
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		denuncia.contestarConclusao(trimOrNull(request.feedback()));
		timelineDenunciaService.registrarConclusaoContestadaPeloMorador(denuncia, usuario, request.feedback());
		auditoriaService.registrar(
				TipoAcaoAuditoria.DENUNCIA_CONCLUSAO_CONTESTADA,
				TipoAlvoAuditoria.DENUNCIA,
				denuncia.getId(),
				"Conclusao da denuncia contestada pelo morador.",
				null
		);
		if (denuncia.getOrganizacaoResponsavel() != null) {
			notificacaoService.notificarOrganizacao(
					denuncia.getOrganizacaoResponsavel().getId(),
					denuncia,
					TipoNotificacao.DENUNCIA_ATRIBUIDA,
					"Denuncia reaberta pelo morador",
					"O morador contestou a conclusao e a denuncia foi reaberta.",
					"/denuncias/" + denuncia.getId()
			);
		}
		return DenunciaResponseDTO.from(denuncia);
	}

	private Specification<Denuncia> montarFiltro(DenunciaFiltroDTO filtro, boolean ocultarArquivadas) {
		Specification<Denuncia> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

		if (StringUtils.hasText(filtro.cidade())) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(criteriaBuilder.lower(root.get("cidade")), filtro.cidade().trim().toLowerCase()));
		}

		if (StringUtils.hasText(filtro.bairro())) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(criteriaBuilder.lower(root.get("bairro")), filtro.bairro().trim().toLowerCase()));
		}

		if (filtro.status() != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("status"), filtro.status()));
		}

		if (filtro.categoriaId() != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("categoria").get("id"), filtro.categoriaId()));
		}

		if (filtro.organizacaoResponsavelId() != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("organizacaoResponsavel").get("id"), filtro.organizacaoResponsavelId()));
		}

		if (filtro.autorId() != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("autor").get("id"), filtro.autorId()));
		}

		if (StringUtils.hasText(filtro.termo())) {
			String termo = "%" + filtro.termo().trim().toLowerCase() + "%";
			specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.or(
					criteriaBuilder.like(criteriaBuilder.lower(root.get("titulo")), termo),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("descricao")), termo),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("cidade")), termo),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("bairro")), termo),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("rua")), termo),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("pontoReferencia")), termo),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("categoria").get("nome")), termo)
			));
		}

		if (ocultarArquivadas) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.notEqual(root.get("status"), StatusDenuncia.ARQUIVADO));
		}

		return specification;
	}

	private Denuncia buscarDenuncia(Long denunciaId) {
		return denunciaRepository.findById(denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
	}

	private Usuario buscarUsuarioAtivo(Long usuarioId) {
		return usuarioRepository.findById(usuarioId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));
	}

	private void exigirAutorDaDenuncia(Denuncia denuncia, Long usuarioId) {
		if (!denuncia.getAutor().getId().equals(usuarioId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o autor da denuncia pode validar a conclusao.");
		}
	}

	private void validarOrganizacaoResponsavel(Denuncia denuncia, Organizacao organizacao, Usuario usuario) {
		if (denuncia.getOrganizacaoResponsavel() == null) {
			return;
		}

		if (denuncia.getOrganizacaoResponsavel().getId().equals(organizacao.getId())) {
			return;
		}

		if (usuario.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			return;
		}

		boolean possuiPermissao = false;
		List<VinculoUsuarioOrganizacao> vinculos = vinculoRepository.findByUsuarioIdAndAtivoTrue(usuario.getId());
		for (VinculoUsuarioOrganizacao v : vinculos) {
			if (v.getPapel() == PapelUsuario.ADMIN_PREFEITURA) {
				Long prefeituraId = v.getOrganizacao().getId();
				Organizacao respAtual = denuncia.getOrganizacaoResponsavel();
				boolean eSubordinada = respAtual.getOrganizacaoPai() != null && respAtual.getOrganizacaoPai().getId().equals(prefeituraId);
				if (eSubordinada) {
					possuiPermissao = true;
					break;
				}
			}
		}

		if (!possuiPermissao) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organizacao informada nao e responsavel pela denuncia.");
		}
	}

	private void validarDenunciaRepetida(DenunciaCreateRequestDTO request, Long autorId, Long categoriaId) {
		antispamService.inicioJanelaDenunciaRepetida().ifPresent(inicioJanela -> {
			String cidade = request.cidade().trim();
			String bairro = request.bairro().trim();
			String assinaturaNova = antispamService.assinatura(request.titulo(), request.descricao());
			List<String> assinaturasRecentes = denunciaRepository.findRecentesParaAntispam(
							autorId,
							categoriaId,
							cidade,
							bairro,
							inicioJanela
					).stream()
					.map(denuncia -> antispamService.assinatura(denuncia.getTitulo(), denuncia.getDescricao()))
					.toList();
			antispamService.validarDenunciaNaoRepetida(assinaturaNova, assinaturasRecentes);
		});
	}

	@Transactional
	public void deletar(Long denunciaId, Long usuarioId, boolean isAdminApp) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		
		if (!denuncia.getAutor().getId().equals(usuarioId) && !isAdminApp) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o autor ou um administrador do app podem excluir esta denuncia.");
		}
		
		if (!isAdminApp && denuncia.getStatus() != StatusDenuncia.ABERTO && denuncia.getStatus() != StatusDenuncia.REABERTO) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Moradores so podem excluir denuncias em status ABERTO ou REABERTO.");
		}
		
		StatusDenuncia statusAnterior = denuncia.getStatus();
		denuncia.setStatus(StatusDenuncia.ARQUIVADO);
		denunciaRepository.save(denuncia);
		
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		timelineDenunciaService.registrarStatusAlterado(
				denuncia,
				usuario,
				denuncia.getOrganizacaoResponsavel(),
				statusAnterior,
				StatusDenuncia.ARQUIVADO,
				"Denuncia excluida pelo autor."
		);
		
		auditoriaService.registrar(
				TipoAcaoAuditoria.DENUNCIA_STATUS_ALTERADO,
				TipoAlvoAuditoria.DENUNCIA,
				denuncia.getId(),
				"Denuncia arquivada (exclusao logica).",
				"Status anterior: " + statusAnterior
		);
	}

	private String trimOrNull(String value) {
		return StringUtils.hasText(value) ? value.trim() : null;
	}

	private Page<DenunciaResponseDTO> mapearComCapas(Page<Denuncia> denuncias, boolean exporAutorId) {
		List<Long> denunciasIds = denuncias.getContent()
				.stream()
				.map(Denuncia::getId)
				.toList();
		Map<Long, Long> capas = buscarCapasPorDenuncias(denunciasIds);
		return denuncias.map(denuncia -> {
			Long anexoId = capas.get(denuncia.getId());
			String imagemCapaUrl = anexoId == null ? null : montarUrlAnexo(denuncia.getId(), anexoId);
			return DenunciaResponseDTO.from(denuncia, exporAutorId, imagemCapaUrl);
		});
	}

	private String imagemCapaUrl(Long denunciaId) {
		Map<Long, Long> capas = buscarCapasPorDenuncias(List.of(denunciaId));
		Long anexoId = capas.get(denunciaId);
		return anexoId == null ? null : montarUrlAnexo(denunciaId, anexoId);
	}

	private String montarUrlAnexo(Long denunciaId, Long anexoId) {
		return "/api/denuncias/" + denunciaId + "/anexos/" + anexoId + "/arquivo";
	}

	private Map<Long, Long> buscarCapasPorDenuncias(List<Long> denunciasIds) {
		if (denunciasIds.isEmpty()) {
			return Map.of();
		}
		return anexoRepository.buscarCapasPorDenunciasIds(denunciasIds)
				.stream()
				.collect(Collectors.toMap(
						AnexoDenunciaRepository.CapaDenunciaProjection::getDenunciaId,
						AnexoDenunciaRepository.CapaDenunciaProjection::getAnexoId,
						(anexoAtual, anexoDuplicado) -> anexoAtual
				));
	}
}
