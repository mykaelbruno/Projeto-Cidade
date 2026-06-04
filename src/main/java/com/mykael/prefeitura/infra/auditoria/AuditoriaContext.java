package com.mykael.prefeitura.infra.auditoria;

public final class AuditoriaContext {

	private static final ThreadLocal<DadosRequisicao> DADOS_REQUISICAO = new ThreadLocal<>();

	private AuditoriaContext() {
	}

	public static void definir(DadosRequisicao dados) {
		DADOS_REQUISICAO.set(dados);
	}

	public static DadosRequisicao atual() {
		return DADOS_REQUISICAO.get();
	}

	public static void limpar() {
		DADOS_REQUISICAO.remove();
	}

	public record DadosRequisicao(
			String metodoHttp,
			String caminho,
			String ip
	) {
	}
}
