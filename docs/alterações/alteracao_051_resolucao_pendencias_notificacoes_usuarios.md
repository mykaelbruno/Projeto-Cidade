# Alteracao 051 - Resolucao de Pendencias: Notificacoes e Filtros de Usuarios

## Objetivo

Resolver pendencias simples que ainda geravam lacunas entre front e backend:

- marcar todas as notificacoes como lidas em uma chamada unica;
- filtrar usuarios no backend em vez de depender apenas de filtro local no front;
- remover mock de notificacoes dos layouts administrativos.

## Backend

### Notificacoes

Foi criado o endpoint:

```http
PATCH /api/notificacoes/leitura
```

Comportamento:

- marca todas as notificacoes ainda nao lidas do usuario autenticado;
- retorna `204 No Content`;
- nao altera notificacoes de outros usuarios.

### Usuarios

`GET /api/usuarios` passou a aceitar filtros opcionais:

```http
GET /api/usuarios?termo=maria&perfilGlobal=MORADOR&ativo=true
```

Filtros:

- `termo`: busca por nome, e-mail, username, cidade ou bairro;
- `perfilGlobal`: filtra por `ADMIN_APP`, `MODERADOR` ou `MORADOR`;
- `ativo`: filtra por usuarios ativos ou inativos.

Regra mantida:

- `ADMIN_PREFEITURA` continua limitado aos usuarios da propria cidade.
- `ADMIN_APP` enxerga a base global.

## Frontend

- Criado `notificacaoService`.
- Criados tipos de notificacao em `types/notificacao.ts`.
- `NotificationsList` deixou de usar mocks.
- `NotificationsList` agora usa:
  - `GET /api/notificacoes/minhas`;
  - `PATCH /api/notificacoes/{notificacaoId}/leitura`;
  - `PATCH /api/notificacoes/leitura`.
- `usuarioService.listar` passou a aceitar filtros.
- `UsuariosPage` passou a enviar busca, perfil e status para o backend.

## Swagger

- Documentado `PATCH /api/notificacoes/leitura`.
- Ajustadas descricoes de `Usuarios` para refletir corretamente `ADMIN_APP` e `ADMIN_PREFEITURA`.

## Validacao

- `mvn test` executado com sucesso.
- Resultado: 42 testes passaram, 1 teste ignorado por ausencia de Docker/Testcontainers.
- `npm.cmd run build` executado com sucesso no front.
- O Vite exibiu apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias conscientes restantes relacionadas

- `GET /api/usuarios` ainda retorna lista simples, nao pagina. Se a base crescer muito, paginacao server-side pode virar proximo refinamento.
- `NotificationsList` carrega as 20 notificacoes mais recentes. Tela dedicada de historico/paginacao pode ser criada depois se o produto precisar.

