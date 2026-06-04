package com.mykael.prefeitura.core.organizacao.dto;

import com.mykael.prefeitura.core.organizacao.Organizacao;
import com.mykael.prefeitura.core.organizacao.TipoOrganizacao;
import java.time.Instant;

public record OrganizacaoResponseDTO(
		Long id,
		String nome,
		TipoOrganizacao tipo,
		String cidade,
		String estado,
		Long organizacaoPaiId,
		boolean verificada,
		boolean ativa,
		Instant criadoEm,
		Instant atualizadoEm
) {

	public static OrganizacaoResponseDTO from(Organizacao organizacao) {
		Long organizacaoPaiId = organizacao.getOrganizacaoPai() == null ? null : organizacao.getOrganizacaoPai().getId();
		return new OrganizacaoResponseDTO(
				organizacao.getId(),
				organizacao.getNome(),
				organizacao.getTipo(),
				organizacao.getCidade(),
				organizacao.getEstado(),
				organizacaoPaiId,
				organizacao.isVerificada(),
				organizacao.isAtiva(),
				organizacao.getCriadoEm(),
				organizacao.getAtualizadoEm()
		);
	}
}
