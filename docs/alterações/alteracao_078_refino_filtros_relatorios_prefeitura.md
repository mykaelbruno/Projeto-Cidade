# Alteracao 078 - Refino dos filtros na pagina de relatos da prefeitura

## O que mudou

Refinei a barra de filtros da pagina de relatos da prefeitura para ficar mais coerente com a visualizacao por secretarias.

## Ajustes aplicados

- Removi o campo de `cidade`, porque ele nao era necessario nesse contexto.
- Mantive os botoes `Aplicar filtros` e `Limpar` na mesma linha.
- Quando existe filtro ativo, a tela passa a exibir apenas os dropdowns das secretarias que realmente possuem resultados.
- O estado vazio continua aparecendo normalmente quando nenhum relato atende aos filtros.

## Resultado esperado

- A filtragem fica mais clara visualmente.
- O usuario nao precisa percorrer varias secretarias vazias depois de filtrar.
- O comportamento da tela combina melhor com o modelo de dropdown por secretaria.

## Arquivo envolvido

- `front/src/app/components/operacional/OperationalReports.tsx`

## Validacao

- `npm.cmd run build`
