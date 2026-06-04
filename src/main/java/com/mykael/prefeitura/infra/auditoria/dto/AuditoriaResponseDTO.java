package com.mykael.prefeitura.infra.auditoria.dto;

import com.mykael.prefeitura.infra.auditoria.Auditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAcaoAuditoria;
import com.mykael.prefeitura.infra.auditoria.TipoAlvoAuditoria;
import java.time.Instant;

public record AuditoriaResponseDTO(
		Long id,
		TipoAcaoAuditoria acao,
		TipoAlvoAuditoria alvoTipo,
		Long alvoId,
		Long atorId,
		String perfilAtor,
		String descricao,
		String detalhes,
		String metodoHttp,
		String caminho,
		String ip,
		Instant criadoEm
) {

	public static AuditoriaResponseDTO from(Auditoria auditoria) {
		return new AuditoriaResponseDTO(
				auditoria.getId(),
				auditoria.getAcao(),
				auditoria.getAlvoTipo(),
				auditoria.getAlvoId(),
				auditoria.getAtorId(),
				auditoria.getPerfilAtor(),
				auditoria.getDescricao(),
				auditoria.getDetalhes(),
				auditoria.getMetodoHttp(),
				auditoria.getCaminho(),
				auditoria.getIp(),
				auditoria.getCriadoEm()
		);
	}
}
