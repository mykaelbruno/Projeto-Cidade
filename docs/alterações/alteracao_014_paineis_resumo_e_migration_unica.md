# Alteracao 014 - Paineis de resumo e migration unica

## Objetivo

Adicionar endpoints de resumo para facilitar a construcao dos paineis da prefeitura, das secretarias e da moderacao.

Tambem foi consolidado o schema do banco em uma unica migration inicial, porque o projeto ainda nao foi executado localmente. Assim, o banco nasce diretamente no formato atual e evita uma lista grande de migrations historicas artificiais da fase inicial de desenvolvimento.

## Endpoints adicionados

### Resumo operacional

`GET /api/paineis/operacional/organizacoes/{organizacaoId}/resumo`

Permissoes:

- `ADMIN_PREFEITURA`
- `ADMIN_SECRETARIA`
- `ATENDENTE_SECRETARIA`

Regras:

- Se a organizacao for uma prefeitura, o usuario precisa ser `ADMIN_PREFEITURA` dela.
- Para prefeitura, o resumo considera denuncias atribuidas diretamente a prefeitura e denuncias das secretarias filhas.
- Se a organizacao for uma secretaria, o usuario precisa ter vinculo ativo com ela.
- Para secretaria, o resumo considera apenas denuncias atribuidas a secretaria.

Campos retornados:

- `organizacaoId`
- `organizacaoNome`
- `tipoOrganizacao`
- `denuncias.total`
- `denuncias.abertas`
- `denuncias.emAnalise`
- `denuncias.encaminhadas`
- `denuncias.emAndamento`
- `denuncias.programadas`
- `denuncias.concluidasAguardandoConfirmacao`
- `denuncias.concluidasConfirmadas`
- `denuncias.reabertas`
- `denuncias.arquivadas`
- `transferenciasPendentes`

### Resumo de moderacao

`GET /api/paineis/moderacao/resumo`

Permissoes:

- `ADMIN_APP`
- `MODERADOR`

Campos retornados:

- `sinalizacoesPendentes`
- `sinalizacoesAnalisadas`
- `denunciasArquivadasModeracao`
- `comentariosRemovidosModeracao`

## Organizacao tecnica

Novo pacote:

- `core/painel`

Arquivos principais:

- `PainelController`
- `PainelControllerOpenApi`
- `PainelService`
- `PainelOperacionalRepository`
- `dto/ContadoresDenunciaDTO`
- `dto/PainelOperacionalResumoDTO`
- `dto/PainelModeracaoResumoDTO`

O pacote segue a ideia do projeto:

- Controller para expor API.
- ControllerOpenApi para manter Swagger claro e atualizado.
- Service para regras de permissao e composicao do retorno.
- Repository para consultas agregadas.
- DTOs para respostas simples e previsiveis.

## Migration unica

As migrations `V2` ate `V7` foram incorporadas na `V1__create_core_tables.sql`.

Como o projeto ainda nao foi executado, essa decisao simplifica o historico inicial sem quebrar banco existente. Quando o projeto ja estiver rodando em algum ambiente real, novas alteracoes devem voltar a ser criadas como novas migrations incrementais, sem reescrever migrations ja aplicadas.

## Observacoes de produto

O painel nao muda as regras de negocio ja definidas:

- A prefeitura continua vendo as denuncias das suas secretarias.
- A secretaria continua vendo apenas o que esta sob sua responsabilidade.
- Sinalizacoes continuam sendo globais para moderacao.
- Denuncias concluidas continuam aguardando confirmacao do morador autor antes de serem tratadas como confirmadas.
