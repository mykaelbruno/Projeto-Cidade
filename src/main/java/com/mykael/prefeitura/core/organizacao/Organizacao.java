package com.mykael.prefeitura.core.organizacao;

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
@Table(name = "organizacoes")
public class Organizacao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 150)
	private String nome;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private TipoOrganizacao tipo;

	@Column(nullable = false, length = 100)
	private String cidade;

	@Column(nullable = false, length = 2)
	private String estado;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organizacao_pai_id")
	private Organizacao organizacaoPai;

	@Column(nullable = false)
	private boolean verificada;

	@Column(nullable = false)
	private boolean ativa = true;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
		tocarAtualizacao();
	}

	public TipoOrganizacao getTipo() {
		return tipo;
	}

	public void setTipo(TipoOrganizacao tipo) {
		this.tipo = tipo;
		tocarAtualizacao();
	}

	public String getCidade() {
		return cidade;
	}

	public void setCidade(String cidade) {
		this.cidade = cidade;
		tocarAtualizacao();
	}

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
		tocarAtualizacao();
	}

	public Organizacao getOrganizacaoPai() {
		return organizacaoPai;
	}

	public void setOrganizacaoPai(Organizacao organizacaoPai) {
		this.organizacaoPai = organizacaoPai;
		tocarAtualizacao();
	}

	public boolean isVerificada() {
		return verificada;
	}

	public void setVerificada(boolean verificada) {
		this.verificada = verificada;
		tocarAtualizacao();
	}

	public boolean isAtiva() {
		return ativa;
	}

	public void setAtiva(boolean ativa) {
		this.ativa = ativa;
		tocarAtualizacao();
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}

	public Instant getAtualizadoEm() {
		return atualizadoEm;
	}

	private void tocarAtualizacao() {
		atualizadoEm = Instant.now();
	}
}
