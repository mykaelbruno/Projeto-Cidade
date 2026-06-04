# Alteracao 059 - Filtro Real de Categorias no Feed

Data: 2026-06-04

## Objetivo

Remover categorias fixas do prototipo no modal de filtros do feed e usar categorias reais do backend.

## Frontend

Arquivos alterados:

- `front/src/app/pages/HomePage.tsx`
- `front/src/app/components/FilterModal.tsx`

O feed agora:

- carrega categorias ativas por `GET /api/categorias`;
- exibe essas categorias no modal de filtros;
- envia `categoriaId` para `GET /api/feed/denuncias`;
- mantem a busca textual enviando `termo` para o backend;
- reseta para a primeira pagina quando a categoria ou a busca muda.

## Backend Utilizado

Endpoints:

- `GET /api/categorias`
- `GET /api/feed/denuncias`

Parametros relevantes do feed:

- `categoriaId`
- `termo`
- `cidade`
- `status`
- `modo`
- `page`
- `size`

## Decisoes

- O filtro por categoria deixou de comparar nomes no front e passou a usar o ID real da categoria.
- Foram removidas categorias mockadas com texto quebrado por encoding no modal de filtros.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Nenhuma pendencia funcional nova foi criada nesta etapa.
