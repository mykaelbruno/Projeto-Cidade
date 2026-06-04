package com.mykael.prefeitura.infra.limite;

public enum TipoLimiteRequisicao {
	LOGIN("login"),
	CADASTRO_MORADOR("cadastro de morador"),
	REFRESH_TOKEN("renovacao de sessao"),
	CRIACAO_DENUNCIA("criacao de denuncia"),
	COMENTARIO("comentario"),
	INTERACAO("interacao"),
	SINALIZACAO("sinalizacao"),
	UPLOAD_ANEXO("upload de anexo"),
	CONTA("conta");

	private final String descricao;

	TipoLimiteRequisicao(String descricao) {
		this.descricao = descricao;
	}

	public String getDescricao() {
		return descricao;
	}
}
