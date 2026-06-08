package com.mykael.prefeitura.core.bairro;

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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
		name = "bairros",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_bairros_prefeitura_nome",
				columnNames = {"prefeitura_id", "nome"}
		)
)
public class Bairro {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "prefeitura_id", nullable = false)
	private Organizacao prefeitura;

	@Column(nullable = false, length = 100)
	private String nome;

	@Column(nullable = false)
	private boolean ativo = true;

	@Column(name = "centroide_latitude")
	private Double centroideLatitude;

	@Column(name = "centroide_longitude")
	private Double centroideLongitude;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public Organizacao getPrefeitura() {
		return prefeitura;
	}

	public void setPrefeitura(Organizacao prefeitura) {
		this.prefeitura = prefeitura;
		tocarAtualizacao();
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
		tocarAtualizacao();
	}

	public boolean isAtivo() {
		return ativo;
	}

	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
		tocarAtualizacao();
	}

	public Double getCentroideLatitude() {
		return centroideLatitude;
	}

	public void setCentroideLatitude(Double centroideLatitude) {
		this.centroideLatitude = centroideLatitude;
		tocarAtualizacao();
	}

	public Double getCentroideLongitude() {
		return centroideLongitude;
	}

	public void setCentroideLongitude(Double centroideLongitude) {
		this.centroideLongitude = centroideLongitude;
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
