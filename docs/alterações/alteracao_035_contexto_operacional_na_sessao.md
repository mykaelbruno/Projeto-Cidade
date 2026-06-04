# Alteracao 035 - Contexto operacional na sessao autenticada

## Contexto

O Painel Operacional dependia de uma chamada separada para `/api/vinculos/me` para descobrir a prefeitura ou secretaria ativa do usuario logado.

Na pratica, isso deixou o frontend fragil: o header ja reconhecia o usuario como institucional, mas o painel podia falhar ao buscar os vinculos e exibir erro antes de abrir a tela correta.

## O que foi alterado

- O endpoint `GET /api/auth/me` agora tambem retorna os vinculos operacionais ativos do usuario.
- O DTO `UsuarioLogadoResponseDTO` passou a incluir `vinculosOperacionais`.
- O `AuthContext` armazena esses vinculos dentro do objeto `usuario`.
- O Painel Operacional usa primeiro os vinculos vindos da sessao autenticada.
- A chamada `/api/vinculos/me` ficou como fallback, nao como dependencia principal.
- Para `ADMIN_PREFEITURA`, o fallback tambem tenta `/api/vinculos` e filtra pelo usuario atual, preservando compatibilidade com fluxos existentes.

## Impacto esperado

- O painel abre direto para `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA` quando existe vinculo ativo.
- O frontend fica mais coerente: se a sessao ja sabe que o usuario tem papel institucional, tambem carrega seus vinculos no mesmo contexto.
- A tela deixa de depender de uma segunda chamada obrigatoria para montar o contexto operacional.

## Arquivos alterados

- `src/main/java/com/mykael/prefeitura/infra/auth/dto/UsuarioLogadoResponseDTO.java`
- `src/main/java/com/mykael/prefeitura/infra/auth/AuthService.java`
- `src/main/java/com/mykael/prefeitura/infra/auth/AuthController.java`
- `frontend/src/contextos/AuthContext.jsx`
- `frontend/src/paginas/institucional/Operacional.jsx`

## Validacao

- `npm.cmd run build` executado com sucesso no frontend.
- `mvn.cmd test` executado com sucesso no backend.

## Observacoes

- Para usar o novo payload de `/api/auth/me`, o backend precisa estar reiniciado/recompilado.
- Depois de reiniciar o backend, e recomendado sair e entrar novamente no frontend para renovar o estado de sessao no `AuthContext`.
