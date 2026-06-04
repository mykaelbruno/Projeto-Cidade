package com.mykael.prefeitura.infra.email;

import com.mykael.prefeitura.core.notificacao.Notificacao;
import com.mykael.prefeitura.core.usuario.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class EmailService {

	private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

	private final EmailProperties properties;
	private final ObjectProvider<JavaMailSender> mailSenderProvider;

	public EmailService(EmailProperties properties, ObjectProvider<JavaMailSender> mailSenderProvider) {
		this.properties = properties;
		this.mailSenderProvider = mailSenderProvider;
	}

	public void enviarVerificacaoEmail(Usuario usuario, String link) {
		String assunto = "Cidade Ativa - confirme seu e-mail";
		String corpo = """
				Ola, %s.

				Recebemos uma solicitacao para verificar o e-mail da sua conta no Cidade Ativa.
				Para confirmar, acesse o link abaixo:

				%s

				Se voce nao solicitou isso, ignore esta mensagem.
				""".formatted(usuario.getNome(), link);
		enviarOuLogar(usuario, assunto, corpo, link, "verificacao de e-mail");
	}

	public void enviarRecuperacaoSenha(Usuario usuario, String link) {
		String assunto = "Cidade Ativa - recuperacao de senha";
		String corpo = """
				Ola, %s.

				Recebemos uma solicitacao de recuperacao de senha da sua conta no Cidade Ativa.
				Para redefinir sua senha, acesse o link abaixo:

				%s

				Se voce nao solicitou isso, ignore esta mensagem.
				""".formatted(usuario.getNome(), link);
		enviarOuLogar(usuario, assunto, corpo, link, "recuperacao de senha");
	}

	public void enviarNotificacao(Usuario usuario, Notificacao notificacao) {
		if (!properties.notificacoesHabilitadas()) {
			return;
		}
		String link = notificacao.getLink();
		String corpo = """
				Ola, %s.

				%s

				%s
				""".formatted(
				usuario.getNome(),
				notificacao.getMensagem(),
				StringUtils.hasText(link) ? "Acesse: " + link : "Acesse o Cidade Ativa para acompanhar."
		);
		enviarOuLogar(usuario, "Cidade Ativa - " + notificacao.getTitulo(), corpo, link, "notificacao");
	}

	private void enviarOuLogar(Usuario usuario, String assunto, String corpo, String link, String tipo) {
		if (!properties.envioRealHabilitado()) {
			LOGGER.info("Email de {} para usuario id {} enviado em modo desenvolvimento: {}", tipo, usuario.getId(), link);
			return;
		}

		JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
		if (mailSender == null) {
			LOGGER.warn("Envio real de e-mail habilitado, mas JavaMailSender nao esta disponivel. Tipo: {}, usuario id: {}", tipo, usuario.getId());
			return;
		}

		try {
			SimpleMailMessage mensagem = new SimpleMailMessage();
			mensagem.setFrom(remetenteFormatado());
			mensagem.setTo(usuario.getEmail());
			mensagem.setSubject(assunto);
			mensagem.setText(corpo);
			mailSender.send(mensagem);
			LOGGER.info("Email de {} enviado para usuario id {}", tipo, usuario.getId());
		} catch (MailException ex) {
			LOGGER.error("Falha ao enviar email de {} para usuario id {}", tipo, usuario.getId(), ex);
		}
	}

	private String remetenteFormatado() {
		if (!StringUtils.hasText(properties.nomeRemetente())) {
			return properties.remetente();
		}
		return properties.nomeRemetente() + " <" + properties.remetente() + ">";
	}
}
