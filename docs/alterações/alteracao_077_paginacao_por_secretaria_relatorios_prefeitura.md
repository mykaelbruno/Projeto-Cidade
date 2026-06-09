# Alteracao 077 - Paginacao por secretaria nos relatos da prefeitura

## O que mudou

A pagina de relatos da prefeitura deixou de usar uma paginacao geral unica no rodape.

Agora o comportamento ficou mais coerente com a divisao por secretarias:

- cada secretaria continua aparecendo como um dropdown;
- a paginacao acontece dentro do proprio dropdown da secretaria;
- o rodape da pagina passou a ter apenas o controle global de `Quantidade de relatos por secretaria`.

## Ajuste de backend para suportar a interface

Foi adicionado suporte a filtro opcional por `organizacaoResponsavelId` no endpoint operacional da prefeitura.

Com isso, o frontend consegue carregar separadamente:

- os relatos de cada secretaria;
- a quantidade total de relatos daquele grupo;
- a pagina atual de cada dropdown sem depender de uma paginacao global unica.

## Ajustes visuais

- Os campos de filtro receberam borda e contraste mais claros.
- Os `SelectTrigger` e `Input` da tela ficaram com outline mais visivel.

## Arquivos envolvidos

- `front/src/app/components/operacional/OperationalReports.tsx`
- `front/src/app/services/operacionalService.ts`
- `front/src/app/types/operacional.ts`
- `src/main/java/com/mykael/prefeitura/core/operacional/OperacionalDenunciaController.java`
- `src/main/java/com/mykael/prefeitura/core/operacional/OperacionalDenunciaControllerOpenApi.java`
- `src/main/java/com/mykael/prefeitura/core/operacional/OperacionalDenunciaService.java`
- `src/test/java/com/mykael/prefeitura/core/fluxo/FluxosPrincipaisIntegrationTest.java`

## Validacao

- `./mvnw.cmd -Dtest=FluxosPrincipaisIntegrationTest#deveFiltrarRelatosOperacionaisDaPrefeituraPorSecretariaResponsavel test`
- `npm.cmd run build`
