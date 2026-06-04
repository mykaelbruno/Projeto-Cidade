package com.mykael.prefeitura.core.anexo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record AnexoDenunciaUploadRequestOpenApi(
		@Schema(type = "string", format = "binary", description = "Imagem da denuncia nos formatos JPEG, PNG ou WEBP.")
		String arquivo
) {
}
