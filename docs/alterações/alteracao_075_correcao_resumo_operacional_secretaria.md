# Alteracao 075 - Correcao do resumo operacional da secretaria

## Problema corrigido

O endpoint `GET /api/paineis/operacional/organizacoes/{organizacaoId}/resumo` estava retornando `500` quando acessado por uma secretaria no painel operacional.

Na pratica, o dashboard da secretaria abria a tela de erro em vez de carregar:

- contadores de denuncias;
- distribuicao por bairros;
- distribuicao por categorias;
- indicadores operacionais.

## Ajustes aplicados

- Padronizei os filtros JPQL do painel da secretaria para seguir a mesma estrategia usada no fluxo da prefeitura, com `join` explicito da organizacao responsavel.
- Tornei o tratamento de datas mais robusto no repositorio do painel, aceitando os tipos temporais retornados pelo Hibernate nas agregacoes.
- Normalizei nomes nulos ou vazios nas distribuicoes do painel para evitar quebra ou exibicao inconsistente.
- Tornei explicitas as consultas de contagem de solicitacoes de transferencia, reduzindo ambiguidade nas derivacoes do Spring Data.
- Adicionei teste de integracao cobrindo especificamente o resumo operacional da secretaria.

## Resultado esperado

- Prefeitura continua consultando o painel normalmente.
- Secretaria passa a receber `200 OK` no endpoint de resumo.
- O frontend consegue abrir `/secretaria/dashboard` sem cair na mensagem generica de falha.

## Arquivos envolvidos

- `src/main/java/com/mykael/prefeitura/core/painel/PainelOperacionalRepository.java`
- `src/main/java/com/mykael/prefeitura/core/operacional/SolicitacaoTransferenciaDenunciaRepository.java`
- `src/test/java/com/mykael/prefeitura/core/fluxo/FluxosPrincipaisIntegrationTest.java`

## Validacao

- `./mvnw.cmd -Dtest=FluxosPrincipaisIntegrationTest#deveRetornarResumoOperacionalDaSecretaria test`
- `./mvnw.cmd test "-Dtest=FluxosPrincipaisIntegrationTest"`
