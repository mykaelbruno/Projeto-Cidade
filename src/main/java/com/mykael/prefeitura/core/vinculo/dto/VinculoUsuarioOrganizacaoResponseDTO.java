package com.mykael.prefeitura.core.vinculo.dto;

import com.mykael.prefeitura.core.vinculo.PapelUsuario;
import com.mykael.prefeitura.core.vinculo.VinculoUsuarioOrganizacao;
import java.time.Instant;

public record VinculoUsuarioOrganizacaoResponseDTO(
		Long id,
		Long usuarioId,
		Long organizacaoId,
		String nomeUsuario,
		String nomeOrganizacao,
		PapelUsuario papel,
		boolean ativo,
		Instant criadoEm
) {

	public static VinculoUsuarioOrganizacaoResponseDTO from(VinculoUsuarioOrganizacao vinculo) {
		return new VinculoUsuarioOrganizacaoResponseDTO(
				vinculo.getId(),
				vinculo.getUsuario().getId(),
				vinculo.getOrganizacao().getId(),
				vinculo.getUsuario().getNome(),
				vinculo.getOrganizacao().getNome(),
				vinculo.getPapel(),
				vinculo.isAtivo(),
				vinculo.getCriadoEm()
		);
	}
}
