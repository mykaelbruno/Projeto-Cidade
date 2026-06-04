package com.mykael.prefeitura.core.notificacao;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.notificacao.dto.NotificacaoResponseDTO;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacaoRepository;
import com.mykael.prefeitura.infra.email.EmailService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificacaoService {

	private final NotificacaoRepository notificacaoRepository;
	private final UsuarioRepository usuarioRepository;
	private final VinculoUsuarioOrganizacaoRepository vinculoRepository;
	private final EmailService emailService;

	public NotificacaoService(
			NotificacaoRepository notificacaoRepository,
			UsuarioRepository usuarioRepository,
			VinculoUsuarioOrganizacaoRepository vinculoRepository,
			EmailService emailService
	) {
		this.notificacaoRepository = notificacaoRepository;
		this.usuarioRepository = usuarioRepository;
		this.vinculoRepository = vinculoRepository;
		this.emailService = emailService;
	}

	@Transactional
	public void notificarUsuario(
			Usuario usuario,
			Denuncia denuncia,
			TipoNotificacao tipo,
			String titulo,
			String mensagem,
			String link
	) {
		Notificacao notificacao = new Notificacao();
		notificacao.setUsuario(usuario);
		notificacao.setDenuncia(denuncia);
		notificacao.setTipo(tipo);
		notificacao.setTitulo(titulo);
		notificacao.setMensagem(mensagem);
		notificacao.setLink(link);
		Notificacao salva = notificacaoRepository.save(notificacao);
		emailService.enviarNotificacao(usuario, salva);
	}

	@Transactional
	public void notificarUsuarios(
			Collection<Usuario> usuarios,
			Denuncia denuncia,
			TipoNotificacao tipo,
			String titulo,
			String mensagem,
			String link
	) {
		var unicos = new LinkedHashMap<Long, Usuario>();
		usuarios.stream()
				.filter(Usuario::isAtivo)
				.forEach(usuario -> unicos.put(usuario.getId(), usuario));
		unicos.values().forEach(usuario -> notificarUsuario(usuario, denuncia, tipo, titulo, mensagem, link));
	}

	@Transactional
	public void notificarOrganizacao(
			Long organizacaoId,
			Denuncia denuncia,
			TipoNotificacao tipo,
			String titulo,
			String mensagem,
			String link
	) {
		List<Usuario> usuarios = vinculoRepository.findByOrganizacaoIdAndAtivoTrue(organizacaoId)
				.stream()
				.map(VinculoUsuarioOrganizacao::getUsuario)
				.toList();
		notificarUsuarios(usuarios, denuncia, tipo, titulo, mensagem, link);
	}

	@Transactional
	public void notificarModeradores(
			Denuncia denuncia,
			TipoNotificacao tipo,
			String titulo,
			String mensagem,
			String link
	) {
		List<Usuario> usuarios = new ArrayList<>();
		usuarios.addAll(usuarioRepository.findByPerfilGlobalAndAtivoTrue(PerfilUsuario.MODERADOR));
		usuarios.addAll(usuarioRepository.findByPerfilGlobalAndAtivoTrue(PerfilUsuario.ADMIN_APP));
		notificarUsuarios(usuarios, denuncia, tipo, titulo, mensagem, link);
	}

	@Transactional(readOnly = true)
	public Page<NotificacaoResponseDTO> listarMinhas(Long usuarioId, boolean somenteNaoLidas, Pageable pageable) {
		Page<Notificacao> notificacoes = somenteNaoLidas
				? notificacaoRepository.findByUsuarioIdAndLidaEmIsNull(usuarioId, pageable)
				: notificacaoRepository.findByUsuarioId(usuarioId, pageable);
		return notificacoes.map(NotificacaoResponseDTO::from);
	}

	@Transactional
	public NotificacaoResponseDTO marcarComoLida(Long notificacaoId, Long usuarioId) {
		Notificacao notificacao = notificacaoRepository.findByIdAndUsuarioId(notificacaoId, usuarioId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificacao nao encontrada."));
		if (notificacao.getLidaEm() == null) {
			notificacao.setLidaEm(Instant.now());
		}
		return NotificacaoResponseDTO.from(notificacao);
	}

	@Transactional
	public int marcarTodasComoLidas(Long usuarioId) {
		return notificacaoRepository.marcarTodasComoLidas(usuarioId, Instant.now());
	}
}
