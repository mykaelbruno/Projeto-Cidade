# Alteracao 032 - Organizacao dos documentos de alteracoes

## Objetivo

Organizar os documentos historicos de alteracoes dentro de uma pasta propria em `/docs`.

## O que foi alterado

- Criada a pasta `docs/alterações`.
- Movidos todos os arquivos `alteracao_*.md` que estavam diretamente em `docs`.
- Atualizadas referencias internas que apontavam para os arquivos antigos na raiz de `docs`.

## Resultado

Os documentos de alteracao agora ficam agrupados em:

```txt
docs/alterações/
```

Isso deixa a raiz de `docs` mais limpa para documentos gerais, como roadmap, permissoes, guias de execucao e documentacao tecnica.

## Observacao

Nao houve alteracao de codigo, regra de negocio, API, banco ou Swagger.
