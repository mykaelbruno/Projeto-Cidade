package com.mykael.prefeitura.core.denuncia;

import com.mykael.prefeitura.core.categoria.Categoria;
import com.mykael.prefeitura.core.bairro.Bairro;
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
@Table(name = "denuncias")
public class Denuncia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String titulo;

	@Column(nullable = false, length = 2000)
	private String descricao;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "categoria_id", nullable = false)
	private Categoria categoria;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private StatusDenuncia status = StatusDenuncia.ABERTO;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "autor_id", nullable = false)
	private Usuario autor;

	@Column(nullable = false)
	private boolean anonima;

	@Column(nullable = false, length = 100)
	private String cidade;

	@Column(nullable = false, length = 100)
	private String bairro;

	@Column(length = 150)
	private String rua;

	@Column(name = "ponto_referencia", length = 200)
	private String pontoReferencia;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "prefeitura_id")
	private Organizacao prefeitura;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "bairro_id")
	private Bairro bairroControlado;

	private Double latitude;

	private Double longitude;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "organizacao_responsavel_id")
	private Organizacao organizacaoResponsavel;

	@Column(name = "pontuacao_relevancia", nullable = false)
	private int pontuacaoRelevancia;

	@Column(name = "quantidade_confirmacoes", nullable = false)
	private int quantidadeConfirmacoes;

	@Column(name = "quantidade_urgencias", nullable = false)
	private int quantidadeUrgencias;

	@Column(name = "quantidade_comentarios", nullable = false)
	private int quantidadeComentarios;

	@Column(name = "conclusao_confirmada_em")
	private Instant conclusaoConfirmadaEm;

	@Column(name = "conclusao_contestada_em")
	private Instant conclusaoContestadaEm;

	@Column(name = "feedback_conclusao", length = 500)
	private String feedbackConclusao;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	@Column(name = "atualizado_em", nullable = false)
	private Instant atualizadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public String getTitulo() {
		return titulo;
	}

	public void setTitulo(String titulo) {
		this.titulo = titulo;
	}

	public String getDescricao() {
		return descricao;
	}

	public void setDescricao(String descricao) {
		this.descricao = descricao;
	}

	public Categoria getCategoria() {
		return categoria;
	}

	public void setCategoria(Categoria categoria) {
		this.categoria = categoria;
	}

	public StatusDenuncia getStatus() {
		return status;
	}

	public void setStatus(StatusDenuncia status) {
		this.status = status;
		tocarAtualizacao();
	}

	public Usuario getAutor() {
		return autor;
	}

	public void setAutor(Usuario autor) {
		this.autor = autor;
	}

	public boolean isAnonima() {
		return anonima;
	}

	public void setAnonima(boolean anonima) {
		this.anonima = anonima;
	}

	public String getCidade() {
		return cidade;
	}

	public void setCidade(String cidade) {
		this.cidade = cidade;
	}

	public String getBairro() {
		return bairro;
	}

	public void setBairro(String bairro) {
		this.bairro = bairro;
	}

	public String getRua() {
		return rua;
	}

	public void setRua(String rua) {
		this.rua = rua;
	}

	public String getPontoReferencia() {
		return pontoReferencia;
	}

	public void setPontoReferencia(String pontoReferencia) {
		this.pontoReferencia = pontoReferencia;
	}

	public Organizacao getPrefeitura() {
		return prefeitura;
	}

	public void setPrefeitura(Organizacao prefeitura) {
		this.prefeitura = prefeitura;
	}

	public Bairro getBairroControlado() {
		return bairroControlado;
	}

	public void setBairroControlado(Bairro bairroControlado) {
		this.bairroControlado = bairroControlado;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public Organizacao getOrganizacaoResponsavel() {
		return organizacaoResponsavel;
	}

	public void setOrganizacaoResponsavel(Organizacao organizacaoResponsavel) {
		this.organizacaoResponsavel = organizacaoResponsavel;
		tocarAtualizacao();
	}

	public int getPontuacaoRelevancia() {
		return pontuacaoRelevancia;
	}

	public void setPontuacaoRelevancia(int pontuacaoRelevancia) {
		this.pontuacaoRelevancia = pontuacaoRelevancia;
	}

	public int getQuantidadeConfirmacoes() {
		return quantidadeConfirmacoes;
	}

	public void setQuantidadeConfirmacoes(int quantidadeConfirmacoes) {
		this.quantidadeConfirmacoes = quantidadeConfirmacoes;
	}

	public int getQuantidadeUrgencias() {
		return quantidadeUrgencias;
	}

	public void setQuantidadeUrgencias(int quantidadeUrgencias) {
		this.quantidadeUrgencias = quantidadeUrgencias;
	}

	public int getQuantidadeComentarios() {
		return quantidadeComentarios;
	}

	public void setQuantidadeComentarios(int quantidadeComentarios) {
		this.quantidadeComentarios = quantidadeComentarios;
	}

	public void incrementarConfirmacoes() {
		quantidadeConfirmacoes++;
		recalcularPontuacaoRelevancia();
		tocarAtualizacao();
	}

	public void decrementarConfirmacoes() {
		if (quantidadeConfirmacoes > 0) {
			quantidadeConfirmacoes--;
			recalcularPontuacaoRelevancia();
			tocarAtualizacao();
		}
	}

	public void incrementarUrgencias() {
		quantidadeUrgencias++;
		recalcularPontuacaoRelevancia();
		tocarAtualizacao();
	}

	public void decrementarUrgencias() {
		if (quantidadeUrgencias > 0) {
			quantidadeUrgencias--;
			recalcularPontuacaoRelevancia();
			tocarAtualizacao();
		}
	}

	public void incrementarComentarios() {
		quantidadeComentarios++;
		recalcularPontuacaoRelevancia();
		tocarAtualizacao();
	}

	public void decrementarComentarios() {
		if (quantidadeComentarios > 0) {
			quantidadeComentarios--;
			recalcularPontuacaoRelevancia();
			tocarAtualizacao();
		}
	}

	public Instant getConclusaoConfirmadaEm() {
		return conclusaoConfirmadaEm;
	}

	public void confirmarConclusao(String feedback) {
		conclusaoConfirmadaEm = Instant.now();
		conclusaoContestadaEm = null;
		feedbackConclusao = feedback;
		tocarAtualizacao();
	}

	public Instant getConclusaoContestadaEm() {
		return conclusaoContestadaEm;
	}

	public void contestarConclusao(String feedback) {
		conclusaoContestadaEm = Instant.now();
		conclusaoConfirmadaEm = null;
		feedbackConclusao = feedback;
		setStatus(StatusDenuncia.REABERTO);
	}

	public String getFeedbackConclusao() {
		return feedbackConclusao;
	}

	public void recalcularPontuacaoRelevancia() {
		pontuacaoRelevancia = (quantidadeConfirmacoes * 2) + (quantidadeUrgencias * 3) + quantidadeComentarios;
	}

	private void tocarAtualizacao() {
		atualizadoEm = Instant.now();
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}

	public Instant getAtualizadoEm() {
		return atualizadoEm;
	}
}
