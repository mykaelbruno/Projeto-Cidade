package com.mykael.prefeitura.core.denuncia.dto;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import java.time.Instant;
import java.util.List;

public record DenunciaSemelhanteResponseDTO(
		Long denunciaId,
		String titulo,
		StatusDenuncia status,
		String cidade,
		String bairro,
		String rua,
		Double distanciaMetros,
		int percentualSemelhancaTexto,
		int pontuacaoSemelhanca,
		int quantidadeConfirmacoes,
		int quantidadeUrgencias,
		Instant criadoEm,
		List<String> motivos
) {

	public static DenunciaSemelhanteResponseDTO from(
			Denuncia denuncia,
			Double distanciaMetros,
			int percentualSemelhancaTexto,
			int pontuacaoSemelhanca,
			List<String> motivos
	) {
		return new DenunciaSemelhanteResponseDTO(
				denuncia.getId(),
				denuncia.getTitulo(),
				denuncia.getStatus(),
				denuncia.getCidade(),
				denuncia.getBairro(),
				denuncia.getRua(),
				distanciaMetros,
				percentualSemelhancaTexto,
				pontuacaoSemelhanca,
				denuncia.getQuantidadeConfirmacoes(),
				denuncia.getQuantidadeUrgencias(),
				denuncia.getCriadoEm(),
				motivos
		);
	}
}
