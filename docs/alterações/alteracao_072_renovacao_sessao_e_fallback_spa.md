# Alteracao 072 - Renovacao de sessao e fallback SPA em producao

## O que foi corrigido

Esta etapa resolveu dois problemas que apareciam juntos em producao:

1. quando o access token expirava, o frontend nao tentava renovar a sessao automaticamente em chamadas autenticadas comuns;
2. ao acessar uma rota interna protegida sem sessao valida, o usuario podia cair em um `404` bruto do host estatico em vez de voltar para o login com contexto.

## Ajustes aplicados

### Renovacao automatica de sessao

- `apiClient.ts` agora:
  - tenta renovar a sessao com `/api/auth/refresh` quando uma chamada autenticada recebe `401`;
  - reaproveita uma mesma tentativa de refresh em paralelo para evitar corrida;
  - repete a requisicao original uma unica vez apos refresh bem-sucedido;
  - redireciona para o login com contexto quando a renovacao falha.

### Redirecionamento amigavel para login

- `RouteGuard.tsx` passou a enviar o usuario para o login com:
  - motivo (`required` ou `expired`);
  - rota original em `redirect`.
- `LoginPage.tsx` agora:
  - mostra mensagem contextual quando a sessao expirou ou quando o login e obrigatorio;
  - volta o usuario para a rota original apos login bem-sucedido, quando seguro.

### Fallback SPA para deploy do frontend

- Criado `front/vercel.json` com rewrite de rotas sem extensao para `index.html`.
- Isso evita `404` bruto em refresh ou acesso direto a rotas internas do React Router em deploy estatico na Vercel.

## Validacao recomendada

1. Fazer login em area protegida.
2. Esperar o access token expirar mantendo o refresh token valido.
3. Executar uma nova acao autenticada e confirmar renovacao automatica.
4. Simular sessao completamente expirada e verificar retorno ao login com mensagem contextual.
5. Acessar diretamente uma rota interna como `/prefeitura/administracao` em ambiente Vercel e confirmar que a SPA sobe normalmente.
