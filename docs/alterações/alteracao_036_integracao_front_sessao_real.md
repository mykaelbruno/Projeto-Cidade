# Alteracao 036 - Integracao Inicial do Front com Sessao Real

Data: 2026-06-02

## Objetivo

Iniciar a conexao do front em `front/` com o backend real, removendo o bypass manual de perfil no login e preparando a aplicacao para usar cookies HttpOnly, sessao real e permissoes derivadas do backend.

## O que foi alterado

- Criado `front/src/app/services/apiClient.ts` com:
  - `VITE_API_URL`;
  - `credentials: "include"`;
  - suporte a JSON e `FormData`;
  - tratamento padronizado de `ErroApiResponse`.
- Criado `front/src/app/services/authService.ts` para:
  - `POST /api/auth/login`;
  - `POST /api/auth/logout`;
  - `POST /api/auth/refresh`;
  - `GET /api/auth/me`.
- Criados tipos principais de autenticacao em `front/src/app/types/auth.ts`.
- Criado `front/.env.example` com `VITE_API_URL=http://localhost:8080`.
- Refatorado `UserContext` para guardar:
  - usuario logado;
  - papeis;
  - vinculos operacionais;
  - acessos disponiveis;
  - perfil ativo derivado da sessao.
- Atualizado `RouteGuard` para validar permissao real por perfil global ou vinculo institucional.
- Atualizado `LoginPage` para chamar o backend real, sem seletor fake de perfil.
- Atualizados os logouts dos layouts institucionais para chamar o backend.
- Ajustado `ProfileSwitcher` para alternar apenas entre acessos reais disponiveis na sessao.
- Corrigida a rota de administracao da prefeitura para `/prefeitura/administracao`, mantendo a rota antiga como redirecionamento.
- Ocultadas as entradas de menu de analytics detalhado da prefeitura e operacional global do admin app neste primeiro alinhamento, pois nao sao prioridade confirmada agora.

## Decisoes importantes

- Prefeitura e secretaria nao sao tratadas como perfil global no front. Elas sao derivadas de `vinculosOperacionais`, conforme o backend.
- O front nao armazena token em `localStorage`. A autenticacao usa os cookies HttpOnly emitidos pelo backend.
- O switch de perfil deixou de ser bypass manual e virou alternador de acessos reais da sessao.

## Validacao

- Executado `npm.cmd run build` dentro de `front/`.
- O build finalizou com sucesso.
- O Vite alertou apenas sobre chunk JavaScript maior que 500 KB, algo esperado para o prototipo atual e sem quebrar a build.

## Pendencias conscientes

- Ainda nao foram integradas as telas de feed, denuncias, comentarios, anexos, notificacoes, prefeitura, secretaria, moderador e admin app com dados reais.
- A Etapa 0 de backend segue pendente porque ainda depende das decisoes finais sobre bairros, motivos de report e transferencia de usuario entre secretarias.
- A tela de login foi conectada ao backend, mas o cadastro, esqueci senha e confirmacao de e-mail ainda seguem para as proximas fases de integracao.
