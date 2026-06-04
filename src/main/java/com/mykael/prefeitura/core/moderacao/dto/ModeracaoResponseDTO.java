package com.mykael.prefeitura.core.moderacao.dto;

import com.mykael.prefeitura.core.moderacao.Moderacao;
import com.mykael.prefeitura.core.moderacao.TipoAlvoModeracao;
import com.mykael.prefeitura.core.moderacao.AcaoModeracaoUsuario;
import java.time.Instant;

public record ModeracaoResponseDTO(
		Long id,
		TipoAlvoModeracao tipoAlvo,
		Long denunciaId,
		Long comentarioId,
		Long usuarioAlvoId,
		String usuarioAlvoNome,
		AcaoModeracaoUsuario acaoUsuario,
		Long moderadorId,
		String moderadorNome,
		String motivo,
		Instant criadoEm
) {

	public static ModeracaoResponseDTO from(Moderacao moderacao) {
		return new ModeracaoResponseDTO(
				moderacao.getId(),
				moderacao.getTipoAlvo(),
				moderacao.getDenuncia() == null ? null : moderacao.getDenuncia().getId(),
				moderacao.getComentario() == null ? null : moderacao.getComentario().getId(),
				moderacao.getUsuarioAlvo() == null ? null : moderacao.getUsuarioAlvo().getId(),
				moderacao.getUsuarioAlvo() == null ? null : moderacao.getUsuarioAlvo().getNome(),
				moderacao.getAcaoUsuario(),
				moderacao.getModerador().getId(),
				moderacao.getModerador().getNome(),
				moderacao.getMotivo(),
				moderacao.getCriadoEm()
		);
	}
}
