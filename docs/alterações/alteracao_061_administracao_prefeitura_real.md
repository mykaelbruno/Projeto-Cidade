# Alteracao 061 - Administracao da Prefeitura com Dados Reais

Data: 2026-06-04

## Objetivo

Substituir a tela antiga de administracao da prefeitura, que usava dados fixos de prototipo, por uma versao real e mais simples alinhada ao backend atual.

## Frontend

Arquivo alterado:

- `front/src/app/pages/admin/AdministracaoPage.tsx`

A tela agora permite:

- identificar a prefeitura pelo vinculo ativo `ADMIN_PREFEITURA`;
- listar secretarias reais da prefeitura;
- criar secretaria com categorias reais ativas;
- editar o nome da secretaria;
- ativar/desativar secretaria;
- criar operador institucional para secretaria;
- listar vinculos institucionais da prefeitura e secretarias;
- ativar/desativar vinculo;
- mover operador entre secretarias da mesma prefeitura.

## Backend Utilizado

Endpoints:

- `GET /api/organizacoes`
- `GET /api/categorias`
- `GET /api/vinculos/organizacoes/{organizacaoId}`
- `POST /api/organizacoes/prefeituras/{prefeituraId}/secretarias`
- `PUT /api/organizacoes/{organizacaoId}`
- `PATCH /api/organizacoes/{organizacaoId}/ativacao`
- `POST /api/organizacoes/{organizacaoId}/usuarios-institucionais`
- `PUT /api/vinculos/{vinculoId}`
- `PATCH /api/vinculos/{vinculoId}/secretaria`

## Decisoes

- A prefeitura cria apenas operadores de secretaria (`ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA`) nesta tela, conforme regra definida pelo projeto.
- A acao antiga de excluir usuario permanentemente foi removida, porque o backend atual trabalha com ativacao/desativacao e moderacao, nao exclusao destrutiva.
- A tela ficou propositalmente mais enxuta para evitar acoes falsas enquanto o front esta sendo conectado ao backend real.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Se a prefeitura precisar editar categorias atendidas de uma secretaria depois da criacao, a tela pode receber um modal especifico usando `PATCH /api/organizacoes/{organizacaoId}/categorias`.
