# Alteracao 062 - Drawer de Notificacoes com Backend Real

Data: 2026-06-04

## Objetivo

Remover as notificacoes fixas do prototipo no drawer lateral usado pelo fluxo do morador e carregar notificacoes reais do backend.

## Frontend

Arquivo alterado:

- `front/src/app/components/NotificationsDrawer.tsx`

O drawer agora:

- carrega notificacoes com `GET /api/notificacoes/minhas`;
- exibe estado de carregamento, erro e vazio;
- mostra quantidade de notificacoes nao lidas;
- marca uma notificacao como lida com `PATCH /api/notificacoes/{notificacaoId}/leitura`;
- marca todas como lidas com `PATCH /api/notificacoes/leitura`;
- abre o `link` da notificacao quando ele existir.

## Backend Utilizado

Endpoints:

- `GET /api/notificacoes/minhas`
- `PATCH /api/notificacoes/{notificacaoId}/leitura`
- `PATCH /api/notificacoes/leitura`

## Decisoes

- O drawer passou a usar o mesmo contrato real ja usado pela lista/dropdown de notificacoes.
- Foram removidas listas fixas separadas por perfil, que podiam mostrar informacoes falsas.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Nenhuma pendencia funcional nova foi criada nesta etapa.
