# Alteracao 048 - Integracao Admin App: Vinculos Institucionais

## Objetivo

Integrar a pagina de vinculos institucionais do Admin App com os endpoints reais do backend, removendo dados simulados e evitando fluxos que o backend ainda nao suporta.

## O que foi alterado

- Criado `vinculoService` no front para centralizar as chamadas de vinculos institucionais.
- Criados tipos de contrato para atualizacao e transferencia de vinculos.
- A pagina `VinculosPage` passou a carregar vinculos reais por `GET /api/vinculos`.
- A edicao de papel e status passou a usar `PUT /api/vinculos/{vinculoId}`.
- A transferencia de usuario entre secretarias passou a usar `PATCH /api/vinculos/{vinculoId}/secretaria`.
- A criacao pela tela passou a usar `POST /api/organizacoes/{organizacaoId}/usuarios-institucionais`, criando um novo usuario institucional ja vinculado a organizacao.
- Foram adicionados filtros locais por busca, papel, status e tipo de organizacao.
- A tela passou a exibir estatisticas derivadas da lista real carregada.

## Regras respeitadas

- Prefeitura permite apenas vinculo com papel `ADMIN_PREFEITURA`.
- Secretaria permite `ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA`.
- Transferencia so e exibida para vinculos ligados a secretarias.
- O destino da transferencia e limitado a secretarias ativas da mesma prefeitura.
- Nenhum fluxo fake foi mantido para criar vinculo em usuario ja existente, pois o backend atual nao possui endpoint para isso.

## Arquivos principais

- `front/src/app/pages/adminapp/VinculosPage.tsx`
- `front/src/app/services/vinculoService.ts`
- `front/src/app/services/organizacaoService.ts`
- `front/src/app/types/vinculo.ts`
- `front/src/app/types/organizacao.ts`

## Validacao

- `npm.cmd run build` executado com sucesso no front.
- O Vite exibiu apenas o aviso conhecido de chunk acima de 500 kB, sem erro de TypeScript ou build.

## Pendencias conscientes

- O backend nao possui endpoint para adicionar um novo vinculo a um usuario existente.
- Se o produto precisar desse fluxo, o backend deve receber um endpoint especifico antes de a UI oferecer essa acao.
- A busca e os filtros da tela sao locais porque o endpoint global de vinculos ainda nao possui filtros server-side.

