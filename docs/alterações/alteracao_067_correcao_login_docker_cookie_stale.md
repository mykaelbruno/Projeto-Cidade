# Alteração 067 - Correção do login no Docker com cookie JWT stale

## O que motivou

Ao rodar a aplicação apenas via Docker, o login podia falhar com a mensagem `Autenticacao obrigatoria.` mesmo em uma rota pública.

O problema acontecia quando o navegador já possuía um cookie `access_token` antigo ou inválido. O backend tentava validar esse cookie antes de chegar ao controller de login, e a requisição era rejeitada pelo fluxo de autenticação do resource server.

## O que foi alterado

- Ajustado o `JwtCookieBearerTokenResolver` para ignorar o cookie JWT em rotas públicas sensíveis:
  - login
  - cadastro de morador
  - refresh
  - recuperação de senha
  - verificação de e-mail
  - rotas públicas de documentação e healthcheck
  - listagem pública de prefeituras e bairros ativos
- Ajustado o resolver para priorizar o último cookie recebido quando houver duplicidade de `access_token` ou `refresh_token`.
- Ajustado o fluxo de autenticação para limpar cookies legados também nos caminhos `/api` e `/api/auth`, além do caminho atual `/`.
- Ajustado o frontend para, em caso de `401` ao carregar `/api/auth/me`, tentar uma renovação de sessão antes de considerar o usuário deslogado.
- Mantido o comportamento normal nas rotas protegidas, que continuam exigindo autenticação válida.

## Benefício prático

- O usuário consegue fazer login mesmo se o navegador estiver com um cookie antigo de outra execução local.
- O backend deixa de se confundir quando o navegador envia cookies duplicados herdados de versões antigas da aplicação.
- A experiência no ambiente Docker fica consistente com a execução local fora de containers.
- A correção é pontual e não afrouxa a segurança das rotas privadas.

## Validação

- Adicionado teste de integração cobrindo login com `access_token` inválido no request.
- Adicionado teste unitário cobrindo:
  - ignorar cookie em rota pública de login
  - priorização do último cookie em caso de duplicidade
- Teste executado com sucesso:
  - `./mvnw.cmd test -Dtest=PermissaoPorPerfilIntegrationTest,JwtCookieBearerTokenResolverTest`

## Observação operacional

Como o backend roda por imagem no Docker Compose, é necessário rebuildar e subir novamente o serviço para aplicar essa correção:

```powershell
docker compose up -d --build backend
```
