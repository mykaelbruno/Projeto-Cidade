package com.mykael.prefeitura.core.sinalizacao;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.notificacao.NotificacaoService;
import com.mykael.prefeitura.core.notificacao.TipoNotificacao;
import com.mykael.prefeitura.core.sinalizacao.dto.SinalizacaoDenunciaRequestDTO;
import com.mykael.prefeitura.core.sinalizacao.dto.SinalizacaoDenunciaResponseDTO;
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
public class SinalizacaoDenunciaService {

	private final SinalizacaoDenunciaRepository sinalizacaoRepository;
	private final DenunciaRepository denunciaRepository;
	private final UsuarioRepository usuarioRepository;
	private final NotificacaoService notificacaoService;
	private final AuditoriaService auditoriaService;

	public SinalizacaoDenunciaService(
			SinalizacaoDenunciaRepository sinalizacaoRepository,
			DenunciaRepository denunciaRepository,
			UsuarioRepository usuarioRepository,
			NotificacaoService notificacaoService,
			AuditoriaService auditoriaService
	) {
		this.sinalizacaoRepository = sinalizacaoRepository;
		this.denunciaRepository = denunciaRepository;
		this.usuarioRepository = usuarioRepository;
		this.notificacaoService = notificacaoService;
		this.auditoriaService = auditoriaService;
	}

	@Transactional
	public SinalizacaoDenunciaResponseDTO sinalizar(Long denunciaId, Long autorId, SinalizacaoDenunciaRequestDTO request) {
		Denuncia denuncia = denunciaRepository.findById(denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
		Usuario autor = usuarioRepository.findById(autorId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));

		if (sinalizacaoRepository.existsByDenunciaIdAndAutorId(denunciaId, autorId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuario ja sinalizou esta denuncia.");
		}

		SinalizacaoDenuncia sinalizacao = new SinalizacaoDenuncia();
		sinalizacao.setDenuncia(denuncia);
		sinalizacao.setAutor(autor);
		sinalizacao.setMotivo(request.motivo());
		sinalizacao.setComentario(request.comentario().trim());
		SinalizacaoDenuncia salva = sinalizacaoRepository.save(sinalizacao);
		auditoriaService.registrar(
				TipoAcaoAuditoria.SINALIZACAO_CRIADA,
				TipoAlvoAuditoria.SINALIZACAO,
				salva.getId(),
				"Sinalizacao de denuncia criada.",
				"Denuncia id: " + denuncia.getId()
		);
		notificacaoService.notificarModeradores(
				denuncia,
				TipoNotificacao.SINALIZACAO_DENUNCIA_RECEBIDA,
				"Nova sinalizacao de denuncia",
				"Uma denuncia recebeu sinalizacao e precisa de revisao.",
				"/moderacao/sinalizacoes/" + salva.getId()
		);
		return SinalizacaoDenunciaResponseDTO.from(salva);
	}

	@Transactional(readOnly = true)
	public Page<SinalizacaoDenunciaResponseDTO> listar(StatusSinalizacaoDenuncia status, Pageable pageable) {
		StatusSinalizacaoDenuncia statusFiltro = status == null ? StatusSinalizacaoDenuncia.PENDENTE : status;
		return sinalizacaoRepository.findByStatus(statusFiltro, pageable)
				.map(SinalizacaoDenunciaResponseDTO::from);
	}

	@Transactional
	public SinalizacaoDenunciaResponseDTO marcarComoAnalisada(Long sinalizacaoId, Long moderadorId) {
		SinalizacaoDenuncia sinalizacao = sinalizacaoRepository
				.findByIdAndStatus(sinalizacaoId, StatusSinalizacaoDenuncia.PENDENTE)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sinalizacao pendente nao encontrada."));
		Usuario moderador = usuarioRepository.findById(moderadorId)
				.filter(Usuario::isAtivo)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario autenticado nao encontrado ou inativo."));

		sinalizacao.setStatus(StatusSinalizacaoDenuncia.ANALISADA);
		sinalizacao.setAnalisadoPor(moderador);
		sinalizacao.setAnalisadoEm(Instant.now());
		auditoriaService.registrar(
				TipoAcaoAuditoria.SINALIZACAO_ANALISADA,
				TipoAlvoAuditoria.SINALIZACAO,
				sinalizacao.getId(),
				"Sinalizacao de denuncia marcada como analisada.",
				"Denuncia id: " + sinalizacao.getDenuncia().getId()
		);
		return SinalizacaoDenunciaResponseDTO.from(sinalizacao);
	}
}
