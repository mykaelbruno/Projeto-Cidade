package com.mykael.prefeitura.core.anexo;

import org.springframework.core.io.Resource;

public record ArquivoDenunciaDTO(
		Resource resource,
		String nomeOriginal,
		String contentType
) {
}
