# Alteracao 031 - Envio de e-mail via SMTP

## Objetivo

Adicionar envio real de e-mails por SMTP sem quebrar a execucao local.

Por padrao, o projeto continua em modo desenvolvimento e apenas registra os links no log. Quando `MAIL_ENABLED=true`, o `EmailService` passa a usar `JavaMailSender` para enviar e-mails reais.

## Confirmacao dos fluxos cobertos

Sim, o envio de e-mail cobre:

- esqueci a senha / recuperacao de senha;
- ativacao/verificacao da conta;
- notificacoes internas importantes, quando habilitadas por configuracao.

As notificacoes por e-mail sao opcionais e controladas separadamente por `MAIL_NOTIFICATIONS_ENABLED`, porque nem sempre sera desejavel enviar e-mail para todo evento interno logo no MVP.

## O que foi implementado

- Dependencia `spring-boot-starter-mail`.
- Configuracao `spring.mail` por variaveis de ambiente.
- `EmailProperties` em `infra/email`.
- `EmailConfig` para carregar propriedades de e-mail.
- `EmailService` com dois modos:
  - modo desenvolvimento: loga o link/mensagem;
  - modo real: envia usando SMTP.
- Envio real para:
  - verificacao de e-mail;
  - recuperacao de senha;
  - notificacoes internas.
- Integracao do `NotificacaoService` com `EmailService`.
- Atualizacao de `.env` e `.env.example`.

## Variaveis de ambiente

```env
MAIL_ENABLED=false
MAIL_NOTIFICATIONS_ENABLED=false
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_SMTP_AUTH=false
MAIL_SMTP_STARTTLS_ENABLE=false
MAIL_FROM=no-reply@cidadeativa.local
MAIL_FROM_NAME=Cidade Ativa
```

## Como usar localmente

Sem servidor SMTP:

- deixar `MAIL_ENABLED=false`;
- os links de verificacao e recuperacao aparecem nos logs da aplicacao.

Com um servidor SMTP local, como MailHog/Mailpit:

- iniciar o servidor SMTP na porta configurada;
- manter `MAIL_HOST=localhost`;
- manter `MAIL_PORT=1025`;
- definir `MAIL_ENABLED=true`.

## Como usar com provedor real

Exemplo generico:

```env
MAIL_ENABLED=true
MAIL_HOST=smtp.seu-provedor.com
MAIL_PORT=587
MAIL_USERNAME=usuario-smtp
MAIL_PASSWORD=senha-smtp
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true
MAIL_FROM=no-reply@seudominio.com
MAIL_FROM_NAME=Cidade Ativa
```

Para tambem enviar e-mail das notificacoes internas:

```env
MAIL_NOTIFICATIONS_ENABLED=true
```

## Comportamento em caso de falha

Falhas no envio sao registradas em log e nao derrubam o fluxo principal.

Essa decisao evita que cadastro, solicitacao de recuperacao ou criacao de notificacao interna quebrem por indisponibilidade temporaria do SMTP. Para producao, pode ser avaliado adicionar fila, retentativa e painel de falhas.

## Pendencias conscientes

- Templates ainda sao texto puro, nao HTML.
- Nao ha fila assincrona de envio.
- Nao ha retentativa automatica.
- Nao ha preferencias individuais do usuario para escolher quais notificacoes recebem e-mail.
- Nao ha anexo nem layout final com identidade visual.
