package com.mykael.prefeitura.core.comentario;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.organizacao.Organizacao;
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
@Table(name = "comentarios")
public class Comentario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "denuncia_id", nullable = false)
	private Denuncia denuncia;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "autor_id", nullable = false)
	private Usuario autor;

	@Column(nullable = false, length = 2000)
	private String conteudo;

	@Column(nullable = false)
	private boolean oficial;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organizacao_id")
	private Organizacao organizacao;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm = Instant.now();

	@Column(name = "removido_em")
	private Instant removidoEm;

	public Long getId() {
		return id;
	}

	public Denuncia getDenuncia() {
		return denuncia;
	}

	public void setDenuncia(Denuncia denuncia) {
		this.denuncia = denuncia;
	}

	public Usuario getAutor() {
		return autor;
	}

	public void setAutor(Usuario autor) {
		this.autor = autor;
	}

	public String getConteudo() {
		return conteudo;
	}

	public void setConteudo(String conteudo) {
		this.conteudo = conteudo;
	}

	public boolean isOficial() {
		return oficial;
	}

	public void setOficial(boolean oficial) {
		this.oficial = oficial;
	}

	public Organizacao getOrganizacao() {
		return organizacao;
	}

	public void setOrganizacao(Organizacao organizacao) {
		this.organizacao = organizacao;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}

	public Instant getAtualizadoEm() {
		return atualizadoEm;
	}

	public Instant getRemovidoEm() {
		return removidoEm;
	}

	public void setRemovidoEm(Instant removidoEm) {
		this.removidoEm = removidoEm;
		this.atualizadoEm = Instant.now();
	}
}
