# Alteracao 017 - Manutencao administrativa

## Objetivo

Adicionar endpoints de manutencao para que o backend fique mais pronto para o painel administrativo e para o front.

Antes desta alteracao, varios fluxos ja permitiam criar registros, mas ainda faltavam operacoes praticas para editar, ativar e desativar dados principais do sistema.

## Usuarios

Endpoints adicionados em `/api/usuarios`:

- `PUT /api/usuarios/{usuarioId}`
- `PATCH /api/usuarios/{usuarioId}/ativacao`

Permissao:

- `ADMIN_APP`

Regras:

- `ADMIN_APP` pode atualizar dados cadastrais e perfil global.
- E-mail e username continuam unicos.
- O ultimo `ADMIN_APP` ativo nao pode ser desativado.
- O endpoint de ativacao usa corpo claro para o Swagger:

```json
{
  "ativo": true
}
```

## Organizacoes

Endpoints adicionados em `/api/organizacoes`:

- `PUT /api/organizacoes/{organizacaoId}`
- `PATCH /api/organizacoes/{organizacaoId}/ativacao`

Permissoes:

- `ADMIN_APP`
- `ADMIN_PREFEITURA`

Regras:

- Nao altera tipo da organizacao.
- Nao altera hierarquia entre prefeitura e secretaria.
- `ADMIN_PREFEITURA` so pode alterar a propria prefeitura ou secretarias dela.
- `ADMIN_APP` pode atuar globalmente.

## Categorias

Endpoints adicionados em `/api/categorias`:

- `POST /api/categorias`
- `PUT /api/categorias/{categoriaId}`
- `PATCH /api/categorias/{categoriaId}/ativacao`

Permissao:

- `ADMIN_APP`

Regras:

- Categorias continuam globais.
- A organizacao responsavel padrao e opcional.
- Se informada, a organizacao responsavel padrao precisa existir e estar ativa.

## Vinculos institucionais

Endpoints adicionados ou reforcados em `/api/vinculos`:

- `GET /api/vinculos`
- `GET /api/vinculos/organizacoes/{organizacaoId}`
- `PUT /api/vinculos/{vinculoId}`

Permissoes:

- `GET /api/vinculos`: apenas `ADMIN_APP`.
- Demais endpoints: `ADMIN_APP` ou `ADMIN_PREFEITURA`.

Regras:

- `ADMIN_PREFEITURA` so acessa vinculos da propria prefeitura ou das secretarias filhas.
- Prefeitura aceita apenas papel `ADMIN_PREFEITURA`.
- Secretaria aceita `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA`.
- O endpoint de atualizacao altera papel e situacao ativa do vinculo.

## Swagger

Todos os novos endpoints foram adicionados aos respectivos `ControllerOpenApi`.

Para ativacao/desativacao foi criado o DTO comum:

- `core/comum/dto/AtivacaoRequestDTO`

Isso evita corpo booleano solto no Swagger e deixa o uso mais claro para o front.

## Observacoes

Essa alteracao nao muda o schema do banco. Nao foi criada nova migration.

Os campos `atualizadoEm` de usuarios e organizacoes agora sao atualizados quando os setters principais sao chamados.
