package com.mykael.prefeitura.core.painel.dto;

public record ContadoresDenunciaDTO(
		long total,
		long abertas,
		long emAnalise,
		long encaminhadas,
		long emAndamento,
		long programadas,
		long concluidasAguardandoConfirmacao,
		long concluidasConfirmadas,
		long reabertas,
		long arquivadas
) {
}
