# Alteracao 033 - Correcao do Painel Operacional da Prefeitura

## Contexto

Ao acessar o Painel Operacional com uma conta `ADMIN_PREFEITURA`, o frontend podia abrir uma secretaria especifica, como a Secretaria de educacao, em vez da visao geral da prefeitura.

O problema vinha da selecao da organizacao ativa no navegador: a tela reutilizava o ID salvo em `localStorage`, entao uma secretaria acessada anteriormente podia continuar sendo usada como contexto operacional.

## O que foi alterado

- O painel operacional deixou de iniciar a organizacao ativa a partir do `localStorage` para usuarios institucionais.
- A tela agora consulta os vinculos ativos do usuario em `/api/vinculos/me`.
- A selecao automatica de vinculo passou a priorizar:
  1. `ADMIN_PREFEITURA`;
  2. `ADMIN_SECRETARIA`;
  3. `ATENDENTE_SECRETARIA`;
  4. primeiro vinculo ativo disponivel.
- O `localStorage` continua sendo usado apenas depois que a organizacao correta e definida.
- Para `ADMIN_APP`, o comportamento manual foi preservado, pois esse perfil pode navegar entre organizacoes.
- Quando a organizacao ativa e do tipo `PREFEITURA`, os relatos passam a ser exibidos agrupados por secretaria responsavel.

## Impacto esperado

- O admin da prefeitura deve ver a pagina da prefeitura ao clicar em `Painel Operacional`.
- A tela da prefeitura deve listar as denuncias da cidade separadas por secretaria responsavel.
- Uma secretaria antiga salva no navegador nao deve mais sobrescrever o contexto da prefeitura.
- O fluxo de secretaria continua exibindo apenas os relatos da propria organizacao.

## Arquivos alterados

- `frontend/src/paginas/institucional/Operacional.jsx`

## Validacao

- `npm.cmd run build` executado com sucesso no frontend.

## Pendencias conscientes

- Nao houve alteracao no backend.
- Nao foi feita revisao visual ampla da pagina; a mudanca ficou restrita ao bug de selecao da organizacao ativa e agrupamento da prefeitura.
