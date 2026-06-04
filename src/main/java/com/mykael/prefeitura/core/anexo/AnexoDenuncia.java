package com.mykael.prefeitura.core.anexo;

import com.mykael.prefeitura.core.denuncia.Denuncia;
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
@Table(name = "anexos_denuncia")
public class AnexoDenuncia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "denuncia_id", nullable = false)
	private Denuncia denuncia;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "autor_id", nullable = false)
	private Usuario autor;

	@Column(name = "nome_original", nullable = false, length = 255)
	private String nomeOriginal;

	@Column(name = "nome_armazenado", nullable = false, length = 255)
	private String nomeArmazenado;

	@Column(name = "caminho_arquivo", nullable = false, length = 500)
	private String caminhoArquivo;

	@Column(name = "content_type", nullable = false, length = 100)
	private String contentType;

	@Column(name = "tamanho_bytes", nullable = false)
	private long tamanhoBytes;

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

	public Usuario getAutor() {
		return autor;
	}

	public void setAutor(Usuario autor) {
		this.autor = autor;
	}

	public String getNomeOriginal() {
		return nomeOriginal;
	}

	public void setNomeOriginal(String nomeOriginal) {
		this.nomeOriginal = nomeOriginal;
	}

	public String getNomeArmazenado() {
		return nomeArmazenado;
	}

	public void setNomeArmazenado(String nomeArmazenado) {
		this.nomeArmazenado = nomeArmazenado;
	}

	public String getCaminhoArquivo() {
		return caminhoArquivo;
	}

	public void setCaminhoArquivo(String caminhoArquivo) {
		this.caminhoArquivo = caminhoArquivo;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public long getTamanhoBytes() {
		return tamanhoBytes;
	}

	public void setTamanhoBytes(long tamanhoBytes) {
		this.tamanhoBytes = tamanhoBytes;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
