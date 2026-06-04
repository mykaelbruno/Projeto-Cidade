# Alteracao 013 - Notificacoes internas e feedback de conclusao

## Objetivo

Criar notificacoes internas para eventos importantes do sistema e registrar a regra de que a conclusao final de uma denuncia depende do retorno do morador.

## Decisao de produto registrada

O status da denuncia pode pular etapas. A organizacao responsavel pode marcar o status que considerar correto no momento.

Quando uma denuncia e marcada como `CONCLUIDO`, isso significa que a prefeitura ou secretaria considera o atendimento concluido, mas ainda nao significa que o morador confirmou a resolucao.

O morador autor pode:

- confirmar a conclusao;
- contestar a conclusao, reabrindo a denuncia.

## Notificacoes internas

Foi criado o modulo `core/notificacao`.

Tipos iniciais:

- `DENUNCIA_ATRIBUIDA`
- `DENUNCIA_CONCLUIDA_AGUARDANDO_CONFIRMACAO`
- `TRANSFERENCIA_SOLICITADA`
- `TRANSFERENCIA_APROVADA`
- `TRANSFERENCIA_RECUSADA`
- `SINALIZACAO_DENUNCIA_RECEBIDA`

Endpoints:

`GET /api/notificacoes/minhas`

Retorna notificacoes do usuario autenticado.

Parametro opcional:

- `somenteNaoLidas`: quando `true`, retorna apenas notificacoes nao lidas.

`PATCH /api/notificacoes/{notificacaoId}/leitura`

Marca uma notificacao do usuario autenticado como lida.

## Eventos que geram notificacao

### Nova denuncia atribuida

Quando uma denuncia nasce com organizacao responsavel, os usuarios vinculados a essa organizacao sao notificados.

### Status concluido

Quando a organizacao marca uma denuncia como `CONCLUIDO`, o morador autor recebe uma notificacao para confirmar se o problema foi resolvido.

### Contestacao de conclusao

Quando o morador contesta uma conclusao, a denuncia volta para `REABERTO` e a organizacao responsavel e notificada.

### Transferencia operacional

Quando uma secretaria solicita transferencia, a prefeitura recebe notificacao.

Quando a prefeitura aprova:

- a secretaria de origem e notificada;
- a secretaria de destino e notificada.

Quando a prefeitura recusa:

- a secretaria de origem e notificada.

### Sinalizacao/report

Quando uma denuncia e sinalizada, moderadores e admins app sao notificados.

## Feedback de conclusao pelo morador

Novos endpoints:

`POST /api/denuncias/{id}/conclusao/confirmacao`

Confirma que a denuncia marcada como `CONCLUIDO` foi realmente resolvida.

`POST /api/denuncias/{id}/conclusao/contestacao`

Contesta a conclusao. A denuncia volta para `REABERTO`.

Corpo opcional:

```json
{
  "feedback": "Ainda ha entulho no local."
}
```

Eventos de timeline:

- `CONCLUSAO_CONFIRMADA_MORADOR`
- `CONCLUSAO_CONTESTADA_MORADOR`

## Banco de dados

Foi criada a tabela `notificacoes`.

Foram adicionados campos na tabela `denuncias`:

- `conclusao_confirmada_em`
- `conclusao_contestada_em`
- `feedback_conclusao`

O check da `timeline_denuncia` foi atualizado para aceitar os novos eventos de conclusao.

## Swagger/OpenAPI

Foi criado o grupo `Notificacoes`.

O grupo `Denuncias` foi atualizado com endpoints de confirmacao e contestacao de conclusao.

## Alteracoes tecnicas

Arquivos criados:

- `core/notificacao/Notificacao.java`
- `core/notificacao/NotificacaoRepository.java`
- `core/notificacao/NotificacaoService.java`
- `core/notificacao/NotificacaoController.java`
- `core/notificacao/NotificacaoControllerOpenApi.java`
- `core/notificacao/TipoNotificacao.java`
- `core/notificacao/dto/NotificacaoResponseDTO.java`
- `core/denuncia/dto/FeedbackConclusaoRequestDTO.java`
- Tabela de notificacoes e campos de feedback incorporados em `db/migration/V1__create_core_tables.sql` na alteracao 014.

Arquivos alterados:

- `core/denuncia/Denuncia.java`
- `core/denuncia/DenunciaService.java`
- `core/denuncia/DenunciaController.java`
- `core/denuncia/DenunciaControllerOpenApi.java`
- `core/denuncia/dto/DenunciaResponseDTO.java`
- `core/operacional/OperacionalDenunciaService.java`
- `core/sinalizacao/SinalizacaoDenunciaService.java`
- `core/timeline/TipoEventoTimeline.java`
- `core/timeline/TimelineDenunciaService.java`
- `core/usuario/UsuarioRepository.java`
- `core/vinculo/VinculoUsuarioOrganizacaoRepository.java`
- `docs/diretrizes_desenvolvimento_projeto.md`

## Pendencias conscientes

- Notificacoes sao internas no banco e, desde a alteracao 031, tambem podem disparar e-mail quando `MAIL_ENABLED=true` e `MAIL_NOTIFICATIONS_ENABLED=true`.
- Ainda nao existe push notification ou websocket.
- Confirmacao/contestacao so pode ser feita pelo autor da denuncia.
- Contestacao reabre a denuncia com status `REABERTO`.
