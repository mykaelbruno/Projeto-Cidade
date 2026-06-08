# Alteracao 065 - Dist do frontend como artefato de build

Data: 2026-06-05

## Objetivo

Reduzir ruido no versionamento do frontend. O diretorio `front/dist/` e gerado pelo Vite e contem arquivos com hash, por isso cada build alterava nomes de assets e criava varias mudancas no Git sem representar codigo-fonte novo.

## O que mudou

- `front/dist/` foi adicionado ao `.gitignore`.
- O diretorio `front/dist/` versionado anteriormente foi removido do workspace.
- O build continua recriando `front/dist/` localmente quando necessario.

## Validacao

- `npm.cmd run build`: sucesso.
- O bundle principal continua em aproximadamente 308 kB apos o code-splitting aplicado anteriormente.

## Observacao

Para deploy, o ideal e gerar `front/dist/` no pipeline ou ambiente de build, nao manter os arquivos compilados versionados junto com o codigo-fonte.
