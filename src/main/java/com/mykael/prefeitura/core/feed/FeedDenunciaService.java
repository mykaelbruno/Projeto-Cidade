package com.mykael.prefeitura.core.feed;

import com.mykael.prefeitura.core.anexo.AnexoDenunciaRepository;
import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.denuncia.VisibilidadeDenunciaService;
import com.mykael.prefeitura.core.feed.dto.FeedDenunciaFiltroDTO;
import com.mykael.prefeitura.core.feed.dto.FeedDenunciaResponseDTO;
import com.mykael.prefeitura.core.interacao.InteracaoDenunciaRepository;
import com.mykael.prefeitura.core.interacao.TipoInteracaoDenuncia;
import com.mykael.prefeitura.infra.security.UsuarioAutenticado;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class FeedDenunciaService {

	private final FeedDenunciaRepository feedDenunciaRepository;
	private final VisibilidadeDenunciaService visibilidadeDenunciaService;
	private final InteracaoDenunciaRepository interacaoDenunciaRepository;
	private final AnexoDenunciaRepository anexoRepository;

	public FeedDenunciaService(
			FeedDenunciaRepository feedDenunciaRepository,
			VisibilidadeDenunciaService visibilidadeDenunciaService,
			InteracaoDenunciaRepository interacaoDenunciaRepository,
			AnexoDenunciaRepository anexoRepository) {
		this.feedDenunciaRepository = feedDenunciaRepository;
		this.visibilidadeDenunciaService = visibilidadeDenunciaService;
		this.interacaoDenunciaRepository = interacaoDenunciaRepository;
		this.anexoRepository = anexoRepository;
	}

	@Transactional(readOnly = true)
	public Page<FeedDenunciaResponseDTO> listar(FeedDenunciaFiltroDTO filtro, UsuarioAutenticado usuario,
			Pageable pageable) {
		ModoOrdenacaoFeed modo = filtro.modo() == null ? ModoOrdenacaoFeed.MISTO : filtro.modo();
		if (visibilidadeDenunciaService.deveOcultarArquivadasNaListagemGeral(usuario)
				&& filtro.status() == StatusDenuncia.ARQUIVADO) {
			return Page.empty(pageable);
		}
		Instant agora = Instant.now();
		Long autorExcluidoId = (filtro.excluirProprias() != null && filtro.excluirProprias() && usuario != null) ? usuario.id() : null;
		Page<Denuncia> denuncias = switch (modo) {
			case RECENTES -> feedDenunciaRepository.buscarRecentes(
					normalizar(filtro.cidade()),
					normalizar(filtro.bairro()),
					filtro.status(),
					StatusDenuncia.ARQUIVADO,
					StatusDenuncia.CONCLUIDO,
					filtro.categoriaId(),
					autorExcluidoId,
					normalizarTermo(filtro.termo()),
					pageable);
			case EM_ALTA -> feedDenunciaRepository.buscarEmAlta(
					normalizar(filtro.cidade()),
					normalizar(filtro.bairro()),
					filtro.status(),
					StatusDenuncia.ARQUIVADO,
					StatusDenuncia.CONCLUIDO,
					filtro.categoriaId(),
					autorExcluidoId,
					normalizarTermo(filtro.termo()),
					pageable);
			case MISTO -> feedDenunciaRepository.buscarMisto(
					normalizar(filtro.cidade()),
					normalizar(filtro.bairro()),
					filtro.status(),
					StatusDenuncia.ARQUIVADO,
					StatusDenuncia.CONCLUIDO,
					filtro.categoriaId(),
					autorExcluidoId,
					normalizarTermo(filtro.termo()),
					agora.minus(6, ChronoUnit.HOURS),
					agora.minus(24, ChronoUnit.HOURS),
					agora.minus(72, ChronoUnit.HOURS),
					agora.minus(7, ChronoUnit.DAYS),
					pageable);
		};

		return copyMapWithInteractions(denuncias, modo, agora, usuario);
	}

	private String normalizar(String value) {
		return StringUtils.hasText(value) ? value.trim().toLowerCase(Locale.ROOT) : null;
	}

	private String normalizarTermo(String value) {
		return StringUtils.hasText(value) ? "%" + value.trim().toLowerCase(Locale.ROOT) + "%" : null;
	}

	private Page<FeedDenunciaResponseDTO> copyMapWithInteractions(
			Page<Denuncia> denuncias,
			ModoOrdenacaoFeed modo,
			Instant agora,
			UsuarioAutenticado usuario) {
		Map<Long, Long> capas = buscarCapasPorDenuncias(denuncias.getContent()
				.stream()
				.map(Denuncia::getId)
				.toList());
		return denuncias.map(denuncia -> {
			boolean apoiada = false;
			boolean urgente = false;
			if (usuario != null) {
				apoiada = interacaoDenunciaRepository.existsByDenunciaIdAndUsuarioIdAndTipo(
						denuncia.getId(),
						usuario.id(),
						TipoInteracaoDenuncia.CONFIRMACAO);
				urgente = interacaoDenunciaRepository.existsByDenunciaIdAndUsuarioIdAndTipo(
						denuncia.getId(),
						usuario.id(),
						TipoInteracaoDenuncia.URGENCIA);
			}
			Long anexoId = capas.get(denuncia.getId());
			String imagemCapaUrl = anexoId == null ? null : "/api/denuncias/" + denuncia.getId() + "/anexos/" + anexoId + "/arquivo";
			return FeedDenunciaResponseDTO.from(denuncia, modo, agora, apoiada, urgente, imagemCapaUrl);
		});
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
