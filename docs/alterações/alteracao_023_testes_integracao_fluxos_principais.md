# Alteracao 023 - Testes de integracao dos fluxos principais

## Objetivo

Ampliar a cobertura de testes de integracao para os principais caminhos que o frontend vai consumir.

Esta etapa nao altera regra de negocio. Ela adiciona testes para garantir que fluxos ja implementados continuem funcionando de ponta a ponta.

## Arquivo criado

- `src/test/java/com/mykael/prefeitura/core/fluxo/FluxosPrincipaisIntegrationTest.java`

## Fluxos cobertos

### Cadastro e login

O teste valida:

- cadastro de morador;
- resposta com usuario criado;
- login usando username;
- login usando e-mail.

### Denuncia, comentario e resposta oficial

O teste valida:

- criacao de denuncia por morador;
- comentario comum por morador;
- resposta oficial por usuario com vinculo institucional;
- listagem dos comentarios da denuncia.

### Transferencia operacional

O teste valida:

- secretaria solicitando transferencia de denuncia;
- prefeitura aprovando transferencia;
- denuncia passando para a secretaria de destino;
- solicitacao ficando com status `APROVADA`.

### Sinalizacao e moderacao

O teste valida:

- usuario autenticado sinalizando uma denuncia;
- moderador marcando sinalizacao como analisada;
- moderador removendo comentario;
- comentario ficando marcado como removido.

## Resultado dos testes

Comando executado:

```powershell
& 'C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.1\plugins\maven\lib\maven3\bin\mvn.cmd' -q test
```

Resultado:

- testes executados: 26;
- falhas: 0;
- erros: 0;
- ignorados: 1.

O teste ignorado e o `AuthIntegrationTest` com Testcontainers quando o Docker nao esta disponivel no ambiente Java do teste. Esse comportamento ja era esperado.

## Observacoes

O primeiro ciclo de teste revelou apenas uma incompatibilidade no proprio teste novo: o contexto atual nao expunha `ObjectMapper` como bean. Foi ajustado para usar uma instancia local no teste, sem impacto no codigo de producao.
