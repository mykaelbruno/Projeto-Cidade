package com.mykael.prefeitura.core.painel.dto;

public record PainelModeracaoResumoDTO(
		long sinalizacoesPendentes,
		long sinalizacoesAnalisadas,
		long denunciasArquivadasModeracao,
		long comentariosRemovidosModeracao,
		long usuariosAdvertidosModeracao,
		long usuariosSuspensosModeracao,
		long usuariosReativadosModeracao
) {
}
