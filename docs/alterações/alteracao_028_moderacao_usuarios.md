# Alteracao 028 - Moderacao mais completa de usuarios

## Objetivo

Ampliar a moderacao para lidar com usuarios abusivos, nao apenas com denuncias e comentarios.

Esta alteracao adiciona um historico de moderacao por usuario e permite aplicar advertencia, suspensao e reativacao de conta.

## O que foi implementado

### Novos endpoints

- `POST /api/moderacoes/usuarios/{usuarioId}/advertencia`
- `POST /api/moderacoes/usuarios/{usuarioId}/suspensao`
- `POST /api/moderacoes/usuarios/{usuarioId}/reativacao`
- `GET /api/moderacoes/usuarios/{usuarioId}/historico`

Todos exigem `ADMIN_APP` ou `MODERADOR`.

### Regras de negocio

- `ADVERTENCIA` registra historico, mas nao bloqueia a conta.
- `SUSPENSAO` marca o usuario como inativo (`ativo=false`).
- `REATIVACAO` marca o usuario como ativo (`ativo=true`).
- Um usuario nao pode moderar a propria conta.
- `MODERADOR` so pode moderar contas `MORADOR`.
- Contas administrativas e outros moderadores so podem ser moderados por `ADMIN_APP`.
- O ultimo `ADMIN_APP` ativo nao pode ser suspenso.
- Suspender usuario ja suspenso retorna conflito.
- Reativar usuario ja ativo retorna conflito.

### Bloqueio de acesso de usuario suspenso

Foi criado `UsuarioAtivoFilter`, executado depois da autenticacao JWT.

Com isso, se uma conta for suspensa, requests autenticados feitos com access token ainda valido passam a receber:

```json
{
  "erro": "USUARIO_INATIVO",
  "mensagem": "Usuario inativo ou suspenso."
}
```

O endpoint de logout continua liberado para permitir limpar sessao/cookies.

## Banco de dados

Foi adicionada a migration:

- `V4__moderacao_usuarios.sql`

Ela amplia a tabela `moderacoes` com:

- `usuario_alvo_id`;
- `acao_usuario`.

Tambem atualiza os checks para permitir:

- alvo `USUARIO`;
- acoes `ADVERTENCIA`, `SUSPENSAO` e `REATIVACAO`;
- novas acoes de auditoria relacionadas a moderacao de usuario.

## Arquivos alterados

- `src/main/java/com/mykael/prefeitura/core/moderacao/AcaoModeracaoUsuario.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/TipoAlvoModeracao.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/Moderacao.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/ModeracaoRepository.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/ModeracaoService.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/ModeracaoController.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/ModeracaoControllerOpenApi.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/dto/ModeracaoResponseDTO.java`
- `src/main/java/com/mykael/prefeitura/infra/security/UsuarioAtivoFilter.java`
- `src/main/java/com/mykael/prefeitura/infra/security/SecurityConfig.java`
- `src/main/java/com/mykael/prefeitura/infra/auditoria/TipoAcaoAuditoria.java`
- `src/main/resources/db/migration/V4__moderacao_usuarios.sql`
- `src/test/java/com/mykael/prefeitura/core/fluxo/FluxosPrincipaisIntegrationTest.java`
- `docs/permissoes_endpoints_backend.md`

## Decisoes conscientes

- Suspensao usa o campo `ativo`, porque o sistema ja usa esse campo para impedir login e refresh token.
- Nao foi criada duracao automatica de suspensao. Reativacao e manual por moderacao.
- Nao foi criada reputacao/pontuacao automatica do usuario. O historico fica pronto para isso depois.
- Nao foi criada notificacao ao usuario suspenso/advertido nesta etapa.

## Validacao

- Foram adicionados testes de integracao para:
  - advertir usuario;
  - suspender usuario;
  - bloquear access token ainda valido de usuario suspenso;
  - reativar usuario;
  - listar historico de moderacao do usuario;
  - impedir `MODERADOR` de suspender conta administrativa.
- `mvn test`
- Resultado observado: 38 testes executados, 0 falhas, 0 erros, 1 ignorado.
- O teste ignorado continua sendo o fluxo com Testcontainers quando Docker nao esta disponivel.

## Proximos refinamentos possiveis

- Notificar usuario quando receber advertencia, suspensao ou reativacao.
- Permitir suspensao temporaria com data de expiracao.
- Criar painel com usuarios mais sinalizados/moderados.
- Adicionar filtros no historico por acao, periodo e moderador.
