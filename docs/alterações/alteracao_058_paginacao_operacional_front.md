# Alteracao 058 - Paginacao Real no Painel Operacional

Data: 2026-06-04

## Objetivo

Trocar a listagem operacional em lote fixo por uma navegacao paginada usando a propria resposta `Page` do backend.

## Frontend

Arquivo alterado:

- `front/src/app/components/operacional/OperationalReports.tsx`

A tela agora:

- guarda o `PageResponse<DenunciaResponseDTO>` retornado por `GET /api/operacional/organizacoes/{organizacaoId}/denuncias`;
- envia `page` e `size` reais para o backend;
- permite navegar entre paginas com botoes `Anterior` e `Proxima`;
- permite escolher o tamanho da pagina entre 10, 20 e 50 relatos;
- mostra total de relatos retornado pelo backend;
- reseta para a primeira pagina quando filtros operacionais mudam.

## Backend Utilizado

Endpoint:

- `GET /api/operacional/organizacoes/{organizacaoId}/denuncias`

Parametros usados:

- `cidade`
- `bairro`
- `status`
- `categoriaId`
- `page`
- `size`

## Decisoes

- A busca textual no campo local continua filtrando apenas a pagina carregada, porque o contrato operacional atual nao possui parametro `termo`.
- A exportacao CSV continua exportando pelo endpoint especifico de relatorio, sem depender da pagina atual exibida.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Se a busca textual operacional precisar varrer toda a base, sera necessario criar filtro `termo` no endpoint operacional do backend.
