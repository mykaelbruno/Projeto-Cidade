package com.mykael.prefeitura.infra.cleanup;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mykael.prefeitura.core.anexo.AnexoDenunciaRepository;
import com.mykael.prefeitura.infra.auditoria.AuditoriaRepository;
import com.mykael.prefeitura.infra.auth.token.RefreshTokenRepository;
import com.mykael.prefeitura.infra.conta.TokenContaRepository;
import com.mykael.prefeitura.infra.storage.StorageProperties;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class LimpezaDadosSchedulerTest {

	@Test
	void deveExecutarLimpezaDosRepositories() {
		// Mock dos repositórios e propriedades
		RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
		TokenContaRepository tokenContaRepository = mock(TokenContaRepository.class);
		AuditoriaRepository auditoriaRepository = mock(AuditoriaRepository.class);
		AnexoDenunciaRepository anexoDenunciaRepository = mock(AnexoDenunciaRepository.class);
		StorageProperties storageProperties = mock(StorageProperties.class);

		// Configura mock para evitar NullPointerException na limpeza física
		when(storageProperties.denunciaAnexosDir()).thenReturn(null);

		// Instancia o agendador
		LimpezaDadosScheduler scheduler = new LimpezaDadosScheduler(
				refreshTokenRepository,
				tokenContaRepository,
				auditoriaRepository,
				anexoDenunciaRepository,
				storageProperties
		);

		// Executa
		scheduler.executarLimpezaManutencao();

		// Valida se as rotinas de limpeza dos repositórios foram chamadas
		verify(refreshTokenRepository).deletarExpiradosOuRevogados(any(Instant.class));
		verify(tokenContaRepository).deletarExpiradosOuUsados(any(Instant.class));
		verify(auditoriaRepository).deletarLogsAntigos(any(Instant.class));
	}
}
