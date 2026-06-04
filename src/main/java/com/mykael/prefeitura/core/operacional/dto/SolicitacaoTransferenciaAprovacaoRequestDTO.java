package com.mykael.prefeitura.core.operacional.dto;

import jakarta.validation.constraints.Size;

public record SolicitacaoTransferenciaAprovacaoRequestDTO(
		Long organizacaoDestinoId,

		@Size(max = 500)
		String motivo
) {
}
