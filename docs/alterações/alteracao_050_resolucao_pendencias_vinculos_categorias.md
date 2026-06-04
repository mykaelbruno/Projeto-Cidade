# Alteracao 050 - Resolucao de Pendencias: Vinculos e Categorias de Secretaria

## Objetivo

Resolver pendencias conscientes que impediam o Admin App de operar alguns fluxos sem simulacao:

- criar vinculo institucional para usuario ja existente;
- editar as categorias atendidas por uma secretaria depois da criacao.

## Backend

### Vinculo de usuario existente

Foi criado o endpoint:

```http
POST /api/vinculos
```

Payload:

```json
{
  "usuarioId": 10,
  "organizacaoId": 3,
  "papel": "ATENDENTE_SECRETARIA",
  "ativo": true
}
```

Regras:

- permitido para `ADMIN_APP` e `ADMIN_PREFEITURA`;
- prefeitura so pode vincular dentro do proprio escopo;
- usuario precisa estar ativo;
- usuario precisa ter perfil global `MORADOR`;
- usuario nao pode possuir outro vinculo institucional ativo;
- organizacao precisa estar ativa;
- prefeitura aceita apenas `ADMIN_PREFEITURA`;
- secretaria aceita `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA`.

### Categorias atendidas pela secretaria

Foi criado o endpoint:

```http
PATCH /api/organizacoes/{organizacaoId}/categorias
```

Payload:

```json
{
  "categoriasIds": [1, 2, 3]
}
```

Regras:

- `organizacaoId` precisa ser uma secretaria;
- categorias removidas voltam para distribuicao manual;
- categorias enviadas passam a usar essa secretaria como responsavel padrao;
- apenas categorias ativas podem ser vinculadas;
- permitido para `ADMIN_APP` e `ADMIN_PREFEITURA` dentro do escopo da prefeitura.

## Frontend

- `vinculoService` passou a expor `criar`.
- `VinculosPage` recebeu o fluxo "Vincular Existente".
- `organizacaoService` passou a expor `atualizarCategoriasSecretaria`.
- `OrganizacoesPage` agora carrega as categorias ja atendidas por uma secretaria ao editar.
- Ao salvar uma secretaria, o front atualiza tambem suas categorias atendidas.

## Swagger

- Adicionados exemplos para `POST /api/vinculos`.
- Adicionados exemplos para `PATCH /api/organizacoes/{id}/categorias`.
- Descricoes documentam permissao e regra principal dos novos endpoints.

## Validacao

- `mvn test` executado com sucesso.
- Resultado: 42 testes passaram, 1 teste ignorado por ausencia de Docker/Testcontainers.
- `npm.cmd run build` executado com sucesso no front.
- O Vite exibiu apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias conscientes restantes relacionadas

- O fluxo de vincular usuario existente usa ID exato porque ainda nao existe busca server-side de usuario por texto.
- A regra de um unico vinculo institucional ativo foi mantida para respeitar a decisao de que o usuario acessa visualmente apenas uma organizacao por login.

