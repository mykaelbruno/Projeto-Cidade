package com.mykael.prefeitura.core.comentario.dto;

import com.mykael.prefeitura.core.comentario.Comentario;
import java.time.Instant;

public record ComentarioResponseDTO(
		Long id,
		Long denunciaId,
		Long autorId,
		String autorNome,
		String conteudo,
		boolean oficial,
		Long organizacaoId,
		String organizacaoNome,
		Instant criadoEm,
		Instant atualizadoEm
) {

	public static ComentarioResponseDTO from(Comentario comentario) {
		return from(comentario, false);
	}

	public static ComentarioResponseDTO from(Comentario comentario, boolean ocultarAutor) {
		Long organizacaoId = comentario.getOrganizacao() == null ? null : comentario.getOrganizacao().getId();
		String organizacaoNome = comentario.getOrganizacao() == null ? null : comentario.getOrganizacao().getNome();

		return new ComentarioResponseDTO(
				comentario.getId(),
				comentario.getDenuncia().getId(),
				ocultarAutor ? null : comentario.getAutor().getId(),
				ocultarAutor ? "Morador anonimo" : comentario.getAutor().getNome(),
				comentario.getConteudo(),
				comentario.isOficial(),
				organizacaoId,
				organizacaoNome,
				comentario.getCriadoEm(),
				comentario.getAtualizadoEm()
		);
	}
}
