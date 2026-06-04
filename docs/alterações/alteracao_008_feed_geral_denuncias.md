# Alteracao 008 - Feed geral de denuncias

## Objetivo

Criar uma timeline geral de denuncias para a tela inicial do app, separada da timeline historica de cada denuncia.

A timeline historica continua sendo auditavel e fiel aos eventos de uma denuncia especifica. O feed geral tem outro objetivo: ajudar moradores e equipes a descobrirem denuncias relevantes sem deixar que apenas as maiores fiquem sempre no topo.

## Endpoint criado

`GET /api/feed/denuncias`

O endpoint exige usuario autenticado e aceita filtros opcionais:

- `cidade`
- `bairro`
- `status`
- `categoriaId`
- `modo`

Modos de ordenacao:

- `RECENTES`: prioriza denuncias mais novas.
- `EM_ALTA`: prioriza denuncias com maior pontuacao de relevancia.
- `MISTO`: modo padrao, combina relevancia e recencia.

## Como funciona o modo MISTO

O modo `MISTO` usa uma regra simples e explicita:

```txt
pontuacaoFeed = relevanciaLimitada + bonusRecencia
```

`relevanciaLimitada`:

```txt
min(pontuacaoRelevancia, 30)
```

Isso evita que uma denuncia com engajamento muito alto domine o topo indefinidamente.

`bonusRecencia`:

```txt
ate 6 horas: 20 pontos
ate 24 horas: 15 pontos
ate 72 horas: 10 pontos
ate 7 dias: 5 pontos
mais antiga: 0 ponto
```

Essa regra da oportunidade para denuncias novas sem ignorar denuncias com engajamento real.

Atualizacao posterior: denuncias com status `ARQUIVADO` nao aparecem no feed por padrao. Para consulta-las, o cliente deve pedir explicitamente `status=ARQUIVADO`.

## Resposta do feed

Cada item retorna:

- dados publicos da denuncia;
- modo de ordenacao usado;
- `pontuacaoFeed`;
- `motivoOrdenacao`, para ajudar a interface a explicar por que aquele item apareceu.

Exemplos de motivos:

- `Denuncia nova`
- `Recente com engajamento`
- `Engajamento relevante`
- `Ordenacao mista`

## Swagger/OpenAPI

Foi criado o grupo `Feed de Denuncias`, com descricao do comportamento dos modos e dos filtros.

## Alteracoes tecnicas

Arquivos criados:

- `core/feed/ModoOrdenacaoFeed.java`
- `core/feed/FeedDenunciaRepository.java`
- `core/feed/FeedDenunciaService.java`
- `core/feed/FeedDenunciaController.java`
- `core/feed/FeedDenunciaControllerOpenApi.java`
- `core/feed/dto/FeedDenunciaFiltroDTO.java`
- `core/feed/dto/FeedDenunciaResponseDTO.java`
- Indices de feed incorporados em `db/migration/V1__create_core_tables.sql` na alteracao 014.

Tambem foi atualizada a diretriz do projeto para registrar que o feed geral deve usar `MISTO` como padrao no MVP.

## Observacoes

Esta implementacao ainda nao usa geolocalizacao, reincidencia por bairro, reputacao de usuario ou historico de reabertura. Esses fatores podem melhorar o algoritmo no futuro, mas foram deixados de fora para manter o MVP claro, auditavel e facil de ajustar.
