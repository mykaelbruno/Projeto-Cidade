package com.mykael.prefeitura.core.notificacao;

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
import java.time.Instant;

@Entity
@Table(name = "notificacoes")
public class Notificacao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "usuario_id", nullable = false)
	private Usuario usuario;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "denuncia_id")
	private Denuncia denuncia;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 60)
	private TipoNotificacao tipo;

	@Column(nullable = false, length = 140)
	private String titulo;

	@Column(nullable = false, length = 500)
	private String mensagem;

	@Column(length = 300)
	private String link;

	@Column(name = "lida_em")
	private Instant lidaEm;

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

	public Denuncia getDenuncia() {
		return denuncia;
	}

	public void setDenuncia(Denuncia denuncia) {
		this.denuncia = denuncia;
	}

	public TipoNotificacao getTipo() {
		return tipo;
	}

	public void setTipo(TipoNotificacao tipo) {
		this.tipo = tipo;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getMensagem() {
		return mensagem;
	}

	public void setMensagem(String mensagem) {
		this.mensagem = mensagem;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public Instant getLidaEm() {
		return lidaEm;
	}

	public void setLidaEm(Instant lidaEm) {
		this.lidaEm = lidaEm;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
