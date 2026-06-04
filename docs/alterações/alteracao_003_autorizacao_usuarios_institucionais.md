# Alteracao 003 - Autorizacao e usuarios institucionais

## Objetivo

Esta alteracao inicia o controle de autorizacao por perfil e papel institucional, alem de criar endpoints para:

- `ADMIN_APP` criar usuarios globais;
- `ADMIN_APP` cadastrar prefeituras;
- `ADMIN_APP` ou `ADMIN_PREFEITURA` cadastrar secretarias;
- `ADMIN_APP` ou `ADMIN_PREFEITURA` criar usuarios institucionais vinculados a uma prefeitura ou secretaria.

## Decisao sobre conta de secretaria

Foi decidido nao tratar secretaria como uma conta compartilhada.

A secretaria e uma organizacao. Pessoas reais fazem login e atuam vinculadas a ela.

Motivo:

- preserva auditoria;
- permite saber quem respondeu ou alterou algo;
- evita compartilhamento de senha;
- facilita bloqueio de usuario individual sem derrubar a secretaria inteira.

O papel `ATENDENTE_SECRETARIA` continua existindo como opcional. Para MVP, o sistema pode operar apenas com `ADMIN_SECRETARIA` se a interface for simplificada.

## Autorizacao por metodo

Foi habilitado:

```txt
@EnableMethodSecurity
```

Isso permite proteger endpoints com:

```txt
@PreAuthorize
```

## Endpoints de usuarios

Modulo:

```txt
core/usuario
```

Endpoint criado:

```txt
POST /api/usuarios
```

Permissao:

```txt
ADMIN_APP
```

Esse endpoint permite que o `ADMIN_APP` crie usuarios globais:

```txt
ADMIN_APP
MORADOR
MODERADOR
```

## Endpoints de organizacoes

Modulo:

```txt
core/organizacao
```

### Criar prefeitura

```txt
POST /api/organizacoes/prefeituras
```

Permissao:

```txt
ADMIN_APP
```

### Criar secretaria

```txt
POST /api/organizacoes/prefeituras/{prefeituraId}/secretarias
```

Permissoes:

```txt
ADMIN_APP
ADMIN_PREFEITURA da prefeitura informada
```

Secretarias herdam cidade e estado da prefeitura.

### Criar usuario institucional

```txt
POST /api/organizacoes/{organizacaoId}/usuarios-institucionais
```

Permissoes:

```txt
ADMIN_APP
ADMIN_PREFEITURA da prefeitura relacionada
```

Regras:

- em prefeitura, so pode criar `ADMIN_PREFEITURA`;
- em secretaria, pode criar `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA`;
- `ADMIN_APP` pode criar qualquer usuario institucional;
- `ADMIN_PREFEITURA` so pode criar usuarios dentro da propria prefeitura ou secretarias filhas.

## Swagger/OpenAPI

As operacoes novas foram documentadas nos respectivos `ControllerOpenApi`.

Rotas protegidas usam `cookieAuth` na documentacao.

## Observacoes de seguranca

- A validacao de permissao nao depende apenas do papel no token.
- Para operacoes de prefeitura, o backend tambem confere se o usuario tem vinculo com a prefeitura correta.
- Nao foi criada conta compartilhada para secretaria.
