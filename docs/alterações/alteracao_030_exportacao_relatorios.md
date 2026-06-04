# Alteracao 030 - Exportacao de relatorios operacionais

## Objetivo

Adicionar uma primeira exportacao operacional em CSV para apoiar telas administrativas do frontend e permitir que prefeitura/secretarias baixem uma listagem filtrada de denuncias.

Esta alteracao nao muda regras de negocio existentes de denuncia, status, moderacao ou transferencia. Ela reaproveita o mesmo escopo de acesso da listagem operacional.

## O que foi implementado

- Novo modulo `core/relatorio`.
- Novo endpoint:
  - `GET /api/relatorios/operacional/organizacoes/{organizacaoId}/denuncias.csv`
- Exportacao em CSV UTF-8 com separador `;`.
- Filtros opcionais:
  - `cidade`;
  - `bairro`;
  - `status`;
  - `categoriaId`.
- Cabecalho `Content-Disposition` para o frontend tratar o retorno como download de arquivo.
- Exposicao de `Content-Disposition` no CORS para o frontend conseguir ler o nome do arquivo.
- Documentacao Swagger propria por `RelatorioOperacionalControllerOpenApi`.
- Teste de integracao cobrindo exportacao, filtro e ausencia de dados pessoais do autor.

## Regras de permissao

- Prefeitura:
  - exige usuario com `ADMIN_PREFEITURA` vinculado a prefeitura informada;
  - exporta denuncias da propria prefeitura e de suas secretarias filhas.
- Secretaria:
  - exige vinculo institucional ativo com a secretaria informada;
  - exporta apenas denuncias atribuidas a secretaria.

O endpoint tambem possui `@PreAuthorize` para aceitar apenas:

- `ADMIN_PREFEITURA`;
- `ADMIN_SECRETARIA`;
- `ATENDENTE_SECRETARIA`.

## Campos exportados

O CSV exporta:

- `id`;
- `titulo`;
- `status`;
- `categoria`;
- `cidade`;
- `bairro`;
- `rua`;
- `ponto_referencia`;
- `organizacao_responsavel`;
- `anonima`;
- `confirmacoes`;
- `urgencias`;
- `comentarios`;
- `criado_em`;
- `atualizado_em`.

Dados pessoais do autor nao sao exportados.

## Limites conscientes

- A exportacao possui limite interno de 5000 linhas para evitar respostas grandes demais.
- Ainda nao ha exportacao em XLSX/PDF.
- Ainda nao ha exportacao de paineis agregados.
- Ainda nao ha filtro por periodo. Se o frontend precisar, este deve ser um refinamento futuro.

## Arquivos principais

- `src/main/java/com/mykael/prefeitura/core/relatorio/RelatorioOperacionalController.java`
- `src/main/java/com/mykael/prefeitura/core/relatorio/RelatorioOperacionalControllerOpenApi.java`
- `src/main/java/com/mykael/prefeitura/core/relatorio/RelatorioOperacionalService.java`
- `src/main/java/com/mykael/prefeitura/core/relatorio/RelatorioDenunciaRepository.java`
- `src/main/java/com/mykael/prefeitura/core/relatorio/dto/RelatorioCsvResponseDTO.java`

## Como o frontend deve usar

1. Chamar o endpoint autenticado com cookie `access_token`.
2. Enviar `organizacaoId` da prefeitura ou secretaria selecionada pelo usuario institucional.
3. Adicionar filtros opcionais conforme a tela.
4. Tratar a resposta como arquivo `text/csv`.
5. Ler `Content-Disposition`, quando disponivel, para sugerir o nome do arquivo.

## Testes

Foi adicionado teste de integracao para validar:

- retorno `200`;
- resposta `text/csv`;
- cabecalho de download;
- filtro por bairro;
- ausencia de nome/e-mail do autor no CSV.
