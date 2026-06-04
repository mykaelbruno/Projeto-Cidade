package com.mykael.prefeitura.infra.conta;

import com.mykael.prefeitura.core.usuario.Usuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "tokens_conta")
public class TokenConta {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private TipoTokenConta tipo;

	@Column(name = "token_hash", nullable = false, unique = true, length = 64)
	private String tokenHash;

	@Column(name = "expira_em", nullable = false)
	private Instant expiraEm;

	@Column(name = "usado_em")
	private Instant usadoEm;

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

	public TipoTokenConta getTipo() {
		return tipo;
	}

	public void setTipo(TipoTokenConta tipo) {
		this.tipo = tipo;
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

	public Instant getUsadoEm() {
		return usadoEm;
	}

	public void marcarComoUsado() {
		usadoEm = Instant.now();
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}

	public boolean estaAtivo(Instant agora) {
		return usadoEm == null && expiraEm.isAfter(agora);
	}
}
