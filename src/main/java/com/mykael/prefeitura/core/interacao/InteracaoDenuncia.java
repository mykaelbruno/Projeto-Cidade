package com.mykael.prefeitura.core.interacao;

import com.mykael.prefeitura.core.denuncia.Denuncia;
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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
		name = "interacoes_denuncia",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_interacao_denuncia_usuario_tipo",
				columnNames = {"denuncia_id", "usuario_id", "tipo"}
		)
)
public class InteracaoDenuncia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "denuncia_id", nullable = false)
	private Denuncia denuncia;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private TipoInteracaoDenuncia tipo;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public Denuncia getDenuncia() {
		return denuncia;
	}

	public void setDenuncia(Denuncia denuncia) {
		this.denuncia = denuncia;
	}

	public Usuario getUsuario() {
		return usuario;
	}

	public void setUsuario(Usuario usuario) {
		this.usuario = usuario;
	}

	public TipoInteracaoDenuncia getTipo() {
		return tipo;
	}

	public void setTipo(TipoInteracaoDenuncia tipo) {
		this.tipo = tipo;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
