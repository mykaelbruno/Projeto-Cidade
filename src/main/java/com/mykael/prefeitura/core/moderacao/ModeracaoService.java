package com.mykael.prefeitura.core.moderacao;

import com.mykael.prefeitura.core.comentario.Comentario;
import com.mykael.prefeitura.core.comentario.ComentarioRepository;
import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.moderacao.dto.ModeracaoRequestDTO;
import com.mykael.prefeitura.core.moderacao.dto.ModeracaoResponseDTO;
import com.mykael.prefeitura.core.notificacao.NotificacaoService;
import com.mykael.prefeitura.core.notificacao.TipoNotificacao;
import com.mykael.prefeitura.core.timeline.TimelineDenunciaService;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaService;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ModeracaoService {

	private final ModeracaoRepository moderacaoRepository;
	private final DenunciaRepository denunciaRepository;
	private final ComentarioRepository comentarioRepository;
	private final UsuarioRepository usuarioRepository;
	private final TimelineDenunciaService timelineDenunciaService;
	private final AuditoriaService auditoriaService;
	private final NotificacaoService notificacaoService;

	public ModeracaoService(
			ModeracaoRepository moderacaoRepository,
			DenunciaRepository denunciaRepository,
			ComentarioRepository comentarioRepository,
			UsuarioRepository usuarioRepository,
			TimelineDenunciaService timelineDenunciaService,
			AuditoriaService auditoriaService,
			NotificacaoService notificacaoService
	) {
		this.moderacaoRepository = moderacaoRepository;
		this.denunciaRepository = denunciaRepository;
		this.comentarioRepository = comentarioRepository;
		this.usuarioRepository = usuarioRepository;
		this.timelineDenunciaService = timelineDenunciaService;
		this.auditoriaService = auditoriaService;
		this.notificacaoService = notificacaoService;
	}

	@Transactional
	public ModeracaoResponseDTO arquivarDenuncia(Long denunciaId, Long moderadorId, ModeracaoRequestDTO request) {
		Denuncia denuncia = denunciaRepository.findById(denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
		Usuario moderador = buscarModeradorAtivo(moderadorId);

		if (denuncia.getStatus() == StatusDenuncia.ARQUIVADO) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Denuncia ja esta arquivada.");
		}

		denuncia.setStatus(StatusDenuncia.ARQUIVADO);
		Moderacao moderacao = new Moderacao();
		moderacao.setTipoAlvo(TipoAlvoModeracao.DENUNCIA);
		moderacao.setDenuncia(denuncia);
		moderacao.setModerador(moderador);
		moderacao.setMotivo(request.motivo().trim());

		Moderacao salva = moderacaoRepository.save(moderacao);
		timelineDenunciaService.registrarDenunciaArquivadaPorModeracao(denuncia, moderador, request.motivo());
		
		notificacaoService.notificarUsuario(
				denuncia.getAutor(),
				denuncia,
				TipoNotificacao.MODERACAO_DENUNCIA_ARQUIVADA,
				"Relato Arquivado pela Moderação",
				"O seu relato \"" + denuncia.getTitulo() + "\" foi arquivado pela moderação. Motivo: " + request.motivo(),
				"/denuncias/" + denuncia.getId()
		);

		auditoriaService.registrar(
				TipoAcaoAuditoria.DENUNCIA_ARQUIVADA_MODERACAO,
				TipoAlvoAuditoria.DENUNCIA,
				denuncia.getId(),
				"Denuncia arquivada pela moderacao.",
				"Moderacao id: " + salva.getId()
		);
		return ModeracaoResponseDTO.from(salva);
	}

	@Transactional
	public ModeracaoResponseDTO removerComentario(Long comentarioId, Long moderadorId, ModeracaoRequestDTO request) {
		Comentario comentario = comentarioRepository.findById(comentarioId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario nao encontrado."));
		Usuario moderador = buscarModeradorAtivo(moderadorId);

		if (comentario.getRemovidoEm() != null) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Comentario ja foi removido.");
		}

		comentario.setRemovidoEm(Instant.now());
		comentario.getDenuncia().decrementarComentarios();

		Moderacao moderacao = new Moderacao();
		moderacao.setTipoAlvo(TipoAlvoModeracao.COMENTARIO);
		moderacao.setDenuncia(comentario.getDenuncia());
		moderacao.setComentario(comentario);
		moderacao.setModerador(moderador);
		moderacao.setMotivo(request.motivo().trim());

		Moderacao salva = moderacaoRepository.save(moderacao);
		timelineDenunciaService.registrarComentarioRemovidoPorModeracao(
				comentario.getDenuncia(),
				moderador,
				request.motivo()
		);

		notificacaoService.notificarUsuario(
				comentario.getAutor(),
				comentario.getDenuncia(),
				TipoNotificacao.MODERACAO_COMENTARIO_REMOVIDO,
				"Comentário Removido pela Moderação",
				"Um comentário seu na denúncia \"" + comentario.getDenuncia().getTitulo() + "\" foi removido por violar as diretrizes. Motivo: " + request.motivo(),
				"/denuncias/" + comentario.getDenuncia().getId()
		);

		auditoriaService.registrar(
				TipoAcaoAuditoria.COMENTARIO_REMOVIDO_MODERACAO,
				TipoAlvoAuditoria.COMENTARIO,
				comentario.getId(),
				"Comentario removido pela moderacao.",
				"Denuncia id: " + comentario.getDenuncia().getId() + ", moderacao id: " + salva.getId()
		);
		return ModeracaoResponseDTO.from(salva);
	}

	@Transactional
	public ModeracaoResponseDTO advertirUsuario(Long usuarioId, Long moderadorId, ModeracaoRequestDTO request) {
		Usuario moderador = buscarModeradorAtivo(moderadorId);
		Usuario usuario = buscarUsuario(usuarioId);
		validarModeracaoDeUsuario(moderador, usuario, false);

		Moderacao salva = registrarModeracaoUsuario(
				usuario,
				moderador,
				AcaoModeracaoUsuario.ADVERTENCIA,
				request.motivo().trim()
		);

		notificacaoService.notificarUsuario(
				usuario,
				null,
				TipoNotificacao.MODERACAO_USUARIO_ADVERTIDO,
				"Notificação de Advertência",
				"A sua conta recebeu uma advertência formal da moderação por comportamento inadequado. Motivo: " + request.motivo(),
				null
		);

		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_ADVERTIDO_MODERACAO,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Usuario advertido pela moderacao.",
				"Moderacao id: " + salva.getId()
		);
		return ModeracaoResponseDTO.from(salva);
	}

	@Transactional
	public ModeracaoResponseDTO suspenderUsuario(Long usuarioId, Long moderadorId, ModeracaoRequestDTO request) {
		Usuario moderador = buscarModeradorAtivo(moderadorId);
		Usuario usuario = buscarUsuario(usuarioId);
		validarModeracaoDeUsuario(moderador, usuario, true);

		if (!usuario.isAtivo()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja esta suspenso ou inativo.");
		}

		usuario.setAtivo(false);
		Moderacao salva = registrarModeracaoUsuario(
				usuario,
				moderador,
				AcaoModeracaoUsuario.SUSPENSAO,
				request.motivo().trim()
		);

		notificacaoService.notificarUsuario(
				usuario,
				null,
				TipoNotificacao.MODERACAO_USUARIO_SUSPENSO,
				"Sua Conta foi Suspensa",
				"A sua conta foi suspensa temporariamente por infração às diretrizes do Cidade Ativa. Motivo: " + request.motivo(),
				null
		);

		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_SUSPENSO_MODERACAO,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Usuario suspenso pela moderacao.",
				"Moderacao id: " + salva.getId()
		);
		return ModeracaoResponseDTO.from(salva);
	}

	@Transactional
	public ModeracaoResponseDTO reativarUsuario(Long usuarioId, Long moderadorId, ModeracaoRequestDTO request) {
		Usuario moderador = buscarModeradorAtivo(moderadorId);
		Usuario usuario = buscarUsuario(usuarioId);
		validarModeracaoDeUsuario(moderador, usuario, false);

		if (usuario.isAtivo()) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja esta ativo.");
		}

		usuario.setAtivo(true);
		Moderacao salva = registrarModeracaoUsuario(
				usuario,
				moderador,
				AcaoModeracaoUsuario.REATIVACAO,
				request.motivo().trim()
		);

		notificacaoService.notificarUsuario(
				usuario,
				null,
				TipoNotificacao.MODERACAO_USUARIO_REATIVADO,
				"Sua Conta foi Reativada!",
				"Excelente! A sua conta foi reativada e restabelecida no Cidade Ativa. Seja bem-vindo de volta!",
				null
		);

		auditoriaService.registrar(
				TipoAcaoAuditoria.USUARIO_REATIVADO_MODERACAO,
				TipoAlvoAuditoria.USUARIO,
				usuario.getId(),
				"Usuario reativado pela moderacao.",
				"Moderacao id: " + salva.getId()
		);
		return ModeracaoResponseDTO.from(salva);
	}

	@Transactional(readOnly = true)
	public Page<ModeracaoResponseDTO> listarHistoricoUsuario(Long usuarioId, Pageable pageable) {
		if (!usuarioRepository.existsById(usuarioId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado.");
		}
		return moderacaoRepository.findByUsuarioAlvoIdOrderByCriadoEmDesc(usuarioId, pageable)
				.map(ModeracaoResponseDTO::from);
	}

	private Usuario buscarModeradorAtivo(Long moderadorId) {
		return usuarioRepository.findById(moderadorId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));
	}

	private Usuario buscarUsuario(Long usuarioId) {
		return usuarioRepository.findById(usuarioId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado."));
	}

	private Moderacao registrarModeracaoUsuario(
			Usuario usuario,
			Usuario moderador,
			AcaoModeracaoUsuario acao,
			String motivo
	) {
		Moderacao moderacao = new Moderacao();
		moderacao.setTipoAlvo(TipoAlvoModeracao.USUARIO);
		moderacao.setUsuarioAlvo(usuario);
		moderacao.setAcaoUsuario(acao);
		moderacao.setModerador(moderador);
		moderacao.setMotivo(motivo);
		return moderacaoRepository.save(moderacao);
	}

	private void validarModeracaoDeUsuario(Usuario moderador, Usuario usuario, boolean suspensao) {
		if (moderador.getId().equals(usuario.getId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario nao pode moderar a propria conta.");
		}
		if (moderador.getPerfilGlobal() != PerfilUsuario.ADMIN_APP
				&& usuario.getPerfilGlobal() != PerfilUsuario.MORADOR) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas ADMIN_APP pode moderar contas administrativas ou moderadores.");
		}
		if (suspensao && usuario.getPerfilGlobal() == PerfilUsuario.ADMIN_APP) {
			long adminsAtivos = usuarioRepository.countByPerfilGlobalAndAtivoTrue(PerfilUsuario.ADMIN_APP);
			if (adminsAtivos <= 1) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nao e permitido suspender o ultimo ADMIN_APP ativo.");
			}
		}
	}
}
