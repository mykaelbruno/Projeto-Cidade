# Alteracao 057 - Gestao de Bairros pela Prefeitura no Front

Data: 2026-06-04

## Objetivo

Adicionar uma tela real para que a prefeitura gerencie os bairros da cidade, usando os endpoints ja existentes no backend.

## Frontend

Foi criada a pagina:

- `front/src/app/pages/admin/BairrosPage.tsx`

A tela permite:

- listar bairros cadastrados da prefeitura do vinculo ativo;
- criar bairro;
- editar nome do bairro;
- ativar/desativar bairro;
- buscar bairros na lista carregada;
- visualizar totais de bairros cadastrados e ativos.

Tambem foram adicionados:

- rota `/prefeitura/bairros`;
- item `Bairros` no menu lateral da prefeitura;
- metodos de bairro em `organizacaoService`.

## Backend Utilizado

Endpoints:

- `GET /api/prefeituras/{prefeituraId}/bairros`
- `POST /api/prefeituras/{prefeituraId}/bairros`
- `PUT /api/prefeituras/{prefeituraId}/bairros/{bairroId}`
- `PATCH /api/prefeituras/{prefeituraId}/bairros/{bairroId}/ativacao`

Permissao:

- `ADMIN_PREFEITURA` da prefeitura vinculada;
- `ADMIN_APP` tambem e aceito pelo backend, mas esta tela foi encaixada no painel da prefeitura.

## Decisoes

- A tela usa o vinculo ativo `ADMIN_PREFEITURA` da sessao para descobrir a prefeitura.
- Bairros inativos continuam listados para gestao, mas deixam de aparecer nas listagens publicas/ativas usadas por cadastro e criacao de denuncia.
- Nao foi implementada geometria/centroide de bairro nesta etapa.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- O backend ainda recebe `cidade` e `bairro` como texto na criacao de denuncia. Para validacao forte, ainda e preciso decidir se o contrato passara a receber `prefeituraId` e/ou `bairroId`.
