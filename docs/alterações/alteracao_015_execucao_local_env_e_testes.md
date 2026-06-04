# Alteracao 015 - Execucao local, .env e testes iniciais

## Objetivo

Facilitar a primeira execucao local do projeto e iniciar uma bateria de testes automatizados para regras de dominio.

## Configuracao local com .env

Foi criado um arquivo `.env` local com valores de desenvolvimento para:

- porta da API;
- PostgreSQL;
- datasource do Spring;
- JWT;
- cookies;
- admin inicial;
- upload e otimizacao de imagens.

Tambem foi criado `.env.example` como modelo seguro para recriar o arquivo em outra maquina.

O `.env` foi adicionado ao `.gitignore`, porque contem senhas e segredos de ambiente local. Os valores atuais sao apenas para desenvolvimento e devem ser trocados antes de qualquer ambiente compartilhado ou producao.

## Spring Boot

O `application.yml` passou a importar o `.env` quando ele existir:

```yml
spring:
  config:
    import: optional:file:.env[.properties]
```

Isso permite executar a aplicacao sem precisar configurar manualmente cada variavel no terminal.

## Docker Compose

O `docker-compose.yml` passou a ler o `.env` e usar variaveis para:

- nome do banco;
- usuario;
- senha;
- porta local do PostgreSQL.

## Testes adicionados

Foi criada a classe:

- `src/test/java/com/mykael/prefeitura/core/denuncia/DenunciaTest.java`

Ela cobre regras simples e importantes:

- recalculo da pontuacao de relevancia;
- decremento sem gerar contadores negativos;
- confirmacao de conclusao sem alterar o status `CONCLUIDO`;
- contestacao de conclusao reabrindo a denuncia.

O ambiente de testes usa H2 com schema gerado pelo Hibernate. A migration oficial permanece voltada para PostgreSQL, porque usa recursos especificos do banco, como indice parcial para impedir mais de uma transferencia pendente por denuncia.

## Guia criado

Foi criado:

- `docs/guia_execucao_local.md`

Esse guia explica como subir o banco, executar a aplicacao, acessar Swagger/health check e rodar os testes.

## Observacoes de seguranca

- O projeto continua sem senha fixa de producao.
- O admin inicial usa variaveis de ambiente.
- O `.env` local existe para facilitar a primeira execucao, mas fica fora do versionamento.
- `JWT_SECRET` exige pelo menos 32 caracteres.
- `AUTH_COOKIE_SECURE=false` fica aceitavel apenas para desenvolvimento local sem HTTPS.
