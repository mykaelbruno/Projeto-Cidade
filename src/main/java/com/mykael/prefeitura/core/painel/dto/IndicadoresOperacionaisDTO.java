package com.mykael.prefeitura.core.painel.dto;

public record IndicadoresOperacionaisDTO(
		double taxaConclusaoConfirmada,
		double taxaReabertura,
		Double tempoMedioConfirmacaoHoras
) {
}
