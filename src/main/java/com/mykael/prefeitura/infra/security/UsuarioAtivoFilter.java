package com.mykael.prefeitura.infra.security;

import com.mykael.prefeitura.core.usuario.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class UsuarioAtivoFilter extends OncePerRequestFilter {

	private final UsuarioRepository usuarioRepository;

	public UsuarioAtivoFilter(UsuarioRepository usuarioRepository) {
		this.usuarioRepository = usuarioRepository;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return "/api/auth/logout".equals(request.getRequestURI());
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
			Long usuarioId = Long.valueOf(jwt.getSubject());
			boolean usuarioAtivo = usuarioRepository.findById(usuarioId)
					.map(usuario -> usuario.isAtivo())
					.orElse(false);
			if (!usuarioAtivo) {
				SecurityContextHolder.clearContext();
				escreverErroUsuarioInativo(request, response);
				return;
			}
		}

		filterChain.doFilter(request, response);
	}

	private void escreverErroUsuarioInativo(
			HttpServletRequest request,
			HttpServletResponse response
	) throws IOException {
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		String erro = """
				{"timestamp":"%s","status":401,"erro":"USUARIO_INATIVO","mensagem":"Usuario inativo ou suspenso.","caminho":"%s"}
				""".formatted(Instant.now(), escaparJson(request.getRequestURI()));
		response.getWriter().write(erro);
	}

	private String escaparJson(String valor) {
		return valor == null ? "" : valor
				.replace("\\", "\\\\")
				.replace("\"", "\\\"");
	}
}
