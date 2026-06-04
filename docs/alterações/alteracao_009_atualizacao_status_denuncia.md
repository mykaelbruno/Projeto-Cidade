# Alteracao 009 - Atualizacao de status da denuncia

## Objetivo

Permitir que usuarios institucionais atualizem o status de uma denuncia e registrar essa mudanca na timeline historica.

Esta alteracao nao cria uma regra fechada de transicao entre status. Ou seja, o backend ainda nao impede, por exemplo, mudar de `ABERTO` direto para `CONCLUIDO`. Essa regra depende de decisao de produto e deve ser definida antes de endurecer o fluxo.

## Endpoint criado

`PATCH /api/denuncias/{id}/status`

Permissoes aceitas:

- `ADMIN_PREFEITURA`
- `ADMIN_SECRETARIA`
- `ATENDENTE_SECRETARIA`

Corpo esperado:

```json
{
  "status": "EM_ANALISE",
  "organizacaoId": 1,
  "motivo": "Triagem inicial realizada pela secretaria."
}
```

Campos:

- `status`: novo status da denuncia.
- `organizacaoId`: organizacao pela qual o usuario esta atuando.
- `motivo`: texto opcional, com ate 300 caracteres.

## Regras aplicadas

- O usuario precisa estar ativo.
- A organizacao informada precisa estar ativa.
- O usuario precisa ter vinculo ativo com a organizacao informada.
- Se a denuncia ja tiver uma organizacao responsavel, apenas essa organizacao pode atualizar o status.
- Se a denuncia ainda nao tiver organizacao responsavel, a primeira organizacao que atualizar o status passa a ficar registrada como responsavel.
- Se o status enviado for igual ao status atual, a API apenas retorna a denuncia sem criar novo evento na timeline.

## Timeline historica

Foi adicionado o evento:

`STATUS_ALTERADO`

Quando o status muda, a timeline recebe um evento destacado com:

- status anterior;
- novo status;
- usuario que fez a alteracao;
- organizacao representada;
- motivo, quando informado.

Exemplo de descricao:

```txt
Status alterado de ABERTO para EM_ANALISE. Motivo: Triagem inicial realizada pela secretaria.
```

## Swagger/OpenAPI

A documentacao do grupo `Denuncias` foi atualizada com o novo endpoint de alteracao de status.

## Alteracoes tecnicas

Arquivos criados:

- `core/denuncia/dto/StatusDenunciaUpdateRequestDTO.java`
- Evento de timeline incorporado em `db/migration/V1__create_core_tables.sql` na alteracao 014.

Arquivos alterados:

- `core/denuncia/Denuncia.java`
- `core/denuncia/DenunciaService.java`
- `core/denuncia/DenunciaController.java`
- `core/denuncia/DenunciaControllerOpenApi.java`
- `core/timeline/TipoEventoTimeline.java`
- `core/timeline/TimelineDenunciaService.java`

## Pendencias conscientes

Ainda falta definir se o sistema deve ter um fluxo obrigatorio de status, por exemplo:

```txt
ABERTO -> EM_ANALISE -> ENCAMINHADO -> EM_ANDAMENTO -> CONCLUIDO
```

Essa decisao nao foi implementada agora para evitar inventar regra de negocio sem validacao.
