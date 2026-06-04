package com.mykael.prefeitura.infra.auditoria;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "auditorias")
public class Auditoria {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 80)
	private TipoAcaoAuditoria acao;

	@Enumerated(EnumType.STRING)
	@Column(name = "alvo_tipo", nullable = false, length = 50)
	private TipoAlvoAuditoria alvoTipo;

	@Column(name = "alvo_id")
	private Long alvoId;

	@Column(name = "ator_id")
	private Long atorId;

	@Column(name = "perfil_ator", length = 80)
	private String perfilAtor;

	@Column(nullable = false, length = 255)
	private String descricao;

	@Column(length = 1000)
	private String detalhes;

	@Column(name = "metodo_http", length = 10)
	private String metodoHttp;

	@Column(length = 300)
	private String caminho;

	@Column(length = 80)
	private String ip;

	@Column(name = "criado_em", nullable = false)
	private Instant criadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public TipoAcaoAuditoria getAcao() {
		return acao;
	}

	public void setAcao(TipoAcaoAuditoria acao) {
		this.acao = acao;
	}

	public TipoAlvoAuditoria getAlvoTipo() {
		return alvoTipo;
	}

	public void setAlvoTipo(TipoAlvoAuditoria alvoTipo) {
		this.alvoTipo = alvoTipo;
	}

	public Long getAlvoId() {
		return alvoId;
	}

	public void setAlvoId(Long alvoId) {
		this.alvoId = alvoId;
	}

	public Long getAtorId() {
		return atorId;
	}

	public void setAtorId(Long atorId) {
		this.atorId = atorId;
	}

	public String getPerfilAtor() {
		return perfilAtor;
	}

	public void setPerfilAtor(String perfilAtor) {
		this.perfilAtor = perfilAtor;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public String getDetalhes() {
		return detalhes;
	}

	public void setDetalhes(String detalhes) {
		this.detalhes = detalhes;
	}

	public String getMetodoHttp() {
		return metodoHttp;
	}

	public void setMetodoHttp(String metodoHttp) {
		this.metodoHttp = metodoHttp;
	}

	public String getCaminho() {
		return caminho;
	}

	public void setCaminho(String caminho) {
		this.caminho = caminho;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
