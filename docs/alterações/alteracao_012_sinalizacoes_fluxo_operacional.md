# Alteracao 012 - Sinalizacoes e fluxo operacional prefeitura/secretaria

## Objetivo

Adicionar reports de denuncia para moderacao e iniciar o fluxo operacional entre prefeitura e secretarias.

## Sinalizacao/report de denuncia

Qualquer usuario autenticado pode sinalizar uma denuncia para a moderacao.

Endpoint:

`POST /api/denuncias/{denunciaId}/sinalizacoes`

Corpo:

```json
{
  "motivo": "Conteudo inadequado ou denuncia falsa."
}
```

Regras:

- qualquer usuario autenticado pode sinalizar;
- motivo e obrigatorio;
- cada usuario pode sinalizar a mesma denuncia apenas uma vez;
- a sinalizacao nao aparece na timeline publica da denuncia;
- a sinalizacao entra em uma fila da moderacao com status `PENDENTE`.

Endpoints da moderacao:

`GET /api/moderacoes/sinalizacoes-denuncia`

Lista sinalizacoes para `ADMIN_APP` e `MODERADOR`. Por padrao retorna apenas pendentes.

`POST /api/moderacoes/sinalizacoes-denuncia/{sinalizacaoId}/analise`

Marca uma sinalizacao pendente como `ANALISADA`.

## Fluxo operacional

Foi criado o modulo `core/operacional`.

### Listagem por organizacao

Endpoint:

`GET /api/operacional/organizacoes/{organizacaoId}/denuncias`

Regras:

- se a organizacao for prefeitura, retorna denuncias da prefeitura e de todas as suas secretarias;
- se a organizacao for secretaria, retorna apenas denuncias atribuidas aquela secretaria;
- usuario de prefeitura precisa ter papel `ADMIN_PREFEITURA` na prefeitura;
- usuario de secretaria precisa ter vinculo ativo com a secretaria.

### Secretaria solicita transferencia

Endpoint:

`POST /api/operacional/denuncias/{denunciaId}/solicitacoes-transferencia`

Corpo:

```json
{
  "organizacaoDestinoSugeridaId": 10,
  "motivo": "Esta demanda pertence a outra secretaria."
}
```

Regras:

- `ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA` podem solicitar;
- a denuncia precisa estar sob responsabilidade da secretaria solicitante;
- pode haver uma secretaria destino sugerida;
- a secretaria destino sugerida deve pertencer a mesma prefeitura;
- apenas uma solicitacao pendente por denuncia e permitida;
- a timeline recebe evento `TRANSFERENCIA_SOLICITADA`.

### Prefeitura avalia solicitacoes

Endpoint:

`GET /api/operacional/prefeituras/{prefeituraId}/solicitacoes-transferencia`

Lista solicitacoes de transferencia para `ADMIN_PREFEITURA`.

### Prefeitura aprova transferencia

Endpoint:

`POST /api/operacional/solicitacoes-transferencia/{solicitacaoId}/aprovacao`

Corpo:

```json
{
  "organizacaoDestinoId": 10,
  "motivo": "Transferencia confirmada."
}
```

Regras:

- apenas `ADMIN_PREFEITURA`;
- a secretaria destino precisa pertencer a prefeitura;
- se `organizacaoDestinoId` nao for informado, o sistema usa a secretaria sugerida pela solicitacao;
- se nao houver destino informado nem sugerido, a aprovacao e recusada pela API;
- a denuncia passa a ter a nova secretaria responsavel;
- a timeline recebe evento `TRANSFERENCIA_APROVADA`.

### Prefeitura recusa transferencia

Endpoint:

`POST /api/operacional/solicitacoes-transferencia/{solicitacaoId}/recusa`

Corpo:

```json
{
  "motivo": "A demanda permanece com a secretaria atual."
}
```

Regras:

- apenas `ADMIN_PREFEITURA`;
- motivo obrigatorio;
- a timeline recebe evento `TRANSFERENCIA_RECUSADA`.

### Prefeitura altera responsavel manualmente

Endpoint:

`PATCH /api/operacional/denuncias/{denunciaId}/responsavel`

Corpo:

```json
{
  "organizacaoDestinoId": 10,
  "motivo": "Ajuste manual de triagem."
}
```

Regras:

- apenas `ADMIN_PREFEITURA`;
- a organizacao destino deve ser uma secretaria;
- a organizacao destino deve pertencer a mesma prefeitura quando a denuncia ja tiver responsavel;
- transferencia entre prefeituras ainda nao foi definida;
- a timeline recebe evento `RESPONSAVEL_ALTERADO_PREFEITURA`.

## Banco de dados

Foi criada a tabela `sinalizacoes_denuncia`.

Foi criada a tabela `solicitacoes_transferencia_denuncia`.

O check de tipos da `timeline_denuncia` foi atualizado para aceitar:

- `TRANSFERENCIA_SOLICITADA`
- `TRANSFERENCIA_APROVADA`
- `TRANSFERENCIA_RECUSADA`
- `RESPONSAVEL_ALTERADO_PREFEITURA`

## Swagger/OpenAPI

Foram criados os grupos:

- `Sinalizacoes de Denuncia`
- `Operacional`

## Alteracoes tecnicas

Arquivos criados:

- `core/sinalizacao/SinalizacaoDenuncia.java`
- `core/sinalizacao/SinalizacaoDenunciaRepository.java`
- `core/sinalizacao/SinalizacaoDenunciaService.java`
- `core/sinalizacao/SinalizacaoDenunciaController.java`
- `core/sinalizacao/SinalizacaoDenunciaControllerOpenApi.java`
- `core/sinalizacao/StatusSinalizacaoDenuncia.java`
- `core/sinalizacao/dto/SinalizacaoDenunciaRequestDTO.java`
- `core/sinalizacao/dto/SinalizacaoDenunciaResponseDTO.java`
- `core/operacional/SolicitacaoTransferenciaDenuncia.java`
- `core/operacional/SolicitacaoTransferenciaDenunciaRepository.java`
- `core/operacional/OperacionalDenunciaService.java`
- `core/operacional/OperacionalDenunciaController.java`
- `core/operacional/OperacionalDenunciaControllerOpenApi.java`
- `core/operacional/StatusSolicitacaoTransferencia.java`
- `core/operacional/dto/AlterarResponsavelDenunciaRequestDTO.java`
- `core/operacional/dto/SolicitacaoTransferenciaAprovacaoRequestDTO.java`
- `core/operacional/dto/SolicitacaoTransferenciaCreateRequestDTO.java`
- `core/operacional/dto/SolicitacaoTransferenciaRecusaRequestDTO.java`
- `core/operacional/dto/SolicitacaoTransferenciaResponseDTO.java`
- Tabelas de sinalizacoes e fluxo operacional incorporadas em `db/migration/V1__create_core_tables.sql` na alteracao 014.

Arquivos alterados:

- `core/denuncia/DenunciaRepository.java`
- `core/timeline/TipoEventoTimeline.java`
- `core/timeline/TimelineDenunciaService.java`

## Pendencias conscientes

- Ainda nao existe transferencia entre prefeituras.
- A aprovacao de transferencia troca a organizacao responsavel, mas nao muda status automaticamente.
- Reports/sinalizacoes nao criam evento publico na timeline para evitar exposicao do usuario que reportou.
