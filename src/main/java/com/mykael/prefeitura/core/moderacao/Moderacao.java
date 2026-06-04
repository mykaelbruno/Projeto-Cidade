package com.mykael.prefeitura.core.moderacao;

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
@Table(name = "moderacoes")
public class Moderacao {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(name = "tipo_alvo", nullable = false, length = 30)
	private TipoAlvoModeracao tipoAlvo;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "denuncia_id")
	private Denuncia denuncia;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "comentario_id")
	private Comentario comentario;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "usuario_alvo_id")
	private Usuario usuarioAlvo;

	@Enumerated(EnumType.STRING)
	@Column(name = "acao_usuario", length = 30)
	private AcaoModeracaoUsuario acaoUsuario;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "moderador_id", nullable = false)
	private Usuario moderador;

	@Column(nullable = false, length = 500)
	private String motivo;

	@Column(name = "criado_em", nullable = false, updatable = false)
	private Instant criadoEm = Instant.now();

	public Long getId() {
		return id;
	}

	public TipoAlvoModeracao getTipoAlvo() {
		return tipoAlvo;
	}

	public void setTipoAlvo(TipoAlvoModeracao tipoAlvo) {
		this.tipoAlvo = tipoAlvo;
	}

	public Denuncia getDenuncia() {
		return denuncia;
	}

	public void setDenuncia(Denuncia denuncia) {
		this.denuncia = denuncia;
	}

	public Comentario getComentario() {
		return comentario;
	}

	public void setComentario(Comentario comentario) {
		this.comentario = comentario;
	}

	public Usuario getUsuarioAlvo() {
		return usuarioAlvo;
	}

	public void setUsuarioAlvo(Usuario usuarioAlvo) {
		this.usuarioAlvo = usuarioAlvo;
	}

	public AcaoModeracaoUsuario getAcaoUsuario() {
		return acaoUsuario;
	}

	public void setAcaoUsuario(AcaoModeracaoUsuario acaoUsuario) {
		this.acaoUsuario = acaoUsuario;
	}

	public Usuario getModerador() {
		return moderador;
	}

	public void setModerador(Usuario moderador) {
		this.moderador = moderador;
	}

	public String getMotivo() {
		return motivo;
	}

	public void setMotivo(String motivo) {
		this.motivo = motivo;
	}

	public Instant getCriadoEm() {
		return criadoEm;
	}
}
