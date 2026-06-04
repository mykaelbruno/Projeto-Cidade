package com.mykael.prefeitura.core.usuario;

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
@Table(name = "usuarios")
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String nome;

	@Column(nullable = false, unique = true, length = 150)
	private String email;

	@Column(nullable = false, unique = true, length = 50)
	private String username;

	@Column(name = "senha_hash", nullable = false, length = 255)
	private String senhaHash;

	@Enumerated(EnumType.STRING)
	@Column(name = "perfil_global", nullable = false, length = 30)
	private PerfilUsuario perfilGlobal = PerfilUsuario.MORADOR;

	@Column(length = 20)
	private String telefone;

	@Column(nullable = false, length = 100)
	private String cidade;

	@Column(nullable = false, length = 100)
	private String bairro;

	@Column(name = "foto_perfil_url", length = 500)
	private String fotoPerfilUrl;

	@Column(name = "email_verificado", nullable = false)
	private boolean emailVerificado;

	@Column(name = "email_verificado_em")
	private Instant emailVerificadoEm;

	@Column(nullable = false)
	private boolean ativo = true;

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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		if (this.email != null && !this.email.equals(email)) {
			emailVerificado = false;
			emailVerificadoEm = null;
		}
		this.email = email;
		tocarAtualizacao();
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
		tocarAtualizacao();
	}

	public String getSenhaHash() {
		return senhaHash;
	}

	public void setSenhaHash(String senhaHash) {
		this.senhaHash = senhaHash;
		tocarAtualizacao();
	}

	public PerfilUsuario getPerfilGlobal() {
		return perfilGlobal;
	}

	public void setPerfilGlobal(PerfilUsuario perfilGlobal) {
		this.perfilGlobal = perfilGlobal;
		tocarAtualizacao();
	}

	public String getTelefone() {
		return telefone;
	}

	public void setTelefone(String telefone) {
		this.telefone = telefone;
		tocarAtualizacao();
	}

	public String getCidade() {
		return cidade;
	}

	public void setCidade(String cidade) {
		this.cidade = cidade;
		tocarAtualizacao();
	}

	public String getBairro() {
		return bairro;
	}

	public void setBairro(String bairro) {
		this.bairro = bairro;
		tocarAtualizacao();
	}

	public String getFotoPerfilUrl() {
		return fotoPerfilUrl;
	}

	public void setFotoPerfilUrl(String fotoPerfilUrl) {
		this.fotoPerfilUrl = fotoPerfilUrl;
		tocarAtualizacao();
	}

	public boolean isEmailVerificado() {
		return emailVerificado;
	}

	public Instant getEmailVerificadoEm() {
		return emailVerificadoEm;
	}

	public void confirmarEmail() {
		emailVerificado = true;
		emailVerificadoEm = Instant.now();
		tocarAtualizacao();
	}

	public boolean isAtivo() {
		return ativo;
	}

	public void setAtivo(boolean ativo) {
		this.ativo = ativo;
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
