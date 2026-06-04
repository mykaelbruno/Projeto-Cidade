package com.mykael.prefeitura.infra.limite;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.limite-requisicao")
public record LimiteRequisicaoProperties(
		boolean habilitado,
		boolean usarXForwardedFor,
		Regra login,
		Regra cadastroMorador,
		Regra refreshToken,
		Regra criacaoDenuncia,
		Regra comentario,
		Regra interacao,
		Regra sinalizacao,
		Regra uploadAnexo,
		Regra conta
) {

	public Regra regra(TipoLimiteRequisicao tipo) {
		return switch (tipo) {
			case LOGIN -> login;
			case CADASTRO_MORADOR -> cadastroMorador;
			case REFRESH_TOKEN -> refreshToken;
			case CRIACAO_DENUNCIA -> criacaoDenuncia;
			case COMENTARIO -> comentario;
			case INTERACAO -> interacao;
			case SINALIZACAO -> sinalizacao;
			case UPLOAD_ANEXO -> uploadAnexo;
			case CONTA -> conta;
		};
	}

	public record Regra(
			boolean habilitado,
			int maxRequisicoes,
			Duration janela
	) {
		public boolean aplicavel() {
			return habilitado && maxRequisicoes > 0 && janela != null && !janela.isZero() && !janela.isNegative();
		}
	}
}
