package com.mykael.prefeitura.core.denuncia;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class DenunciaTest {

	@Test
	void deveRecalcularPontuacaoQuandoReceberInteracoes() {
		Denuncia denuncia = new Denuncia();

		denuncia.incrementarConfirmacoes();
		denuncia.incrementarConfirmacoes();
		denuncia.incrementarUrgencias();
		denuncia.incrementarComentarios();

		assertEquals(2, denuncia.getQuantidadeConfirmacoes());
		assertEquals(1, denuncia.getQuantidadeUrgencias());
		assertEquals(1, denuncia.getQuantidadeComentarios());
		assertEquals(8, denuncia.getPontuacaoRelevancia());
	}

	@Test
	void naoDevePermitirContadoresNegativosAoRemoverInteracoesInexistentes() {
		Denuncia denuncia = new Denuncia();

		denuncia.decrementarConfirmacoes();
		denuncia.decrementarUrgencias();
		denuncia.decrementarComentarios();

		assertEquals(0, denuncia.getQuantidadeConfirmacoes());
		assertEquals(0, denuncia.getQuantidadeUrgencias());
		assertEquals(0, denuncia.getQuantidadeComentarios());
		assertEquals(0, denuncia.getPontuacaoRelevancia());
	}

	@Test
	void deveConfirmarConclusaoSemAlterarStatus() {
		Denuncia denuncia = new Denuncia();
		denuncia.setStatus(StatusDenuncia.CONCLUIDO);

		denuncia.confirmarConclusao("Resolvido corretamente.");

		assertEquals(StatusDenuncia.CONCLUIDO, denuncia.getStatus());
		assertNotNull(denuncia.getConclusaoConfirmadaEm());
		assertNull(denuncia.getConclusaoContestadaEm());
		assertEquals("Resolvido corretamente.", denuncia.getFeedbackConclusao());
	}

	@Test
	void deveReabrirDenunciaQuandoMoradorContestarConclusao() {
		Denuncia denuncia = new Denuncia();
		denuncia.setStatus(StatusDenuncia.CONCLUIDO);
		denuncia.confirmarConclusao("Parecia resolvido.");

		denuncia.contestarConclusao("O problema voltou.");

		assertEquals(StatusDenuncia.REABERTO, denuncia.getStatus());
		assertNull(denuncia.getConclusaoConfirmadaEm());
		assertNotNull(denuncia.getConclusaoContestadaEm());
		assertEquals("O problema voltou.", denuncia.getFeedbackConclusao());
	}
}
