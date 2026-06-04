# Alteracao 022 - Verificacao de e-mail e recuperacao de senha

## Objetivo

Implementar os fluxos basicos de conta que faltavam para fechar o backend com mais seguranca:

- verificacao de e-mail;
- recuperacao e redefinicao de senha;
- tokens com hash no banco;
- expiracao e uso unico;
- respostas neutras para nao revelar se um e-mail esta cadastrado.

## Banco de dados

Migration criada:

- `V3__create_tokens_conta.sql`

Alteracoes:

- `usuarios.email_verificado`;
- `usuarios.email_verificado_em`;
- tabela `tokens_conta`.

A tabela `tokens_conta` armazena:

- usuario relacionado;
- tipo do token: `VERIFICACAO_EMAIL` ou `RECUPERACAO_SENHA`;
- hash SHA-256 do token;
- data de expiracao;
- data de uso;
- data de criacao.

O token puro nunca e salvo no banco.

## Endpoints

### `POST /api/conta/verificacao-email/solicitacao`

Solicita novo token de verificacao para uma conta ativa ainda nao verificada.

Resposta sempre neutra:

```json
{
  "mensagem": "Se a conta existir e precisar de verificacao, enviaremos as instrucoes."
}
```

### `POST /api/conta/verificacao-email/confirmacao`

Confirma o e-mail usando o token recebido.

Corpo:

```json
{
  "token": "token-recebido"
}
```

### `POST /api/conta/recuperacao-senha/solicitacao`

Solicita token de recuperacao de senha.

Resposta sempre neutra:

```json
{
  "mensagem": "Se a conta existir, enviaremos as instrucoes de recuperacao."
}
```

### `POST /api/conta/recuperacao-senha/redefinicao`

Redefine a senha usando token valido.

Corpo:

```json
{
  "token": "token-recebido",
  "novaSenha": "nova-senha-segura"
}
```

## Seguranca

- O token puro nao e persistido.
- O token salvo no banco e apenas o hash.
- Tokens expiram.
- Tokens usados nao podem ser reutilizados.
- A solicitacao de verificacao e recuperacao nao revela se o e-mail existe.
- A nova senha e persistida com `PasswordEncoder`.
- Acoes de confirmacao de e-mail e redefinicao de senha sao registradas na auditoria sem salvar token ou senha.
- Foi criado rate limit especifico para os endpoints de conta.

## Envio de e-mail

Inicialmente o `EmailService` registrava os links em log em modo desenvolvimento.

Na alteracao 031 foi adicionado envio real por SMTP, controlado por variaveis de ambiente. Por padrao, `MAIL_ENABLED=false`, entao o ambiente local continua registrando os links em log sem exigir servidor de e-mail. Quando `MAIL_ENABLED=true`, o sistema usa as configuracoes `spring.mail` para enviar:

- e-mail de verificacao de conta;
- e-mail de recuperacao de senha.

## Variaveis de ambiente

Novas variaveis adicionadas ao `.env` e `.env.example`:

- `EMAIL_VERIFICATION_TOKEN_DURATION=24h`
- `PASSWORD_RESET_TOKEN_DURATION=30m`
- `RATE_LIMIT_CONTA_MAX_REQUESTS=10`
- `RATE_LIMIT_CONTA_WINDOW=15m`
- `MAIL_ENABLED=false`
- `MAIL_HOST=localhost`
- `MAIL_PORT=1025`
- `MAIL_USERNAME=`
- `MAIL_PASSWORD=`
- `MAIL_SMTP_AUTH=false`
- `MAIL_SMTP_STARTTLS_ENABLE=false`
- `MAIL_FROM=no-reply@cidadeativa.local`
- `MAIL_FROM_NAME=Cidade Ativa`

Os links usam `FRONTEND_URL`.

## Observacao sobre obrigatoriedade

A verificacao de e-mail ja existe e o cadastro de morador dispara automaticamente o token de verificacao.

Neste momento, o backend ainda nao bloqueia login ou criacao de denuncia por e-mail nao verificado, para nao travar o MVP local enquanto o frontend e o envio real de e-mail nao existem. Essa politica pode ser endurecida antes de producao.

## Pendencias conscientes para continuidade

Nenhuma funcao ficou quebrada ou incompleta para uso local do backend. O fluxo atual cria tokens, valida tokens, expira tokens, impede reuso e redefine senha corretamente.

Pontos que ficaram propositalmente para uma etapa futura:

- Bloqueio por e-mail nao verificado: hoje a conta pode logar e criar denuncia mesmo sem confirmar e-mail. Antes de producao, decidir quais acoes exigem `email_verificado=true`.
- Limpeza automatica de tokens expirados: tokens expirados deixam de funcionar, mas ainda nao existe job de limpeza periodica. Esse ponto esta relacionado ao item "Limpeza e expiracao de dados tecnicos" do roadmap.
- Reenvio com invalidacao dos tokens antigos: solicitar novo token ja gera um token novo valido, mas tokens anteriores continuam validos ate expirar ou serem usados. Para producao, pode ser melhor invalidar tokens antigos do mesmo tipo ao emitir um novo.
- Templates de e-mail: existem textos simples em texto puro. Templates HTML finais dependem do frontend e da identidade visual.

## Testes adicionados

Arquivo:

- `src/test/java/com/mykael/prefeitura/infra/conta/ContaIntegrationTest.java`

Cenarios cobertos:

- solicitacao e confirmacao de verificacao de e-mail;
- redefinicao de senha com token valido;
- resposta neutra quando recuperacao e solicitada para e-mail inexistente.
