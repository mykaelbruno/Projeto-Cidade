# Alteracao 074 - Correcao do redirecionamento de login da prefeitura

## Problema corrigido

Usuarios com acesso institucional de prefeitura estavam podendo cair no feed comum apos o login, especialmente quando:

- havia um `redirect` antigo apontando para rota de morador, como `/feed`;
- a sessao anterior tinha mantido o tipo ativo como `morador`.

## Ajustes aplicados

- O login agora redefine o tipo ativo para o perfil prioritario da sessao carregada.
- O redirecionamento apos login passou a validar se a rota de destino e compativel com o tipo principal escolhido.
- Se a rota salva for de outro contexto, o sistema usa a home correta do perfil autenticado.

## Resultado esperado

- `prefeitura` vai para `/prefeitura/dashboard`
- `secretaria` vai para `/secretaria/dashboard`
- `admin_app` vai para `/admin-app/visao-geral`
- `moderador` vai para `/moderador/painel`
- `morador` continua indo para `/feed`

## Arquivos envolvidos

- `front/src/app/contexts/UserContext.tsx`
- `front/src/app/pages/LoginPage.tsx`
- `front/src/app/utils/authNavigation.ts`

## Validacao

- `npm.cmd run build`
