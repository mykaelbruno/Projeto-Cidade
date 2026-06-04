package com.mykael.prefeitura.infra.security;

import com.mykael.prefeitura.core.usuario.Usuario;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

	private final JwtEncoder jwtEncoder;
	private final SecurityProperties securityProperties;

	public JwtTokenService(JwtEncoder jwtEncoder, SecurityProperties securityProperties) {
		this.jwtEncoder = jwtEncoder;
		this.securityProperties = securityProperties;
	}

	public String gerarAccessToken(Usuario usuario, List<String> papeisInstitucionais) {
		Instant agora = Instant.now();
		Duration duracao = securityProperties.jwt().accessTokenDuration();
		String scope = montarScope(usuario, papeisInstitucionais);

		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer(securityProperties.jwt().issuer())
				.issuedAt(agora)
				.expiresAt(agora.plus(duracao))
				.subject(usuario.getId().toString())
				.claim("username", usuario.getUsername())
				.claim("email", usuario.getEmail())
				.claim("scope", scope)
				.build();

		JwsHeader header = JwsHeader.with(() -> "HS256").build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	private String montarScope(Usuario usuario, List<String> papeisInstitucionais) {
		String perfilGlobal = "ROLE_" + usuario.getPerfilGlobal().name();
		if (papeisInstitucionais.isEmpty()) {
			return perfilGlobal;
		}
		return perfilGlobal + " " + String.join(" ", papeisInstitucionais);
	}
}
