# Alteracao 034 - Remocao da selecao manual no Painel Operacional institucional

## Contexto

Depois da correcao anterior, usuarios institucionais ainda podiam cair em uma tela de selecao de organizacao quando o vinculo operacional nao era resolvido imediatamente.

Isso gerava uma experiencia ruim para `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA`, porque esses perfis nao devem escolher manualmente uma organizacao para operar. A organizacao correta deve vir do vinculo ativo do usuario.

## O que foi alterado

- A tela de selecao manual foi removida para usuarios institucionais.
- O frontend agora tenta carregar o vinculo ativo em `/api/vinculos/me`.
- Se encontrar vinculo ativo, abre o painel diretamente.
- Se ainda estiver carregando, mostra uma mensagem de carregamento.
- Se a busca falhar, mostra erro claro pedindo para atualizar a pagina ou fazer login novamente.
- Se nao houver vinculo ativo, mostra uma mensagem indicando ausencia de vinculo operacional.
- A selecao manual foi mantida apenas para `ADMIN_APP`, pois esse perfil pode supervisionar diferentes organizacoes.

## Impacto esperado

- Admin prefeitura nao deve mais ver caixa de selecao ao clicar em `Painel Operacional`.
- Admin secretaria e atendente secretaria tambem nao devem ver caixa de selecao.
- A tela deixa de mascarar problemas de permissao/vinculo com uma escolha manual.
- Se uma conta institucional nao abrir o painel, o problema esperado passa a ser dado/permissao: usuario sem vinculo ativo.

## Arquivos alterados

- `frontend/src/paginas/institucional/Operacional.jsx`

## Validacao

- `npm.cmd run build` executado com sucesso no frontend.

## Pendencias conscientes

- Se o usuario institucional existir no banco sem vinculo ativo, o painel nao conseguira abrir por seguranca. Nesse caso, e necessario corrigir o cadastro/vinculo do usuario.
- A selecao do `ADMIN_APP` ainda existe de proposito, porque esse perfil precisa escolher qual organizacao quer supervisionar.
