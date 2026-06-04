package com.mykael.prefeitura.core.sinalizacao.dto;

import com.mykael.prefeitura.core.sinalizacao.SinalizacaoDenuncia;
import com.mykael.prefeitura.core.sinalizacao.MotivoSinalizacaoDenuncia;
import com.mykael.prefeitura.core.sinalizacao.StatusSinalizacaoDenuncia;
import java.time.Instant;

public record SinalizacaoDenunciaResponseDTO(
		Long id,
		Long denunciaId,
		String denunciaTitulo,
		Long autorId,
		String autorNome,
		MotivoSinalizacaoDenuncia motivo,
		String comentario,
		StatusSinalizacaoDenuncia status,
		Long analisadoPorId,
		String analisadoPorNome,
		Instant analisadoEm,
		Instant criadoEm
) {

	public static SinalizacaoDenunciaResponseDTO from(SinalizacaoDenuncia sinalizacao) {
		return new SinalizacaoDenunciaResponseDTO(
				sinalizacao.getId(),
				sinalizacao.getDenuncia().getId(),
				sinalizacao.getDenuncia().getTitulo(),
				sinalizacao.getAutor().getId(),
				sinalizacao.getAutor().getNome(),
				sinalizacao.getMotivo(),
				sinalizacao.getComentario(),
				sinalizacao.getStatus(),
				sinalizacao.getAnalisadoPor() == null ? null : sinalizacao.getAnalisadoPor().getId(),
				sinalizacao.getAnalisadoPor() == null ? null : sinalizacao.getAnalisadoPor().getNome(),
				sinalizacao.getAnalisadoEm(),
				sinalizacao.getCriadoEm()
		);
	}
}
