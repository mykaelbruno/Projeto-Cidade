package com.mykael.prefeitura.infra.email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import com.mykael.prefeitura.core.usuario.PerfilUsuario;
import com.mykael.prefeitura.core.usuario.Usuario;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class EmailServiceTest {

	@Test
	void deveEnviarEmailRealQuandoHabilitado() {
		JavaMailSender mailSender = org.mockito.Mockito.mock(JavaMailSender.class);
		DefaultListableBeanFactory beanFactory = new DefaultListableBeanFactory();
		beanFactory.registerSingleton("mailSender", mailSender);
		EmailService emailService = new EmailService(
				new EmailProperties(true, false, "no-reply@cidadeativa.local", "Cidade Ativa"),
				beanFactory.getBeanProvider(JavaMailSender.class)
		);
		Usuario usuario = usuario();

		emailService.enviarRecuperacaoSenha(usuario, "http://localhost:5173/redefinir-senha?token=abc");

		ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
		verify(mailSender).send(captor.capture());
		SimpleMailMessage mensagem = captor.getValue();
		assertThat(mensagem.getTo()).containsExactly(usuario.getEmail());
		assertThat(mensagem.getSubject()).contains("recuperacao");
		assertThat(mensagem.getText()).contains("http://localhost:5173/redefinir-senha?token=abc");
	}

	private Usuario usuario() {
		Usuario usuario = new Usuario();
		usuario.setNome("Usuario Email");
		usuario.setEmail("usuario.email@example.com");
		usuario.setUsername("usuario_email");
		usuario.setSenhaHash("hash");
		usuario.setPerfilGlobal(PerfilUsuario.MORADOR);
		usuario.setCidade("Joao Pessoa");
		usuario.setBairro("Centro");
		return usuario;
	}
}
