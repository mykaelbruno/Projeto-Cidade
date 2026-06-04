package com.mykael.prefeitura.core.denuncia.dto;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;

public record DenunciaFiltroDTO(
		String cidade,
		String bairro,
		StatusDenuncia status,
		Long categoriaId,
		Long organizacaoResponsavelId,
		Long autorId,
		String termo
) {
}
