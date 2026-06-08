package com.mykael.prefeitura.core.sinalizacao;

import com.mykael.prefeitura.core.comentario.Comentario;
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
@Table(name = "sinalizacoes_denuncia")
public class SinalizacaoDenuncia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "denuncia_id", nullable = false)
	private Denuncia denuncia;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "comentario_id")
	private Comentario comentarioSinalizado;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "autor_id", nullable = false)
	private Usuario autor;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private MotivoSinalizacaoDenuncia motivo;

	@Column(nullable = false, length = 500)
	private String comentario;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private StatusSinalizacaoDenuncia status = StatusSinalizacaoDenuncia.PENDENTE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "analisado_por_id")
	private Usuario analisadoPor;

	@Column(name = "analisado_em")
	private Instant analisadoEm;

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

	public Comentario getComentarioSinalizado() {
		return comentarioSinalizado;
	}

	public void setComentarioSinalizado(Comentario comentarioSinalizado) {
		this.comentarioSinalizado = comentarioSinalizado;
	}

	public Usuario getAutor() {
		return autor;
	}

	public void setAutor(Usuario autor) {
		this.autor = autor;
	}

	public MotivoSinalizacaoDenuncia getMotivo() {
		return motivo;
	}

	public void setMotivo(MotivoSinalizacaoDenuncia motivo) {
		this.motivo = motivo;
	}

	public String getComentario() {
		return comentario;
	}

	public void setComentario(String comentario) {
		this.comentario = comentario;
	}

	public StatusSinalizacaoDenuncia getStatus() {
		return status;
	}

	public void setStatus(StatusSinalizacaoDenuncia status) {
		this.status = status;
	}

	public Usuario getAnalisadoPor() {
		return analisadoPor;
	}

	public void setAnalisadoPor(Usuario analisadoPor) {
		this.analisadoPor = analisadoPor;
	}

	public Instant getAnalisadoEm() {
		return analisadoEm;
	}

	public void setAnalisadoEm(Instant analisadoEm) {
		this.analisadoEm = analisadoEm;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
