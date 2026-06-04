# Alteracao 016 - Testes de integracao com PostgreSQL

## Objetivo

Adicionar uma primeira bateria de testes de integracao usando PostgreSQL real em container, para validar pontos que o H2 nao cobre bem.

## O que foi adicionado

Dependencias de teste:

- `org.testcontainers:junit-jupiter`
- `org.testcontainers:postgresql`

Novo teste:

- `src/test/java/com/mykael/prefeitura/infra/auth/AuthIntegrationTest.java`

## Fluxo validado

O teste sobe um PostgreSQL isolado via Testcontainers e valida:

- aplicacao iniciando com PostgreSQL real;
- Flyway aplicando a migration `V1`;
- Hibernate validando o schema depois da migration;
- cadastro de morador;
- emissao dos cookies `access_token` e `refresh_token`;
- login usando username;
- login usando e-mail;
- acesso autenticado ao endpoint `/api/auth/me`.

Se o Testcontainers nao conseguir acessar o Docker no ambiente local, esse teste e pulado automaticamente para nao quebrar a bateria padrao. Isso evita bloquear os testes unitarios e de contexto por configuracao local do Docker Desktop.

## Por que isso importa

O H2 continua util para testes simples e rapidos, mas nao substitui PostgreSQL quando a migration usa recursos especificos, como indice parcial.

Com esse teste, o projeto passa a ter uma protecao inicial contra:

- migration quebrada no PostgreSQL;
- divergencia entre entidades JPA e schema real;
- regressao no fluxo basico de autenticacao do morador.

## Proximas coberturas recomendadas

- criacao de prefeitura por `ADMIN_APP`;
- criacao de secretaria e usuarios institucionais;
- permissao de prefeitura versus secretaria;
- criacao de denuncia por morador;
- atualizacao de status por organizacao responsavel;
- sinalizacao e moderacao.
