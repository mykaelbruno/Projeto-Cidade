package com.mykael.prefeitura.core.operacional;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.notificacao.NotificacaoService;
import com.mykael.prefeitura.core.notificacao.TipoNotificacao;
import com.mykael.prefeitura.core.operacional.dto.AlterarResponsavelDenunciaRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaAprovacaoRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaCreateRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaRecusaRequestDTO;
import com.mykael.prefeitura.core.operacional.dto.SolicitacaoTransferenciaResponseDTO;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.OrganizacaoRepository;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import com.mykael.prefeitura.core.timeline.TimelineDenunciaService;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OperacionalDenunciaService {

	private final DenunciaRepository denunciaRepository;
	private final OrganizacaoRepository organizacaoRepository;
	private final UsuarioRepository usuarioRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final SolicitacaoTransferenciaDenunciaRepository solicitacaoRepository;
	private final TimelineDenunciaService timelineDenunciaService;
	private final NotificacaoService notificacaoService;
	private final AuditoriaService auditoriaService;

	public OperacionalDenunciaService(
			DenunciaRepository denunciaRepository,
			OrganizacaoRepository organizacaoRepository,
			UsuarioRepository usuarioRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			SolicitacaoTransferenciaDenunciaRepository solicitacaoRepository,
			TimelineDenunciaService timelineDenunciaService,
			NotificacaoService notificacaoService,
			AuditoriaService auditoriaService
	) {
		this.denunciaRepository = denunciaRepository;
		this.organizacaoRepository = organizacaoRepository;
		this.usuarioRepository = usuarioRepository;
		this.vinculoRepository = vinculoRepository;
		this.solicitacaoRepository = solicitacaoRepository;
		this.timelineDenunciaService = timelineDenunciaService;
		this.notificacaoService = notificacaoService;
		this.auditoriaService = auditoriaService;
	}

	@Transactional(readOnly = true)
	public Page<DenunciaResponseDTO> listarDenunciasDaOrganizacao(
			Long organizacaoId,
			Long usuarioId,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId,
			Pageable pageable
	) {
		Organizacao organizacao = buscarOrganizacaoAtiva(organizacaoId);
		if (organizacao.getTipo() == TipoOrganizacao.PREFEITURA) {
			exigirAdminPrefeitura(usuarioId, organizacao.getId());
			return denunciaRepository.findAll(
							filtroDenunciasDaPrefeitura(organizacao.getId(), organizacao.getCidade(), cidade, bairro, status, categoriaId),
							pageable
					)
					.map(DenunciaResponseDTO::from);
		}

		exigirVinculoAtivo(usuarioId, organizacao.getId());
		return denunciaRepository.findAll(
						filtroDenunciasDaSecretaria(organizacao.getId(), cidade, bairro, status, categoriaId),
						pageable
				)
				.map(DenunciaResponseDTO::from);
	}

	@Transactional
	public SolicitacaoTransferenciaResponseDTO solicitarTransferencia(
			Long denunciaId,
			Long usuarioId,
			SolicitacaoTransferenciaCreateRequestDTO request
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		Organizacao origem = denuncia.getOrganizacaoResponsavel();
		if (origem == null || origem.getTipo() != TipoOrganizacao.SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Denuncia precisa estar sob responsabilidade de uma secretaria.");
		}
		exigirVinculoAtivo(usuarioId, origem.getId());

		if (solicitacaoRepository.existsByDenunciaIdAndStatus(denunciaId, StatusSolicitacaoTransferencia.PENDENTE)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Denuncia ja possui solicitacao de transferencia pendente.");
		}

		Organizacao prefeitura = origem.getOrganizacaoPai();
		if (prefeitura == null || prefeitura.getTipo() != TipoOrganizacao.PREFEITURA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria sem prefeitura vinculada.");
		}

		Organizacao destinoSugerido = null;
		if (request.organizacaoDestinoSugeridaId() != null) {
			destinoSugerido = buscarSecretariaDaPrefeitura(request.organizacaoDestinoSugeridaId(), prefeitura.getId());
			if (destinoSugerido.getId().equals(origem.getId())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Destino sugerido deve ser diferente da secretaria atual.");
			}
		}

		SolicitacaoTransferenciaDenuncia solicitacao = new SolicitacaoTransferenciaDenuncia();
		solicitacao.setDenuncia(denuncia);
		solicitacao.setPrefeitura(prefeitura);
		solicitacao.setOrganizacaoOrigem(origem);
		solicitacao.setOrganizacaoDestinoSugerida(destinoSugerido);
		solicitacao.setSolicitadoPor(usuario);
		solicitacao.setMotivo(request.motivo().trim());

		SolicitacaoTransferenciaDenuncia salva = solicitacaoRepository.save(solicitacao);
		timelineDenunciaService.registrarTransferenciaSolicitada(denuncia, usuario, origem, destinoSugerido, request.motivo());
		auditoriaService.registrar(
				TipoAcaoAuditoria.TRANSFERENCIA_SOLICITADA,
				TipoAlvoAuditoria.SOLICITACAO_TRANSFERENCIA,
				salva.getId(),
				"Transferencia de denuncia solicitada.",
				"Denuncia id: " + denuncia.getId()
						+ ", origem id: " + origem.getId()
						+ ", destino sugerido id: " + (destinoSugerido == null ? "nao informado" : destinoSugerido.getId())
		);
		notificacaoService.notificarOrganizacao(
				prefeitura.getId(),
				denuncia,
				TipoNotificacao.TRANSFERENCIA_SOLICITADA,
				"Solicitacao de transferencia",
				"Uma secretaria solicitou transferencia de responsabilidade de uma denuncia.",
				"/operacional/solicitacoes-transferencia/" + salva.getId()
		);
		return SolicitacaoTransferenciaResponseDTO.from(salva);
	}

	@Transactional(readOnly = true)
	public Page<SolicitacaoTransferenciaResponseDTO> listarSolicitacoesDaPrefeitura(
			Long prefeituraId,
			Long usuarioId,
			StatusSolicitacaoTransferencia status,
			Pageable pageable
	) {
		Organizacao prefeitura = buscarPrefeitura(prefeituraId);
		exigirAdminPrefeitura(usuarioId, prefeitura.getId());
		StatusSolicitacaoTransferencia statusFiltro = status == null ? StatusSolicitacaoTransferencia.PENDENTE : status;
		return solicitacaoRepository.findByPrefeituraIdAndStatus(prefeitura.getId(), statusFiltro, pageable)
				.map(SolicitacaoTransferenciaResponseDTO::from);
	}

	@Transactional
	public SolicitacaoTransferenciaResponseDTO aprovarTransferencia(
			Long solicitacaoId,
			Long usuarioId,
			SolicitacaoTransferenciaAprovacaoRequestDTO request
	) {
		SolicitacaoTransferenciaDenuncia solicitacao = buscarSolicitacaoPendente(solicitacaoId);
		Usuario avaliador = buscarUsuarioAtivo(usuarioId);
		exigirAdminPrefeitura(usuarioId, solicitacao.getPrefeitura().getId());

		Long destinoId = request.organizacaoDestinoId() != null
				? request.organizacaoDestinoId()
				: solicitacao.getOrganizacaoDestinoSugerida() == null ? null : solicitacao.getOrganizacaoDestinoSugerida().getId();
		if (destinoId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao de destino e obrigatoria para aprovar a transferencia.");
		}
		Organizacao destino = buscarSecretariaDaPrefeitura(destinoId, solicitacao.getPrefeitura().getId());

		solicitacao.getDenuncia().setOrganizacaoResponsavel(destino);
		solicitacao.setStatus(StatusSolicitacaoTransferencia.APROVADA);
		solicitacao.setAvaliadoPor(avaliador);
		solicitacao.setOrganizacaoDestinoFinal(destino);
		solicitacao.setMotivoDecisao(trimOrNull(request.motivo()));
		solicitacao.setAvaliadoEm(Instant.now());
		timelineDenunciaService.registrarTransferenciaAprovada(solicitacao.getDenuncia(), avaliador, destino, request.motivo());
		auditoriaService.registrar(
				TipoAcaoAuditoria.TRANSFERENCIA_APROVADA,
				TipoAlvoAuditoria.SOLICITACAO_TRANSFERENCIA,
				solicitacao.getId(),
				"Transferencia de denuncia aprovada.",
				"Denuncia id: " + solicitacao.getDenuncia().getId() + ", destino final id: " + destino.getId()
		);
		notificacaoService.notificarOrganizacao(
				solicitacao.getOrganizacaoOrigem().getId(),
				solicitacao.getDenuncia(),
				TipoNotificacao.TRANSFERENCIA_APROVADA,
				"Transferencia aprovada",
				"A prefeitura aprovou a transferencia de uma denuncia.",
				"/denuncias/" + solicitacao.getDenuncia().getId()
		);
		notificacaoService.notificarOrganizacao(
				destino.getId(),
				solicitacao.getDenuncia(),
				TipoNotificacao.DENUNCIA_ATRIBUIDA,
				"Denuncia atribuida",
				"Uma denuncia foi transferida para sua secretaria.",
				"/denuncias/" + solicitacao.getDenuncia().getId()
		);

		return SolicitacaoTransferenciaResponseDTO.from(solicitacao);
	}

	@Transactional
	public SolicitacaoTransferenciaResponseDTO recusarTransferencia(
			Long solicitacaoId,
			Long usuarioId,
			SolicitacaoTransferenciaRecusaRequestDTO request
	) {
		SolicitacaoTransferenciaDenuncia solicitacao = buscarSolicitacaoPendente(solicitacaoId);
		Usuario avaliador = buscarUsuarioAtivo(usuarioId);
		exigirAdminPrefeitura(usuarioId, solicitacao.getPrefeitura().getId());

		solicitacao.setStatus(StatusSolicitacaoTransferencia.RECUSADA);
		solicitacao.setAvaliadoPor(avaliador);
		solicitacao.setMotivoDecisao(request.motivo().trim());
		solicitacao.setAvaliadoEm(Instant.now());
		timelineDenunciaService.registrarTransferenciaRecusada(solicitacao.getDenuncia(), avaliador, request.motivo());
		auditoriaService.registrar(
				TipoAcaoAuditoria.TRANSFERENCIA_RECUSADA,
				TipoAlvoAuditoria.SOLICITACAO_TRANSFERENCIA,
				solicitacao.getId(),
				"Transferencia de denuncia recusada.",
				"Denuncia id: " + solicitacao.getDenuncia().getId()
		);
		notificacaoService.notificarOrganizacao(
				solicitacao.getOrganizacaoOrigem().getId(),
				solicitacao.getDenuncia(),
				TipoNotificacao.TRANSFERENCIA_RECUSADA,
				"Transferencia recusada",
				"A prefeitura recusou a solicitacao de transferencia de uma denuncia.",
				"/denuncias/" + solicitacao.getDenuncia().getId()
		);

		return SolicitacaoTransferenciaResponseDTO.from(solicitacao);
	}

	@Transactional
	public DenunciaResponseDTO alterarResponsavelPelaPrefeitura(
			Long denunciaId,
			Long usuarioId,
			AlterarResponsavelDenunciaRequestDTO request
	) {
		Denuncia denuncia = buscarDenuncia(denunciaId);
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		Organizacao destino = buscarOrganizacaoAtiva(request.organizacaoDestinoId());
		if (destino.getTipo() != TipoOrganizacao.SECRETARIA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao destino deve ser uma secretaria.");
		}
		Long prefeituraId = identificarPrefeituraDoDestino(destino);
		exigirAdminPrefeitura(usuarioId, prefeituraId);
		validarMesmaPrefeituraQuandoPossivel(denuncia, prefeituraId);

		denuncia.setOrganizacaoResponsavel(destino);
		timelineDenunciaService.registrarResponsavelAlteradoPelaPrefeitura(
				denuncia,
				usuario,
				destino,
				request.motivo()
		);
		auditoriaService.registrar(
				TipoAcaoAuditoria.RESPONSAVEL_DENUNCIA_ALTERADO,
				TipoAlvoAuditoria.DENUNCIA,
				denuncia.getId(),
				"Responsavel da denuncia alterado pela prefeitura.",
				"Organizacao destino id: " + destino.getId()
		);
		notificacaoService.notificarOrganizacao(
				destino.getId(),
				denuncia,
				TipoNotificacao.DENUNCIA_ATRIBUIDA,
				"Denuncia atribuida",
				"A prefeitura atribuiu uma denuncia para sua secretaria.",
				"/denuncias/" + denuncia.getId()
		);
		return DenunciaResponseDTO.from(denuncia);
	}

	private SolicitacaoTransferenciaDenuncia buscarSolicitacaoPendente(Long solicitacaoId) {
		return solicitacaoRepository.findByIdAndStatus(solicitacaoId, StatusSolicitacaoTransferencia.PENDENTE)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Solicitacao pendente nao encontrada."));
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

	private Organizacao buscarOrganizacaoAtiva(Long organizacaoId) {
		return organizacaoRepository.findById(organizacaoId)
				.filter(Organizacao::isAtiva)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organizacao ativa nao encontrada."));
	}

	private Organizacao buscarPrefeitura(Long prefeituraId) {
		Organizacao prefeitura = buscarOrganizacaoAtiva(prefeituraId);
		if (prefeitura.getTipo() != TipoOrganizacao.PREFEITURA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organizacao informada nao e uma prefeitura.");
		}
		return prefeitura;
	}

	private Organizacao buscarSecretariaDaPrefeitura(Long secretariaId, Long prefeituraId) {
		Organizacao secretaria = buscarOrganizacaoAtiva(secretariaId);
		if (secretaria.getTipo() != TipoOrganizacao.SECRETARIA
				|| secretaria.getOrganizacaoPai() == null
				|| !secretaria.getOrganizacaoPai().getId().equals(prefeituraId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria nao pertence a prefeitura informada.");
		}
		return secretaria;
	}

	private void exigirAdminPrefeitura(Long usuarioId, Long prefeituraId) {
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		if (usuario.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			return;
		}
		boolean possuiVinculo = vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndPapelAndAtivoTrue(
				usuarioId,
				prefeituraId,
				PapelUsuario.ADMIN_PREFEITURA
		);
		if (!possuiVinculo) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui permissao sobre esta prefeitura.");
		}
	}

	private void exigirVinculoAtivo(Long usuarioId, Long organizacaoId) {
		Usuario usuario = buscarUsuarioAtivo(usuarioId);
		if (usuario.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			return;
		}
		if (!vinculoRepository.existsByUsuarioIdAndOrganizacaoIdAndAtivoTrue(usuarioId, organizacaoId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuario nao possui vinculo ativo com a organizacao informada.");
		}
	}

	private Long identificarPrefeituraDoDestino(Organizacao destino) {
		if (destino.getTipo() == TipoOrganizacao.PREFEITURA) {
			return destino.getId();
		}
		if (destino.getOrganizacaoPai() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Secretaria sem prefeitura vinculada.");
		}
		return destino.getOrganizacaoPai().getId();
	}

	private void validarMesmaPrefeituraQuandoPossivel(Denuncia denuncia, Long prefeituraDestinoId) {
		Organizacao atual = denuncia.getOrganizacaoResponsavel();
		if (atual == null) {
			return;
		}
		Long prefeituraAtualId = identificarPrefeituraDoDestino(atual);
		if (!prefeituraAtualId.equals(prefeituraDestinoId)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Transferencia entre prefeituras ainda nao esta definida.");
		}
	}

	private Specification<Denuncia> filtroDenunciasDaPrefeitura(
			Long prefeituraId,
			String prefeituraCidade,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId
	) {
		Specification<Denuncia> specification = (root, query, criteriaBuilder) -> {
			var organizacao = root.join("organizacaoResponsavel", jakarta.persistence.criteria.JoinType.LEFT);
			var prefeitura = organizacao.join("organizacaoPai", jakarta.persistence.criteria.JoinType.LEFT);
			
			var atribuido = criteriaBuilder.or(
					criteriaBuilder.equal(organizacao.get("id"), prefeituraId),
					criteriaBuilder.equal(prefeitura.get("id"), prefeituraId)
			);
			
			var abertoNaCidade = criteriaBuilder.and(
					criteriaBuilder.equal(root.get("status"), StatusDenuncia.ABERTO),
					criteriaBuilder.equal(criteriaBuilder.lower(root.get("cidade")), prefeituraCidade.trim().toLowerCase())
			);
			
			return criteriaBuilder.or(atribuido, abertoNaCidade);
		};
		return specification.and(filtrosBasicos(cidade, bairro, status, categoriaId));
	}

	private Specification<Denuncia> filtroDenunciasDaSecretaria(
			Long secretariaId,
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId
	) {
		Specification<Denuncia> specification = (root, query, criteriaBuilder) ->
				criteriaBuilder.equal(root.get("organizacaoResponsavel").get("id"), secretariaId);
		return specification.and(filtrosBasicos(cidade, bairro, status, categoriaId));
	}

	private Specification<Denuncia> filtrosBasicos(
			String cidade,
			String bairro,
			StatusDenuncia status,
			Long categoriaId
	) {
		Specification<Denuncia> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

		if (StringUtils.hasText(cidade)) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(criteriaBuilder.lower(root.get("cidade")), cidade.trim().toLowerCase()));
		}

		if (StringUtils.hasText(bairro)) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(criteriaBuilder.lower(root.get("bairro")), bairro.trim().toLowerCase()));
		}

		if (status != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("status"), status));
		}

		if (categoriaId != null) {
			specification = specification.and((root, query, criteriaBuilder) ->
					criteriaBuilder.equal(root.get("categoria").get("id"), categoriaId));
		}

		return specification;
	}

	private String trimOrNull(String value) {
		return StringUtils.hasText(value) ? value.trim() : null;
	}
}
