package com.mykael.prefeitura.infra.auditoria;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

class AuditoriaServiceTest {

	private final AuditoriaRepository auditoriaRepository = mock(AuditoriaRepository.class);
	private final AuditoriaService auditoriaService = new AuditoriaService(auditoriaRepository);

	@AfterEach
	void limparContextos() {
		SecurityContextHolder.clearContext();
		AuditoriaContext.limpar();
	}

	@Test
	void deveRegistrarAtorPerfilEDadosDaRequisicao() {
		when(auditoriaRepository.save(any(Auditoria.class))).thenAnswer(invocation -> invocation.getArgument(0));
		SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
				jwt("15"),
				null,
				List.of(new SimpleGrantedAuthority("ROLE_ADMIN_APP"))
		));
		AuditoriaContext.definir(new AuditoriaContext.DadosRequisicao(
				"PATCH",
				"/api/denuncias/10/status",
				"127.0.0.1"
		));

		auditoriaService.registrar(
				TipoAcaoAuditoria.DENUNCIA_STATUS_ALTERADO,
				TipoAlvoAuditoria.DENUNCIA,
				10L,
				"Status alterado.",
				"Status anterior: ABERTO, status novo: EM_ANALISE"
		);

		ArgumentCaptor<Auditoria> captor = ArgumentCaptor.forClass(Auditoria.class);
		verify(auditoriaRepository).save(captor.capture());
		Auditoria auditoria = captor.getValue();

		assertThat(auditoria.getAcao()).isEqualTo(TipoAcaoAuditoria.DENUNCIA_STATUS_ALTERADO);
		assertThat(auditoria.getAlvoTipo()).isEqualTo(TipoAlvoAuditoria.DENUNCIA);
		assertThat(auditoria.getAlvoId()).isEqualTo(10L);
		assertThat(auditoria.getAtorId()).isEqualTo(15L);
		assertThat(auditoria.getPerfilAtor()).isEqualTo("ADMIN_APP");
		assertThat(auditoria.getMetodoHttp()).isEqualTo("PATCH");
		assertThat(auditoria.getCaminho()).isEqualTo("/api/denuncias/10/status");
		assertThat(auditoria.getIp()).isEqualTo("127.0.0.1");
		assertThat(auditoria.getDetalhes()).contains("EM_ANALISE");
	}

	private Jwt jwt(String subject) {
		return new Jwt(
				"token",
				Instant.now(),
				Instant.now().plusSeconds(60),
				java.util.Map.of("alg", "none"),
				java.util.Map.of("sub", subject)
		);
	}
}
