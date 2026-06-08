# Alteracao 064 - README geral e code-splitting do frontend

Data: 2026-06-05

## Objetivo

Criar uma apresentacao geral do projeto para GitHub e seguir o proximo passo logico de performance do frontend, reduzindo o tamanho do bundle inicial sem alterar regras de negocio.

## O que mudou

- O `README.md` foi reescrito como apresentacao geral do Cidade Ativa.
- O README explica a ideia do produto, os principais perfis, os fluxos disponiveis e a stack em uma visao rapida.
- As paginas do frontend em `front/src/app/App.tsx` passaram a ser carregadas com `React.lazy`.
- O roteamento foi envolvido por `Suspense` com fallback simples de carregamento.
- Os layouts principais continuam carregados de forma direta, preservando a estrutura de navegacao.

## Resultado do build

Antes do ajuste, o build gerava um chunk principal de aproximadamente 664 kB e o Vite alertava sobre arquivo acima de 500 kB.

Depois do code-splitting:

- chunk principal: aproximadamente 308 kB;
- alerta de chunk acima de 500 kB: removido;
- paginas foram separadas em chunks menores carregados sob demanda.

## Validacao

- `npm.cmd run build`: sucesso.

## Pendencia consciente

O diretorio `front/dist/` esta versionado atualmente. Como o build gera arquivos com hash, cada build troca os nomes dos assets e cria bastante ruido no Git. A decisao pendente e escolher se `front/dist/` deve continuar no versionamento ou passar a ser ignorado e gerado apenas em ambiente de build/deploy.
