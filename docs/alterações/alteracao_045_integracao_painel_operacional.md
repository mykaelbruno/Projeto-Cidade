# Alteracao 045 - Integracao do Painel Operacional Prefeitura/Secretaria

Data: 2026-06-02

## Objetivo

Integrar as telas operacionais de prefeitura e secretaria ao backend real, removendo os mocks antigos que faziam a prefeitura cair em uma secretaria fixa e davam a impressao de dados repetidos.

## O que foi feito

- Criado `front/src/app/types/operacional.ts` com os DTOs do painel operacional, transferencias, status e resposta oficial.
- Criado `front/src/app/services/operacionalService.ts` para centralizar:
  - resumo operacional;
  - listagem operacional de denuncias;
  - atualizacao de status;
  - resposta oficial;
  - solicitacao de transferencia;
  - aprovacao/recusa de transferencia;
  - reatribuicao manual;
  - exportacao CSV.
- Adicionado `organizacaoService.listar()` para a prefeitura carregar suas secretarias e usar em reatribuicoes.
- Criado `front/src/app/utils/operacionalContext.ts` para descobrir a organizacao ativa a partir de `vinculosOperacionais`.
- Criado `OperationalDashboard`, usado tanto por prefeitura quanto secretaria.
- Criado `OperationalReports`, usado tanto por prefeitura quanto secretaria.
- Substituidas as paginas antigas mockadas por wrappers simples:
  - `DashboardPage`;
  - `RelatosPage`;
  - `DashboardSecretariaPage`;
  - `RelatosSecretariaPage`.

## Regras respeitadas

- Prefeitura abre direto o painel da prefeitura vinculada, sem caixa de selecao.
- Secretaria abre direto o painel da secretaria vinculada.
- Denuncias concluidas continuam aparecendo na listagem, sem regra de ocultacao.
- Prefeitura nao cria denuncias.
- Prefeitura avalia transferencias pendentes, aprova/recusa e pode reatribuir manualmente.
- Secretaria solicita transferencia com motivo obrigatorio.

## Pendencias conscientes

- A secretaria nao recebe lista de secretarias para sugerir destino porque o endpoint `GET /api/organizacoes` exige `ADMIN_APP` ou `ADMIN_PREFEITURA`. Por isso, a tela da secretaria envia a solicitacao com motivo e destino opcional nulo quando a lista nao estiver disponivel.
- A listagem operacional usa `size=100` como solucao inicial para acelerar a integracao. Se o volume crescer, o proximo ajuste deve ser paginacao visual completa.
- O build do front gerou apenas o aviso de chunk grande do Vite, sem erro de compilacao.

## Validacao

- `npm.cmd run build` executado com sucesso em `front/`.
