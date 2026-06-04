package com.mykael.prefeitura.core.usuario.dto;

import com.mykael.prefeitura.core.usuario.Usuario;
import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import java.time.Instant;

public record UsuarioResponseDTO(
		Long id,
		String nome,
		String email,
		String username,
		PerfilUsuario perfilGlobal,
		String telefone,
		String cidade,
		String bairro,
		String fotoPerfilUrl,
		boolean emailVerificado,
		Instant emailVerificadoEm,
		boolean ativo,
		Instant criadoEm,
		Instant atualizadoEm
) {

	public static UsuarioResponseDTO from(Usuario usuario) {
		return new UsuarioResponseDTO(
				usuario.getId(),
				usuario.getNome(),
				usuario.getEmail(),
				usuario.getUsername(),
				usuario.getPerfilGlobal(),
				usuario.getTelefone(),
				usuario.getCidade(),
				usuario.getBairro(),
				usuario.getFotoPerfilUrl(),
				usuario.isEmailVerificado(),
				usuario.getEmailVerificadoEm(),
				usuario.isAtivo(),
				usuario.getCriadoEm(),
				usuario.getAtualizadoEm()
		);
	}
}
