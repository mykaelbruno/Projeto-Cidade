package com.mykael.prefeitura.core.categoria.dto;

import com.mykael.prefeitura.core.categoria.Categoria;

public record CategoriaResponseDTO(
		Long id,
		String nome,
		String descricao,
		Long organizacaoResponsavelPadraoId,
		boolean ativa
) {

	public static CategoriaResponseDTO from(Categoria categoria) {
		Long organizacaoResponsavelPadraoId = categoria.getOrganizacaoResponsavelPadrao() == null
				? null
				: categoria.getOrganizacaoResponsavelPadrao().getId();
		return new CategoriaResponseDTO(
				categoria.getId(),
				categoria.getNome(),
				categoria.getDescricao(),
				organizacaoResponsavelPadraoId,
				categoria.isAtiva()
		);
	}
}
