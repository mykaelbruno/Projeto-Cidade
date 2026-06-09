# Alteracao 076 - Dropdown por secretaria na pagina de relatos da prefeitura

## O que mudou

Na pagina de relatos da prefeitura, cada bloco de secretaria passou a funcionar como um menu expansivel.

Antes:

- todas as secretarias exibiam seus cards sempre abertos;
- a tela podia ficar longa e cansativa quando havia muitos grupos.

Agora:

- cada cabecalho de secretaria funciona como um dropdown;
- ao clicar no cabecalho, os cards dos relatos daquele grupo sao exibidos;
- ao clicar novamente, o grupo e recolhido;
- a pagina mostra a quantidade de relatos em cada secretaria logo no cabecalho.

## Regra de uso

- Esse comportamento vale para o modo `prefeitura`.
- No modo `secretaria`, a listagem continua direta, sem agrupamento expansivel.

## Resultado esperado

- A prefeitura consegue navegar melhor entre os grupos de secretarias.
- A leitura da pagina fica mais organizada, especialmente quando existem muitos relatos distribuidos por varios orgaos.

## Arquivo principal

- `front/src/app/components/operacional/OperationalReports.tsx`

## Validacao

- `npm.cmd run build`
