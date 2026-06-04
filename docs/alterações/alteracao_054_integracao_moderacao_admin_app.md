# Alteracao 054 - Integracao da Moderacao Geral do Admin App

Data: 2026-06-04

## Objetivo

Remover os mocks da pagina de moderacao do Admin App e conectar a tela aos contratos reais ja existentes no backend.

## Backend Utilizado

Endpoints:

- `GET /api/paineis/moderacao/resumo`
- `GET /api/moderacoes/sinalizacoes-denuncia?status=PENDENTE`
- `POST /api/moderacoes/sinalizacoes-denuncia/{sinalizacaoId}/analise`
- `POST /api/moderacoes/denuncias/{denunciaId}/arquivamento`

Permissoes:

- `ADMIN_APP`
- `MODERADOR`

## Frontend

A pagina `front/src/app/pages/adminapp/ModeracaoPage.tsx` foi reescrita para:

- carregar o resumo real de moderacao;
- listar sinalizacoes pendentes reais;
- filtrar localmente a pagina carregada por denuncia, motivo, comentario ou autor;
- abrir o relato sinalizado;
- marcar uma sinalizacao como analisada;
- arquivar uma denuncia com motivo obrigatorio;
- atualizar contadores locais apos as acoes.

## Decisoes

- A tela foi mantida simples, sem duplicar todo o painel do moderador.
- A moderacao de usuarios no Admin App foi descrita como fluxo dedicado no painel de moderador, para evitar uma segunda implementacao mais complexa e repetida neste momento.
- Nao foram adicionadas metricas novas; a tela usa apenas o resumo que o backend ja fornece.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Se o Admin App precisar moderar usuarios diretamente nesta mesma tela, pode reutilizar `moderacaoService.moderarUsuario` com fluxo por ID, como ja existe na area de moderador.
- A busca textual das sinalizacoes e local sobre a pagina carregada; o backend ainda nao possui filtro `termo` para sinalizacoes.
