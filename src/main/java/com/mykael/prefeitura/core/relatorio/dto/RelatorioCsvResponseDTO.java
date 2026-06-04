package com.mykael.prefeitura.core.relatorio.dto;

public record RelatorioCsvResponseDTO(
		String nomeArquivo,
		byte[] conteudo
) {
}
