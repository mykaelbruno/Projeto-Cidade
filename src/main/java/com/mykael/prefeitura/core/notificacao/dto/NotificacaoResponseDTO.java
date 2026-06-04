package com.mykael.prefeitura.core.notificacao.dto;

import com.mykael.prefeitura.core.notificacao.Notificacao;
import com.mykael.prefeitura.core.notificacao.TipoNotificacao;
import java.time.Instant;

public record NotificacaoResponseDTO(
		Long id,
		TipoNotificacao tipo,
		Long denunciaId,
		String titulo,
		String mensagem,
		String link,
		boolean lida,
		Instant lidaEm,
		Instant criadoEm
) {

	public static NotificacaoResponseDTO from(Notificacao notificacao) {
		return new NotificacaoResponseDTO(
				notificacao.getId(),
				notificacao.getTipo(),
				notificacao.getDenuncia() == null ? null : notificacao.getDenuncia().getId(),
				notificacao.getTitulo(),
				notificacao.getMensagem(),
				notificacao.getLink(),
				notificacao.getLidaEm() != null,
				notificacao.getLidaEm(),
				notificacao.getCriadoEm()
		);
	}
}
