# Alteracao 056 - Bairros Controlados na Criacao de Denuncia

Data: 2026-06-04

## Objetivo

Integrar a criacao de nova denuncia com a lista de bairros ativos cadastrados por prefeitura, evitando que o morador informe um bairro solto quando houver dados controlados disponiveis.

## Frontend

O componente `front/src/app/components/NewReportFlow.tsx` foi ajustado para:

- carregar prefeituras ativas com `GET /api/organizacoes/prefeituras`;
- selecionar automaticamente a prefeitura/cidade do usuario quando possivel;
- carregar bairros ativos com `GET /api/prefeituras/{prefeituraId}/bairros/ativos`;
- substituir o campo livre de bairro por um seletor de bairros ativos quando houver prefeitura carregada;
- manter fallback manual de cidade/bairro se a API nao retornar prefeituras;
- enviar para o backend o nome do bairro selecionado, preservando o contrato atual de `DenunciaCreateRequestDTO`.

## Decisao

O contrato de criacao de denuncia ainda nao foi alterado para receber `prefeituraId` ou `bairroId`.

Por enquanto, o front guia o usuario usando dados controlados, mas o backend continua recebendo:

```json
{
  "cidade": "Mamanguape",
  "bairro": "Centro"
}
```

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- Para validacao forte no backend, ainda sera necessario decidir se `DenunciaCreateRequestDTO` deve receber `prefeituraId` e/ou `bairroId`.
- O backend ainda nao infere coordenadas pelo bairro; se isso virar requisito, sera preciso cadastrar centroide ou geometria de bairros.
