package com.mykael.prefeitura.core.feed.dto;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.dto.DenunciaResponseDTO;
import com.mykael.prefeitura.core.feed.ModoOrdenacaoFeed;
import java.time.Duration;
import java.time.Instant;

public record FeedDenunciaResponseDTO(
		DenunciaResponseDTO denuncia,
		ModoOrdenacaoFeed modoOrdenacao,
		int pontuacaoFeed,
		String motivoOrdenacao,
		boolean apoiadaPeloUsuario,
		boolean urgentePeloUsuario
) {

	public static FeedDenunciaResponseDTO from(Denuncia denuncia, ModoOrdenacaoFeed modo, Instant agora) {
		return from(denuncia, modo, agora, false, false, null);
	}

	public static FeedDenunciaResponseDTO from(
			Denuncia denuncia,
			ModoOrdenacaoFeed modo,
			Instant agora,
			boolean apoiadaPeloUsuario,
			boolean urgentePeloUsuario,
			String imagemCapaUrl
	) {
		int bonusRecencia = calcularBonusRecencia(denuncia.getCriadoEm(), agora);
		int relevanciaLimitada = Math.min(denuncia.getPontuacaoRelevancia(), 30);
		int pontuacaoFeed = relevanciaLimitada + bonusRecencia;
		return new FeedDenunciaResponseDTO(
				DenunciaResponseDTO.from(denuncia, false, imagemCapaUrl),
				modo,
				pontuacaoFeed,
				montarMotivo(modo, relevanciaLimitada, bonusRecencia),
				apoiadaPeloUsuario,
				urgentePeloUsuario
		);
	}

	private static int calcularBonusRecencia(Instant criadoEm, Instant agora) {
		Duration idade = Duration.between(criadoEm, agora);
		if (idade.compareTo(Duration.ofHours(6)) <= 0) {
			return 20;
		}
		if (idade.compareTo(Duration.ofHours(24)) <= 0) {
			return 15;
		}
		if (idade.compareTo(Duration.ofHours(72)) <= 0) {
			return 10;
		}
		if (idade.compareTo(Duration.ofDays(7)) <= 0) {
			return 5;
		}
		return 0;
	}

	private static String montarMotivo(ModoOrdenacaoFeed modo, int relevanciaLimitada, int bonusRecencia) {
		if (modo == ModoOrdenacaoFeed.RECENTES) {
			return "Denuncia recente";
		}
		if (modo == ModoOrdenacaoFeed.EM_ALTA) {
			return relevanciaLimitada > 0 ? "Engajamento da comunidade" : "Sem interacoes ainda";
		}
		if (bonusRecencia >= 15 && relevanciaLimitada > 0) {
			return "Recente com engajamento";
		}
		if (bonusRecencia >= 15) {
			return "Denuncia nova";
		}
		if (relevanciaLimitada >= 15) {
			return "Engajamento relevante";
		}
		if (bonusRecencia > 0) {
			return "Ainda recente";
		}
		return "Ordenacao mista";
	}
}
