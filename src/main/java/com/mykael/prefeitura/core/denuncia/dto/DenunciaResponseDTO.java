package com.mykael.prefeitura.core.denuncia.dto;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.denuncia.StatusDenuncia;
import java.time.Instant;

public record DenunciaResponseDTO(
		Long id,
		String titulo,
		String descricao,
		Long categoriaId,
		String categoriaNome,
		StatusDenuncia status,
		Long autorId,
		String autorNomeExibido,
		boolean anonima,
		String cidade,
		String bairro,
		String rua,
		String pontoReferencia,
		Double latitude,
		Double longitude,
		Long organizacaoResponsavelId,
		String organizacaoResponsavelNome,
		int pontuacaoRelevancia,
		int quantidadeConfirmacoes,
		int quantidadeUrgencias,
		int quantidadeComentarios,
		Instant conclusaoConfirmadaEm,
		Instant conclusaoContestadaEm,
		String feedbackConclusao,
		String imagemCapaUrl,
		Instant criadoEm,
		Instant atualizadoEm
) {

	public static DenunciaResponseDTO from(Denuncia denuncia) {
		return from(denuncia, false);
	}

	public static DenunciaResponseDTO from(Denuncia denuncia, boolean exporAutorId) {
		return from(denuncia, exporAutorId, null);
	}

	public static DenunciaResponseDTO from(Denuncia denuncia, boolean exporAutorId, String imagemCapaUrl) {
		Long organizacaoResponsavelId = denuncia.getOrganizacaoResponsavel() == null
				? null
				: denuncia.getOrganizacaoResponsavel().getId();
		String organizacaoResponsavelNome = denuncia.getOrganizacaoResponsavel() == null
				? null
				: denuncia.getOrganizacaoResponsavel().getNome();
		Long autorId = (!denuncia.isAnonima() || exporAutorId) ? denuncia.getAutor().getId() : null;
		String autorNomeExibido = denuncia.isAnonima() ? "Morador anonimo" : denuncia.getAutor().getNome();
		return new DenunciaResponseDTO(
				denuncia.getId(),
				denuncia.getTitulo(),
				denuncia.getDescricao(),
				denuncia.getCategoria().getId(),
				denuncia.getCategoria().getNome(),
				denuncia.getStatus(),
				autorId,
				autorNomeExibido,
				denuncia.isAnonima(),
				denuncia.getCidade(),
				denuncia.getBairro(),
				denuncia.getRua(),
				denuncia.getPontoReferencia(),
				denuncia.getLatitude(),
				denuncia.getLongitude(),
				organizacaoResponsavelId,
				organizacaoResponsavelNome,
				denuncia.getPontuacaoRelevancia(),
				denuncia.getQuantidadeConfirmacoes(),
				denuncia.getQuantidadeUrgencias(),
				denuncia.getQuantidadeComentarios(),
				denuncia.getConclusaoConfirmadaEm(),
				denuncia.getConclusaoContestadaEm(),
				denuncia.getFeedbackConclusao(),
				imagemCapaUrl,
				denuncia.getCriadoEm(),
				denuncia.getAtualizadoEm()
		);
	}
}
