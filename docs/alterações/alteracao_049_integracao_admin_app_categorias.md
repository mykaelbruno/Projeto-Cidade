# Alteracao 049 - Integracao Admin App: Categorias Globais

## Objetivo

Integrar a pagina de categorias globais do Admin App com os endpoints reais do backend, removendo dados simulados e permitindo manutencao das categorias usadas nas denuncias.

## O que foi alterado

- `CategoriasPage` deixou de usar `mockCategorias`.
- `categoriaService` passou a ter operacoes de criacao, atualizacao e ativacao/desativacao.
- `types/categoria.ts` passou a declarar os contratos de criacao e atualizacao.
- A tela agora carrega categorias por `GET /api/categorias`.
- A tela carrega organizacoes por `GET /api/organizacoes` para mostrar o nome da secretaria responsavel padrao.
- Criacao de categoria usa `POST /api/categorias`.
- Edicao de categoria usa `PUT /api/categorias/{categoriaId}`.
- Ativacao/desativacao usa `PATCH /api/categorias/{categoriaId}/ativacao`.
- Foram adicionados estados de carregamento, erro, vazio e feedback de sucesso.
- Foram adicionados filtros locais por busca, status e existencia de secretaria responsavel padrao.

## Regras respeitadas

- Apenas contratos ja existentes foram usados.
- A categoria pode ter secretaria padrao ou distribuicao manual.
- O front nao inventa nome de secretaria: quando o DTO traz apenas o ID, a tela cruza com a lista real de organizacoes.
- O fluxo nao altera regras de negocio do backend.

## Arquivos principais

- `front/src/app/pages/adminapp/CategoriasPage.tsx`
- `front/src/app/services/categoriaService.ts`
- `front/src/app/types/categoria.ts`
- `docs/finalizacao/integracao_front_backend.md`

## Validacao

- `npm.cmd run build` executado com sucesso no front.
- O Vite exibiu apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias conscientes

- O endpoint de categorias ainda nao possui filtros server-side; busca e filtros sao locais.
- O DTO de categoria retorna apenas `organizacaoResponsavelPadraoId`, nao o nome da secretaria. A tela resolve isso cruzando com `GET /api/organizacoes`.

