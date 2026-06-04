package com.mykael.prefeitura.core.timeline.dto;

import com.mykael.prefeitura.core.timeline.TipoEventoTimeline;
import com.mykael.prefeitura.core.timeline.TimelineDenuncia;
import java.time.Instant;

public record TimelineDenunciaResponseDTO(
		Long id,
		Long denunciaId,
		TipoEventoTimeline tipo,
		String descricao,
		Long usuarioId,
		String usuarioNome,
		Long organizacaoId,
		String organizacaoNome,
		boolean destaque,
		Instant criadoEm
) {

	public static TimelineDenunciaResponseDTO from(TimelineDenuncia evento) {
		return from(evento, false);
	}

	public static TimelineDenunciaResponseDTO from(TimelineDenuncia evento, boolean ocultarUsuario) {
		Long usuarioId = evento.getUsuario() == null || ocultarUsuario ? null : evento.getUsuario().getId();
		String usuarioNome = evento.getUsuario() == null ? null : ocultarUsuario ? "Morador anonimo" : evento.getUsuario().getNome();
		Long organizacaoId = evento.getOrganizacao() == null ? null : evento.getOrganizacao().getId();
		String organizacaoNome = evento.getOrganizacao() == null ? null : evento.getOrganizacao().getNome();

		return new TimelineDenunciaResponseDTO(
				evento.getId(),
				evento.getDenuncia().getId(),
				evento.getTipo(),
				evento.getDescricao(),
				usuarioId,
				usuarioNome,
				organizacaoId,
				organizacaoNome,
				evento.isDestaque(),
				evento.getCriadoEm()
		);
	}
}
