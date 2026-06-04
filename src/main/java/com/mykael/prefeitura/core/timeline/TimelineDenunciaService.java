package com.mykael.prefeitura.core.timeline;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.DenunciaRepository;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.denuncia.VisibilidadeDenunciaService;
import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.timeline.dto.TimelineDenunciaResponseDTO;
import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TimelineDenunciaService {

	private final TimelineDenunciaRepository timelineRepository;
	private final DenunciaRepository denunciaRepository;
	private final VisibilidadeDenunciaService visibilidadeDenunciaService;

	public TimelineDenunciaService(
			TimelineDenunciaRepository timelineRepository,
			DenunciaRepository denunciaRepository,
			VisibilidadeDenunciaService visibilidadeDenunciaService
	) {
		this.timelineRepository = timelineRepository;
		this.denunciaRepository = denunciaRepository;
		this.visibilidadeDenunciaService = visibilidadeDenunciaService;
	}

	@Transactional
	public void registrarDenunciaCriada(Denuncia denuncia, Usuario usuario) {
		registrar(
				denuncia,
				TipoEventoTimeline.DENUNCIA_CRIADA,
				"Denuncia criada pelo morador.",
				usuario,
				null,
				true
		);
	}

	@Transactional
	public void registrarComentarioAdicionado(Denuncia denuncia, Usuario usuario) {
		registrar(
				denuncia,
				TipoEventoTimeline.COMENTARIO_ADICIONADO,
				"Comentario adicionado por morador.",
				usuario,
				null,
				false
		);
	}

	@Transactional
	public void registrarRespostaOficial(Denuncia denuncia, Usuario usuario, Organizacao organizacao) {
		registrar(
				denuncia,
				TipoEventoTimeline.RESPOSTA_OFICIAL_PUBLICADA,
				"Resposta oficial publicada.",
				usuario,
				organizacao,
				true
		);
	}

	@Transactional
	public void registrarStatusAlterado(
			Denuncia denuncia,
			Usuario usuario,
			Organizacao organizacao,
			StatusDenuncia statusAnterior,
			StatusDenuncia statusNovo,
			String motivo
	) {
		registrar(
				denuncia,
				TipoEventoTimeline.STATUS_ALTERADO,
				montarDescricaoStatusAlterado(statusAnterior, statusNovo, motivo),
				usuario,
				organizacao,
				true
		);
	}

	@Transactional
	public void registrarAnexoAdicionado(Denuncia denuncia, Usuario usuario) {
		registrar(
				denuncia,
				TipoEventoTimeline.ANEXO_ADICIONADO,
				"Anexo adicionado pelo morador.",
				usuario,
				null,
				false
		);
	}

	@Transactional
	public void registrarDenunciaArquivadaPorModeracao(Denuncia denuncia, Usuario moderador, String motivo) {
		registrar(
				denuncia,
				TipoEventoTimeline.DENUNCIA_ARQUIVADA_MODERACAO,
				montarDescricaoModeracao("Denuncia arquivada pela moderacao.", motivo),
				moderador,
				null,
				true
		);
	}

	@Transactional
	public void registrarComentarioRemovidoPorModeracao(Denuncia denuncia, Usuario moderador, String motivo) {
		registrar(
				denuncia,
				TipoEventoTimeline.COMENTARIO_REMOVIDO_MODERACAO,
				montarDescricaoModeracao("Comentario removido pela moderacao.", motivo),
				moderador,
				null,
				true
		);
	}

	@Transactional
	public void registrarTransferenciaSolicitada(
			Denuncia denuncia,
			Usuario usuario,
			Organizacao organizacaoOrigem,
			Organizacao organizacaoDestino,
			String motivo
	) {
		String descricao = "Transferencia de responsabilidade solicitada por " + organizacaoOrigem.getNome() + ".";
		if (organizacaoDestino != null) {
			descricao = descricao + " Destino sugerido: " + organizacaoDestino.getNome() + ".";
		}
		registrar(
				denuncia,
				TipoEventoTimeline.TRANSFERENCIA_SOLICITADA,
				montarDescricaoComMotivo(descricao, motivo),
				usuario,
				organizacaoOrigem,
				true
		);
	}

	@Transactional
	public void registrarTransferenciaAprovada(
			Denuncia denuncia,
			Usuario usuario,
			Organizacao organizacaoDestino,
			String motivo
	) {
		registrar(
				denuncia,
				TipoEventoTimeline.TRANSFERENCIA_APROVADA,
				montarDescricaoComMotivo("Transferencia aprovada para " + organizacaoDestino.getNome() + ".", motivo),
				usuario,
				organizacaoDestino,
				true
		);
	}

	@Transactional
	public void registrarTransferenciaRecusada(Denuncia denuncia, Usuario usuario, String motivo) {
		registrar(
				denuncia,
				TipoEventoTimeline.TRANSFERENCIA_RECUSADA,
				montarDescricaoComMotivo("Transferencia recusada pela prefeitura.", motivo),
				usuario,
				null,
				true
		);
	}

	@Transactional
	public void registrarResponsavelAlteradoPelaPrefeitura(
			Denuncia denuncia,
			Usuario usuario,
			Organizacao organizacaoDestino,
			String motivo
	) {
		registrar(
				denuncia,
				TipoEventoTimeline.RESPONSAVEL_ALTERADO_PREFEITURA,
				montarDescricaoComMotivo("Responsavel alterado pela prefeitura para " + organizacaoDestino.getNome() + ".", motivo),
				usuario,
				organizacaoDestino,
				true
		);
	}

	@Transactional
	public void registrarConclusaoConfirmadaPeloMorador(Denuncia denuncia, Usuario usuario, String feedback) {
		registrar(
				denuncia,
				TipoEventoTimeline.CONCLUSAO_CONFIRMADA_MORADOR,
				montarDescricaoComMotivo("Conclusao confirmada pelo morador.", feedback),
				usuario,
				null,
				true
		);
	}

	@Transactional
	public void registrarConclusaoContestadaPeloMorador(Denuncia denuncia, Usuario usuario, String feedback) {
		registrar(
				denuncia,
				TipoEventoTimeline.CONCLUSAO_CONTESTADA_MORADOR,
				montarDescricaoComMotivo("Conclusao contestada pelo morador. Denuncia reaberta.", feedback),
				usuario,
				null,
				true
		);
	}

	@Transactional(readOnly = true)
	public Page<TimelineDenunciaResponseDTO> listarPorDenuncia(Long denunciaId, UsuarioAutenticado usuario, Pageable pageable) {
		Denuncia denuncia = denunciaRepository.findById(denunciaId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Denuncia nao encontrada."));
		visibilidadeDenunciaService.exigirPodeVisualizar(denuncia, usuario);
		return timelineRepository.findByDenunciaId(denunciaId, pageable)
				.map(evento -> TimelineDenunciaResponseDTO.from(
						evento,
						evento.getUsuario() != null && visibilidadeDenunciaService.deveOcultarAutorMorador(denuncia, evento.getUsuario().getId())
				));
	}

	private void registrar(
			Denuncia denuncia,
			TipoEventoTimeline tipo,
			String descricao,
			Usuario usuario,
			Organizacao organizacao,
			boolean destaque
	) {
		TimelineDenuncia evento = new TimelineDenuncia();
		evento.setDenuncia(denuncia);
		evento.setTipo(tipo);
		evento.setDescricao(descricao);
		evento.setUsuario(usuario);
		evento.setOrganizacao(organizacao);
		evento.setDestaque(destaque);
		timelineRepository.save(evento);
	}

	private String montarDescricaoStatusAlterado(
			StatusDenuncia statusAnterior,
			StatusDenuncia statusNovo,
			String motivo
	) {
		String descricao = "Status alterado de " + statusAnterior + " para " + statusNovo + ".";
		if (StringUtils.hasText(motivo)) {
			descricao = descricao + " Motivo: " + motivo.trim();
		}
		return descricao.length() <= 500 ? descricao : descricao.substring(0, 500);
	}

	private String montarDescricaoModeracao(String prefixo, String motivo) {
		return limitarDescricao(prefixo + " Motivo: " + motivo.trim());
	}

	private String montarDescricaoComMotivo(String prefixo, String motivo) {
		String descricao = prefixo;
		if (StringUtils.hasText(motivo)) {
			descricao = descricao + " Motivo: " + motivo.trim();
		}
		return limitarDescricao(descricao);
	}

	private String limitarDescricao(String descricao) {
		return descricao.length() <= 500 ? descricao : descricao.substring(0, 500);
	}
}
