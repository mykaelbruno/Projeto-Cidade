package com.mykael.prefeitura.core.categoria;

import com.mykael.prefeitura.core.organizacao.Organizacao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "categorias")
public class Categoria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String nome;

	@Column(length = 500)
	private String descricao;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organizacao_responsavel_padrao_id")
	private Organizacao organizacaoResponsavelPadrao;

	@Column(nullable = false)
	private boolean ativa = true;

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public Organizacao getOrganizacaoResponsavelPadrao() {
		return organizacaoResponsavelPadrao;
	}

	public void setOrganizacaoResponsavelPadrao(Organizacao organizacaoResponsavelPadrao) {
		this.organizacaoResponsavelPadrao = organizacaoResponsavelPadrao;
	}

	public boolean isAtiva() {
		return ativa;
	}

	public void setAtiva(boolean ativa) {
		this.ativa = ativa;
	}
}
