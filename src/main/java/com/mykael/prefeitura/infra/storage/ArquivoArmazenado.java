package com.mykael.prefeitura.infra.storage;

public record ArquivoArmazenado(
		String nomeOriginal,
		String nomeArmazenado,
		String caminhoRelativo,
		String contentType,
		long tamanhoBytes
) {
}
