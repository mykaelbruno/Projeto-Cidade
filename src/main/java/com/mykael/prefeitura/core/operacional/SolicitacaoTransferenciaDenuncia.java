package com.mykael.prefeitura.core.operacional;

import com.mykael.prefeitura.core.denuncia.Denuncia;
import com.mykael.prefeitura.core.organizacao.Organizacao;
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
@Table(name = "solicitacoes_transferencia_denuncia")
public class SolicitacaoTransferenciaDenuncia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "denuncia_id", nullable = false)
	private Denuncia denuncia;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "prefeitura_id", nullable = false)
	private Organizacao prefeitura;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "organizacao_origem_id", nullable = false)
	private Organizacao organizacaoOrigem;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organizacao_destino_sugerida_id")
	private Organizacao organizacaoDestinoSugerida;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "solicitado_por_id", nullable = false)
	private Usuario solicitadoPor;

	@Column(nullable = false, length = 500)
	private String motivo;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private StatusSolicitacaoTransferencia status = StatusSolicitacaoTransferencia.PENDENTE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "avaliado_por_id")
	private Usuario avaliadoPor;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organizacao_destino_final_id")
	private Organizacao organizacaoDestinoFinal;

	@Column(name = "motivo_decisao", length = 500)
	private String motivoDecisao;

	@Column(name = "avaliado_em")
	private Instant avaliadoEm;

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

	public Organizacao getPrefeitura() {
		return prefeitura;
	}

	public void setPrefeitura(Organizacao prefeitura) {
		this.prefeitura = prefeitura;
	}

	public Organizacao getOrganizacaoOrigem() {
		return organizacaoOrigem;
	}

	public void setOrganizacaoOrigem(Organizacao organizacaoOrigem) {
		this.organizacaoOrigem = organizacaoOrigem;
	}

	public Organizacao getOrganizacaoDestinoSugerida() {
		return organizacaoDestinoSugerida;
	}

	public void setOrganizacaoDestinoSugerida(Organizacao organizacaoDestinoSugerida) {
		this.organizacaoDestinoSugerida = organizacaoDestinoSugerida;
	}

	public Usuario getSolicitadoPor() {
		return solicitadoPor;
	}

	public void setSolicitadoPor(Usuario solicitadoPor) {
		this.solicitadoPor = solicitadoPor;
	}

	public String getMotivo() {
		return motivo;
	}

	public void setMotivo(String motivo) {
		this.motivo = motivo;
	}

	public StatusSolicitacaoTransferencia getStatus() {
		return status;
	}

	public void setStatus(StatusSolicitacaoTransferencia status) {
		this.status = status;
	}

	public Usuario getAvaliadoPor() {
		return avaliadoPor;
	}

	public void setAvaliadoPor(Usuario avaliadoPor) {
		this.avaliadoPor = avaliadoPor;
	}

	public Organizacao getOrganizacaoDestinoFinal() {
		return organizacaoDestinoFinal;
	}

	public void setOrganizacaoDestinoFinal(Organizacao organizacaoDestinoFinal) {
		this.organizacaoDestinoFinal = organizacaoDestinoFinal;
	}

	public String getMotivoDecisao() {
		return motivoDecisao;
	}

	public void setMotivoDecisao(String motivoDecisao) {
		this.motivoDecisao = motivoDecisao;
	}

	public Instant getAvaliadoEm() {
		return avaliadoEm;
	}

	public void setAvaliadoEm(Instant avaliadoEm) {
		this.avaliadoEm = avaliadoEm;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
