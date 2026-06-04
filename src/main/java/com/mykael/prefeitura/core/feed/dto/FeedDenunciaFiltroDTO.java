package com.mykael.prefeitura.core.feed.dto;

import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import com.mykael.prefeitura.core.feed.ModoOrdenacaoFeed;

public record FeedDenunciaFiltroDTO(
		String cidade,
		String bairro,
		StatusDenuncia status,
		Long categoriaId,
		ModoOrdenacaoFeed modo,
		Boolean excluirProprias,
		String termo
) {
}
