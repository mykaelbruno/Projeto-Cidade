package com.mykael.prefeitura.core.interacao.dto;

import com.mykael.prefeitura.core.denuncia.Denuncia;

public record InteracaoDenunciaResponseDTO(
		Long denunciaId,
		boolean confirmadaPeloUsuario,
		boolean marcadaUrgentePeloUsuario,
		int quantidadeConfirmacoes,
		int quantidadeUrgencias,
		int quantidadeComentarios,
		int pontuacaoRelevancia
) {

	public static InteracaoDenunciaResponseDTO from(
			Denuncia denuncia,
			boolean confirmadaPeloUsuario,
			boolean marcadaUrgentePeloUsuario
	) {
		return new InteracaoDenunciaResponseDTO(
				denuncia.getId(),
				confirmadaPeloUsuario,
				marcadaUrgentePeloUsuario,
				denuncia.getQuantidadeConfirmacoes(),
				denuncia.getQuantidadeUrgencias(),
				denuncia.getQuantidadeComentarios(),
				denuncia.getPontuacaoRelevancia()
		);
	}
}
