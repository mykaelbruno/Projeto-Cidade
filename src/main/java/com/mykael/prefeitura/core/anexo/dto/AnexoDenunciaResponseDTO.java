package com.mykael.prefeitura.core.anexo.dto;

import com.mykael.prefeitura.core.anexo.AnexoDenuncia;
import java.time.Instant;

public record AnexoDenunciaResponseDTO(
		Long id,
		Long denunciaId,
		Long autorId,
		String autorNome,
		String nomeOriginal,
		String contentType,
		long tamanhoBytes,
		String urlDownload,
		Instant criadoEm
) {

	public static AnexoDenunciaResponseDTO from(AnexoDenuncia anexo) {
		return from(anexo, false);
	}

	public static AnexoDenunciaResponseDTO from(AnexoDenuncia anexo, boolean ocultarAutor) {
		return new AnexoDenunciaResponseDTO(
				anexo.getId(),
				anexo.getDenuncia().getId(),
				ocultarAutor ? null : anexo.getAutor().getId(),
				ocultarAutor ? "Morador anonimo" : anexo.getAutor().getNome(),
				anexo.getNomeOriginal(),
				anexo.getContentType(),
				anexo.getTamanhoBytes(),
				"/api/denuncias/" + anexo.getDenuncia().getId() + "/anexos/" + anexo.getId() + "/arquivo",
				anexo.getCriadoEm()
		);
	}
}
