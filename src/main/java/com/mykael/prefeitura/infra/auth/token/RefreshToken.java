package com.mykael.prefeitura.infra.auth.token;

import com.mykael.prefeitura.core.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Column(name = "token_hash", nullable = false, unique = true, length = 64)
	private String tokenHash;

	@Column(name = "expira_em", nullable = false)
	private Instant expiraEm;

	@Column(name = "revogado_em")
	private Instant revogadoEm;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public String getTokenHash() {
		return tokenHash;
	}

	public void setTokenHash(String tokenHash) {
		this.tokenHash = tokenHash;
	}

	public Instant getExpiraEm() {
		return expiraEm;
	}

	public void setExpiraEm(Instant expiraEm) {
		this.expiraEm = expiraEm;
	}

	public Instant getRevogadoEm() {
		return revogadoEm;
	}

	public void setRevogadoEm(Instant revogadoEm) {
		this.revogadoEm = revogadoEm;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}

	public boolean estaAtivo(Instant agora) {
		return revogadoEm == null && expiraEm.isAfter(agora);
	}
}
