# Alteracao 021 - Filtros e listagens para o frontend

## Objetivo

Preparar as listagens de denuncias para as primeiras telas do frontend sem criar regras novas fora do escopo definido.

Esta alteracao cobre:

- listagem geral de denuncias com filtro por organizacao responsavel;
- listagem de denuncias do morador autenticado;
- listagem operacional de denuncias da prefeitura ou secretaria com filtros basicos;
- Swagger atualizado para deixar os filtros visiveis e intuitivos;
- testes de integracao dos fluxos de listagem principais.

## Endpoints ajustados

### `GET /api/denuncias`

Continua exigindo usuario autenticado e agora permite filtros por:

- `cidade`;
- `bairro`;
- `status`;
- `categoriaId`;
- `organizacaoResponsavelId`.

Uso esperado:

- timeline/lista geral;
- telas com recorte por categoria;
- telas com recorte por orgao responsavel.

### `GET /api/denuncias/minhas`

Novo endpoint para o morador consultar somente as denuncias que ele criou.

Regras:

- exige perfil `MORADOR`;
- o autor e sempre obtido pelo JWT;
- o frontend nao informa `autorId`;
- permite filtros por `cidade`, `bairro`, `status` e `categoriaId`.

Uso esperado:

- tela "Minhas denuncias";
- acompanhamento do andamento pelo morador;
- filtro rapido por status.

### `GET /api/operacional/organizacoes/{organizacaoId}/denuncias`

Agora aceita filtros por:

- `cidade`;
- `bairro`;
- `status`;
- `categoriaId`.

Regras mantidas:

- quando `organizacaoId` e uma prefeitura, o endpoint retorna denuncias da prefeitura e das secretarias filhas;
- quando `organizacaoId` e uma secretaria, retorna apenas denuncias atribuidas a essa secretaria;
- prefeitura exige vinculo `ADMIN_PREFEITURA`;
- secretaria exige vinculo ativo com a secretaria.

Uso esperado:

- painel operacional da prefeitura;
- painel operacional da secretaria;
- triagem por status, bairro e categoria.

## Implementacao

O filtro compartilhado de denuncias foi expandido em `DenunciaFiltroDTO` com:

- `organizacaoResponsavelId`;
- `autorId`.

O `autorId` e usado internamente no endpoint `/api/denuncias/minhas`, evitando que o frontend consiga listar denuncias de outro morador por parametro.

No fluxo operacional, a base de permissao continua sendo montada no service:

- prefeitura: denuncias da prefeitura ou de secretarias vinculadas a ela;
- secretaria: denuncias cuja organizacao responsavel seja a propria secretaria.

Depois dessa base, os filtros de cidade, bairro, status e categoria sao aplicados.

## Testes adicionados

Arquivo:

- `src/test/java/com/mykael/prefeitura/core/denuncia/DenunciaListagemIntegrationTest.java`

Cenarios cobertos:

- morador autenticado ve apenas as proprias denuncias em `/api/denuncias/minhas`;
- prefeitura filtra denuncias operacionais por bairro, status e categoria.

## Observacoes

Esta alteracao nao cria novas tabelas nem muda estrutura do banco. Por isso, nao foi criada migration.

As listagens foram pensadas para serem suficientes para iniciar o frontend sem bloquear refinamentos futuros, como filtros por periodo, prioridade calculada ou busca textual.
