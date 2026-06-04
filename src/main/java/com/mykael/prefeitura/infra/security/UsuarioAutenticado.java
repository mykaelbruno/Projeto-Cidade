package com.mykael.prefeitura.infra.security;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public record UsuarioAutenticado(
		Long id,
		Set<String> papeis
) {

	public static UsuarioAutenticado from(Jwt jwt) {
		Set<String> papeis = new HashSet<>();
		Object scope = jwt.getClaims().get("scope");
		if (scope instanceof String scopeText && !scopeText.isBlank()) {
			Arrays.stream(scopeText.split("\\s+"))
					.map(UsuarioAutenticado::normalizarPapel)
					.forEach(papeis::add);
		}

		var authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null) {
			authentication.getAuthorities().stream()
					.map(authority -> normalizarPapel(authority.getAuthority()))
					.forEach(papeis::add);
		}

		return new UsuarioAutenticado(Long.valueOf(jwt.getSubject()), Set.copyOf(papeis));
	}

	public boolean possuiPapel(String papel) {
		return papeis.contains(papel);
	}

	public boolean adminApp() {
		return possuiPapel("ADMIN_APP");
	}

	public boolean moderador() {
		return possuiPapel("MODERADOR");
	}

	public boolean institucional() {
		return possuiPapel("ADMIN_PREFEITURA")
				|| possuiPapel("ADMIN_SECRETARIA")
				|| possuiPapel("ATENDENTE_SECRETARIA");
	}

	public boolean moderacaoGlobal() {
		return adminApp() || moderador();
	}

	private static String normalizarPapel(String papel) {
		return papel == null ? "" : papel.replaceFirst("^ROLE_", "");
	}
}
