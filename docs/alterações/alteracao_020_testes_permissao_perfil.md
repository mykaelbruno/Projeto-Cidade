# Alteracao 020 - Testes de permissao por perfil

## Objetivo

Implementar testes de permissao por perfil, seguindo o segundo item prioritario do roadmap de fechamento do backend.

A meta foi validar as principais barreiras entre:

- usuario sem login;
- `MORADOR`;
- `ADMIN_APP`;
- `ADMIN_PREFEITURA`;
- `ADMIN_SECRETARIA`;
- `MODERADOR`.

## Testes criados

Arquivo:

```txt
src/test/java/com/mykael/prefeitura/infra/security/PermissaoPorPerfilIntegrationTest.java
```

Os testes usam:

- `SpringBootTest`;
- `MockMvc`;
- H2 em memoria;
- JWT simulado por perfil;
- dados reais salvos pelos repositories.

## Cenarios cobertos

Foram adicionados testes para garantir que:

- rota protegida exige autenticacao;
- `MORADOR` nao cria usuario administrativo;
- `ADMIN_APP` consulta auditoria;
- `ADMIN_PREFEITURA` cria secretaria da propria prefeitura;
- `MORADOR` nao acessa fluxo operacional;
- `MODERADOR` arquiva denuncia;
- `ADMIN_SECRETARIA` altera status de denuncia atribuida a sua secretaria;
- `ADMIN_SECRETARIA` nao aprova transferencia, pois isso e papel da prefeitura.

## Correcao feita durante os testes

Os testes revelaram que negacoes de permissao feitas por `@PreAuthorize` estavam caindo no handler generico e retornando `500`.

Foi ajustado o `GlobalExceptionHandler` para tratar:

```txt
AccessDeniedException
AuthorizationDeniedException
```

Agora essas falhas retornam:

```json
{
  "status": 403,
  "erro": "ACESSO_NEGADO",
  "mensagem": "Usuario sem permissao para esta acao."
}
```

## Resultado

A suite de testes passou apos a correcao.

Observacao: o teste com Testcontainers continua sendo ignorado quando o Java nao consegue detectar o Docker Desktop, comportamento ja conhecido no projeto.

## Roadmap

Item marcado como concluido:

- `Testes de permissao por perfil`

O proximo item prioritario passa a ser:

```txt
Revisao dos filtros e listagens necessarios para o front
```
