# Alteracao 029 - Metricas administrativas mais ricas

## Objetivo

Enriquecer os paineis administrativos para que o frontend consiga montar telas mais Ãºteis para prefeitura, secretarias e moderacao sem precisar calcular tudo no cliente.

Esta alteracao nao cria novas regras de negocio. Ela apenas agrega dados ja existentes.

## Painel operacional

Endpoint mantido:

- `GET /api/paineis/operacional/organizacoes/{organizacaoId}/resumo`

Permissoes continuam iguais:

- `ADMIN_PREFEITURA`;
- `ADMIN_SECRETARIA`;
- `ATENDENTE_SECRETARIA`.

Regras de escopo continuam iguais:

- prefeitura ve denuncias atribuidas diretamente a ela e as suas secretarias filhas;
- secretaria ve apenas denuncias atribuidas a ela.

### Novos campos retornados

AlÃ©m dos contadores ja existentes, o resumo operacional agora retorna:

- `indicadores.taxaConclusaoConfirmada`
  - percentual de denuncias com `conclusaoConfirmadaEm` preenchido sobre o total do escopo.
- `indicadores.taxaReabertura`
  - percentual de denuncias em `REABERTO` sobre o total do escopo.
- `indicadores.tempoMedioConfirmacaoHoras`
  - media de horas entre criacao da denuncia e confirmacao final do morador.
  - retorna `null` quando ainda nao ha denuncias confirmadas pelo morador.
- `bairrosMaisDemandados`
  - ranking dos 5 bairros com mais denuncias no escopo.
- `categoriasMaisDemandadas`
  - ranking das 5 categorias com mais denuncias no escopo.

## Painel de moderacao

Endpoint mantido:

- `GET /api/paineis/moderacao/resumo`

Permissoes continuam iguais:

- `ADMIN_APP`;
- `MODERADOR`.

### Novos campos retornados

O resumo de moderacao agora tambem retorna:

- `usuariosAdvertidosModeracao`;
- `usuariosSuspensosModeracao`;
- `usuariosReativadosModeracao`.

Esses campos contam acoes de moderacao de usuario registradas no historico de `moderacoes`.

## Arquivos alterados

- `src/main/java/com/mykael/prefeitura/core/painel/PainelOperacionalRepository.java`
- `src/main/java/com/mykael/prefeitura/core/painel/PainelService.java`
- `src/main/java/com/mykael/prefeitura/core/painel/PainelControllerOpenApi.java`
- `src/main/java/com/mykael/prefeitura/core/painel/dto/PainelOperacionalResumoDTO.java`
- `src/main/java/com/mykael/prefeitura/core/painel/dto/PainelModeracaoResumoDTO.java`
- `src/main/java/com/mykael/prefeitura/core/painel/dto/IndicadoresOperacionaisDTO.java`
- `src/main/java/com/mykael/prefeitura/core/painel/dto/DistribuicaoDenunciaDTO.java`
- `src/main/java/com/mykael/prefeitura/core/moderacao/ModeracaoRepository.java`
- `src/test/java/com/mykael/prefeitura/core/fluxo/FluxosPrincipaisIntegrationTest.java`
- `docs/permissoes_endpoints_backend.md`

## Decisoes conscientes

- Nao foi criada migration, porque as metricas usam dados ja existentes.
- As taxas sao retornadas como percentual de 0 a 100, com duas casas decimais.
- O tempo medio de confirmacao considera a confirmacao do morador, nao apenas o status `CONCLUIDO` definido pela prefeitura/secretaria.
- Denuncias concluidas continuam aparecendo nas metricas. A regra fina de exibicao de concluidas no produto sera estudada depois.
- Rankings ficam limitados aos 5 primeiros itens para manter resposta leve para o frontend.

## Validacao

- Foi adicionado teste de integracao para conferir:
  - taxa de conclusao confirmada;
  - taxa de reabertura;
  - ranking de bairros;
  - ranking de categorias;
  - escopo de prefeitura incluindo secretaria filha.
- `mvn test`
- Resultado observado: 39 testes executados, 0 falhas, 0 erros, 1 ignorado.
- O teste ignorado continua sendo o fluxo com Testcontainers quando Docker nao esta disponivel.

## Proximos refinamentos possiveis

- Filtros por periodo nos paineis.
- Tempo medio ate o status `CONCLUIDO`, baseado em eventos da timeline.
- Comparativos por secretaria dentro da prefeitura.
- Metricas de reincidencia por bairro/categoria.
- Cache curto para paineis, caso o volume de dados cresca.
