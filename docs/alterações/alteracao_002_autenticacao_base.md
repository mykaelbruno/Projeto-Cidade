# Alteracao 002 - Base de autenticacao

## Objetivo

Esta alteracao inicia a autenticacao do sistema seguindo as regras definidas na documentacao e nas decisoes recentes:

- morador se autocadastra;
- morador nasce como `MORADOR`;
- login aceita e-mail ou username;
- tokens sao enviados por cookies `HttpOnly`;
- primeiro `ADMIN_APP` pode ser criado pelo sistema sem versionar senha real;
- Swagger deve explicar os endpoints de autenticacao.

## Ajustes no modelo de usuario

O usuario recebeu os campos:

- `username`;
- `perfilGlobal`.

O campo `username` e unico e pode ser usado no login junto com o e-mail.

O campo `perfilGlobal` representa papeis que nao dependem de uma prefeitura ou secretaria:

```txt
ADMIN_APP
MORADOR
MODERADOR
```

## Ajuste nos papeis institucionais

O enum `PapelUsuario`, usado nos vinculos com organizacoes, agora representa apenas papeis ligados a prefeitura ou secretaria:

```txt
ADMIN_PREFEITURA
ADMIN_SECRETARIA
ATENDENTE_SECRETARIA
```

Essa separacao evita obrigar um morador a ter vinculo com uma prefeitura para conseguir ter papel no sistema.

## Endpoints criados

Modulo:

```txt
infra/auth
```

Endpoints:

```txt
POST /api/auth/cadastro-morador
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me
```

### Cadastro de morador

Cria um usuario com perfil global `MORADOR`.

Campos principais:

- nome;
- e-mail;
- username;
- senha;
- telefone;
- cidade;
- bairro.

### Login

O login usa o campo `identificador`, que aceita:

- e-mail;
- username.

### Refresh

Usa o cookie `refresh_token` para emitir um novo `access_token`.

### Logout

Revoga o refresh token atual e limpa os cookies.

### Me

Retorna dados seguros do usuario autenticado.

## Cookies de autenticacao

Cookies usados:

```txt
access_token
refresh_token
```

Configuracao:

- `HttpOnly`;
- `SameSite=Lax`;
- `Secure` configuravel por ambiente;
- `Path=/`.

## Refresh token

Foi criada a tabela:

```txt
refresh_tokens
```

O valor puro do refresh token nao e salvo no banco. Apenas o hash SHA-256 e persistido.

## Primeiro ADMIN_APP

Foi criado um inicializador em:

```txt
infra/auth/admin
```

Ele so cria o admin inicial quando:

```txt
ADMIN_APP_ENABLED=true
```

Variaveis necessarias:

```txt
ADMIN_APP_USERNAME
ADMIN_APP_EMAIL
ADMIN_APP_PASSWORD
```

Variaveis opcionais:

```txt
ADMIN_APP_NAME
ADMIN_APP_CITY
ADMIN_APP_NEIGHBORHOOD
```

Essa decisao evita colocar uma senha padrao fixa no codigo.

## Swagger/OpenAPI

O Swagger recebeu documentacao para:

- cadastro;
- login;
- refresh;
- logout;
- usuario logado.

Tambem foram adicionados esquemas de autenticacao:

- `cookieAuth`: cookie `access_token`;
- `bearerAuth`: header `Authorization: Bearer`, util para testes tecnicos.

## Observacoes importantes

- A autenticacao com JWT foi iniciada.
- O access token tem duracao curta.
- O refresh token tem duracao maior.
- A API ja aceita o token vindo do cookie `access_token`.
- As proximas etapas devem adicionar permissoes finas por endpoint.
