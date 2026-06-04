package com.mykael.prefeitura.infra.auth.dto;

import com.mykael.prefeitura.core.usuario.dto.UsuarioResponseDTO;
import com.mykael.prefeitura.core.vinculo.dto.VinculoUsuarioOrganizacaoResponseDTO;
import java.util.List;

public record UsuarioLogadoResponseDTO(
		UsuarioResponseDTO usuario,
		List<String> papeis,
		List<VinculoUsuarioOrganizacaoResponseDTO> vinculosOperacionais
) {
}
