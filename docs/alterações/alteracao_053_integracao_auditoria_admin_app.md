# Alteracao 053 - Integracao da Auditoria do Admin App

Data: 2026-06-04

## Objetivo

Remover os dados mockados da pagina de auditoria do Admin App e conectar a tela ao endpoint real do backend.

## Backend Utilizado

Endpoint:

- `GET /api/auditorias`

Permissao:

- `ADMIN_APP`

Filtros suportados pelo backend:

- `acao`
- `alvoTipo`
- `alvoId`
- `atorId`
- `page`
- `size`

## Frontend

Foram adicionados:

- `front/src/app/types/auditoria.ts`
- `front/src/app/services/auditoriaService.ts`

A pagina `front/src/app/pages/adminapp/AuditoriaPage.tsx` foi reescrita para:

- carregar eventos reais de auditoria;
- filtrar por acao, tipo de alvo, ID do alvo e ID do ator;
- paginar usando o `Page<T>` do Spring;
- exibir estados de carregamento, erro e vazio;
- abrir detalhes do evento em modal simples;
- exportar a pagina carregada em CSV local.

## Decisoes

- A busca textual foi mantida apenas como filtro local sobre a pagina carregada, porque o backend atual nao possui parametro `termo` em auditoria.
- Nao foram criadas metricas detalhadas de admin, respeitando a decisao de produto de manter o Admin App focado em gestao e supervisao basica.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Se a auditoria crescer muito, pode valer criar busca textual server-side no backend.
- Exportacao completa de auditoria ainda nao existe no backend; a tela exporta apenas a pagina atual carregada.
