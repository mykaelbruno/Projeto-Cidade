package com.mykael.prefeitura.core.operacional.dto;

import com.mykael.prefeitura.core.operacional.SolicitacaoTransferenciaDenuncia;
import com.mykael.prefeitura.core.operacional.StatusSolicitacaoTransferencia;
import java.time.Instant;

public record SolicitacaoTransferenciaResponseDTO(
		Long id,
		Long denunciaId,
		String denunciaTitulo,
		Long prefeituraId,
		String prefeituraNome,
		Long organizacaoOrigemId,
		String organizacaoOrigemNome,
		Long organizacaoDestinoSugeridaId,
		String organizacaoDestinoSugeridaNome,
		Long organizacaoDestinoFinalId,
		String organizacaoDestinoFinalNome,
		Long solicitadoPorId,
		String solicitadoPorNome,
		StatusSolicitacaoTransferencia status,
		String motivo,
		String motivoDecisao,
		Long avaliadoPorId,
		String avaliadoPorNome,
		Instant avaliadoEm,
		Instant criadoEm
) {

	public static SolicitacaoTransferenciaResponseDTO from(SolicitacaoTransferenciaDenuncia solicitacao) {
		return new SolicitacaoTransferenciaResponseDTO(
				solicitacao.getId(),
				solicitacao.getDenuncia().getId(),
				solicitacao.getDenuncia().getTitulo(),
				solicitacao.getPrefeitura().getId(),
				solicitacao.getPrefeitura().getNome(),
				solicitacao.getOrganizacaoOrigem().getId(),
				solicitacao.getOrganizacaoOrigem().getNome(),
				solicitacao.getOrganizacaoDestinoSugerida() == null ? null : solicitacao.getOrganizacaoDestinoSugerida().getId(),
				solicitacao.getOrganizacaoDestinoSugerida() == null ? null : solicitacao.getOrganizacaoDestinoSugerida().getNome(),
				solicitacao.getOrganizacaoDestinoFinal() == null ? null : solicitacao.getOrganizacaoDestinoFinal().getId(),
				solicitacao.getOrganizacaoDestinoFinal() == null ? null : solicitacao.getOrganizacaoDestinoFinal().getNome(),
				solicitacao.getSolicitadoPor().getId(),
				solicitacao.getSolicitadoPor().getNome(),
				solicitacao.getStatus(),
				solicitacao.getMotivo(),
				solicitacao.getMotivoDecisao(),
				solicitacao.getAvaliadoPor() == null ? null : solicitacao.getAvaliadoPor().getId(),
				solicitacao.getAvaliadoPor() == null ? null : solicitacao.getAvaliadoPor().getNome(),
				solicitacao.getAvaliadoEm(),
				solicitacao.getCriadoEm()
		);
	}
}
