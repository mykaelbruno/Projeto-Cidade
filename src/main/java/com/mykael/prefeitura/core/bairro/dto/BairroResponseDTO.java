package com.mykael.prefeitura.core.bairro.dto;

import com.mykael.prefeitura.core.bairro.Bairro;
import java.time.Instant;

public record BairroResponseDTO(
		Long id,
		Long prefeituraId,
		String prefeituraNome,
		String cidade,
		String estado,
		String nome,
		boolean ativo,
		Instant criadoEm,
		Instant atualizadoEm
) {

	public static BairroResponseDTO from(Bairro bairro) {
		return new BairroResponseDTO(
				bairro.getId(),
				bairro.getPrefeitura().getId(),
				bairro.getPrefeitura().getNome(),
				bairro.getPrefeitura().getCidade(),
				bairro.getPrefeitura().getEstado(),
				bairro.getNome(),
				bairro.isAtivo(),
				bairro.getCriadoEm(),
				bairro.getAtualizadoEm()
		);
	}
}
