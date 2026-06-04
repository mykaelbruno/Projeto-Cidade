# Alteracao 018 - Reforco de seguranca operacional

## Objetivo

Reforcar a API antes do inicio do frontend, cobrindo pontos previstos nos documentos de seguranca:

- CORS restrito e configuravel;
- headers HTTP de seguranca;
- respostas padronizadas para falhas de autenticacao e autorizacao;
- limite de requisicoes em endpoints sensiveis;
- documentacao mais clara no Swagger.

Essa alteracao nao muda regras de negocio e nao muda o schema do banco.

## CORS

Foi criada a configuracao `app.web.cors`.

Por padrao local, a API permite requisicoes do frontend em:

```txt
http://localhost:5173
```

Variaveis adicionadas:

```txt
FRONTEND_URL
CORS_ALLOWED_ORIGINS
CORS_ALLOWED_METHODS
CORS_ALLOWED_HEADERS
CORS_EXPOSED_HEADERS
CORS_ALLOW_CREDENTIALS
CORS_MAX_AGE
```

Observacao importante:

- como a autenticacao usa cookies HttpOnly, `allow-credentials` fica ativo;
- por isso, a origem nao deve ser `*` em producao;
- quando o front tiver dominio real, basta ajustar `CORS_ALLOWED_ORIGINS`.

## Headers de seguranca

A configuracao global do Spring Security passou a enviar headers para reduzir riscos comuns:

- `X-Content-Type-Options`;
- `X-Frame-Options`;
- `Referrer-Policy`;
- `Permissions-Policy`;
- `Content-Security-Policy`.

O CSP foi configurado de forma compativel com Swagger em desenvolvimento.

## Erros de seguranca

Falhas de autenticacao e autorizacao agora retornam o mesmo formato geral usado pela API:

```json
{
  "timestamp": "2026-05-27T00:00:00Z",
  "status": 401,
  "erro": "NAO_AUTENTICADO",
  "mensagem": "Autenticacao obrigatoria.",
  "caminho": "/api/exemplo"
}
```

Codigos adicionados:

- `NAO_AUTENTICADO`: quando a rota exige login;
- `ACESSO_NEGADO`: quando o usuario logado nao tem permissao;
- `LIMITE_REQUISICOES`: quando o limite de chamadas e ultrapassado.

## Limite de requisicoes

Foi criado o pacote:

```txt
infra/limite
```

Ele contem um limitador simples em memoria, adequado para desenvolvimento e MVP inicial.

Endpoints protegidos:

- `POST /api/auth/login`;
- `POST /api/auth/cadastro-morador`;
- `POST /api/auth/refresh`;
- `POST /api/denuncias`;
- `POST /api/denuncias/{id}/comentarios`;
- `POST /api/denuncias/{id}/sinalizacoes`;
- `POST /api/denuncias/{id}/confirmacoes`;
- `DELETE /api/denuncias/{id}/confirmacoes`;
- `POST /api/denuncias/{id}/urgencias`;
- `DELETE /api/denuncias/{id}/urgencias`;
- `POST /api/denuncias/{id}/anexos`.

Quando o limite e atingido, a API retorna `429` com:

- `Retry-After`;
- `X-RateLimit-Limit`;
- `X-RateLimit-Remaining`.

## Configuracao local

Variaveis adicionadas ao `.env` e ao `.env.example`:

```txt
RATE_LIMIT_ENABLED=true
RATE_LIMIT_USE_X_FORWARDED_FOR=false
RATE_LIMIT_LOGIN_MAX_REQUESTS=10
RATE_LIMIT_LOGIN_WINDOW=1m
RATE_LIMIT_CADASTRO_MAX_REQUESTS=5
RATE_LIMIT_CADASTRO_WINDOW=1h
RATE_LIMIT_REFRESH_MAX_REQUESTS=30
RATE_LIMIT_REFRESH_WINDOW=1m
RATE_LIMIT_DENUNCIA_MAX_REQUESTS=10
RATE_LIMIT_DENUNCIA_WINDOW=10m
RATE_LIMIT_COMENTARIO_MAX_REQUESTS=30
RATE_LIMIT_COMENTARIO_WINDOW=10m
RATE_LIMIT_INTERACAO_MAX_REQUESTS=60
RATE_LIMIT_INTERACAO_WINDOW=10m
RATE_LIMIT_SINALIZACAO_MAX_REQUESTS=10
RATE_LIMIT_SINALIZACAO_WINDOW=10m
RATE_LIMIT_UPLOAD_MAX_REQUESTS=20
RATE_LIMIT_UPLOAD_WINDOW=10m
```

`RATE_LIMIT_USE_X_FORWARDED_FOR` ficou desativado por padrao. So deve ser ligado quando a aplicacao estiver atras de um proxy confiavel configurado corretamente.

## Swagger

O texto geral da OpenAPI foi atualizado para explicar o formato de erro e o erro `429 LIMITE_REQUISICOES`.

Os endpoints de autenticacao e upload tambem receberam descricoes mais claras sobre limite de requisicoes.

## Testes

Foi adicionado teste unitario para o servico de limite de requisicoes:

- permite chamadas dentro da janela;
- bloqueia quando passa do maximo;
- ignora limites quando a protecao esta desativada.

Nos testes de contexto da aplicacao, o rate limit fica desligado para nao interferir nos fluxos funcionais.

## Limites conhecidos

O limitador atual e em memoria. Isso e suficiente para desenvolvimento e um MVP simples com uma unica instancia.

Quando o sistema for para producao com mais de uma instancia, o ideal sera trocar esse armazenamento por Redis ou outro mecanismo compartilhado, mantendo a mesma ideia de regras por endpoint.
