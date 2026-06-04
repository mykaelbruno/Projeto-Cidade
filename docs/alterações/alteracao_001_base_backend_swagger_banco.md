# Alteracao 001 - Base do backend, banco e Swagger

## Objetivo

Esta alteracao inicia a base tecnica do backend do sistema de denuncias urbanas, seguindo a ordem indicada na documentacao existente: preparar o projeto Spring Boot, configurar banco PostgreSQL com Flyway, organizar os primeiros pacotes e deixar a documentacao da API pronta para evoluir junto com os endpoints.

## O que foi adicionado

### Configuracao da aplicacao

- Substituicao de `application.properties` por `application.yml`.
- Configuracao inicial de:
  - nome da aplicacao;
  - porta HTTP;
  - datasource PostgreSQL via variaveis de ambiente;
  - Flyway habilitado;
  - JPA com `ddl-auto: validate`;
  - Actuator expondo apenas `health` e `info`;
  - Swagger UI em `/swagger-ui.html`;
  - especificacao OpenAPI em `/api-docs`.

### Docker Compose

Foi criado um `docker-compose.yml` inicial com PostgreSQL para desenvolvimento local.

Servico criado:

- `postgres`

Banco padrao:

- database: `cidadeativa`
- user: `cidadeativa`
- password: `cidadeativa`

### Ambiente de testes

Foi adicionada configuracao de teste em:

```txt
src/test/resources/application.yml
```

Os testes usam H2 em memoria com modo de compatibilidade PostgreSQL. Isso evita que o teste de contexto dependa de um PostgreSQL local ja configurado na maquina do desenvolvedor.

Tambem foi adicionada a dependencia `h2` com escopo de teste.

### Swagger/OpenAPI

Foi adicionada a dependencia `springdoc-openapi-starter-webmvc-ui`.

A configuracao inicial esta em:

```txt
src/main/java/com/mykael/prefeitura/config/OpenApiConfig.java
```

Nome inicial da API:

```txt
Cidade Ativa API
```

Descricao inicial:

```txt
API para registro, acompanhamento e gestao de denuncias urbanas.
```

### Organizacao de pacotes

O projeto foi organizado separando regra de negocio de infraestrutura:

```txt
core
infra
```

`core` contem os modulos principais do dominio do sistema.

`infra` contem configuracoes e partes tecnicas que nao representam entidades de negocio.

Dentro de cada modulo do `core`, o padrao adotado e:

```txt
Modelo
dto
Service
Repository
Controller
ControllerOpenApi
```

Exemplo:

```txt
core/denuncia
  dto/
    DenunciaResponseDTO.java
  Denuncia.java
  DenunciaService.java
  DenunciaRepository.java
  DenunciaController.java
  DenunciaControllerOpenApi.java
```

Os nomes foram mantidos em portugues sempre que possivel, sem acentos em nomes de classes, metodos, pacotes e tabelas para evitar problemas tecnicos.

Os controllers retornam DTOs, nao as entidades diretamente. Isso evita vazamento de campos internos como `senhaHash` e mantem a API mais estavel.

### Infraestrutura inicial

Foram criados pacotes iniciais em `infra`:

```txt
infra/doc
infra/security
infra/error
```

Responsabilidades:

- `infra/doc`: configuracao do Swagger/OpenAPI.
- `infra/security`: configuracao inicial do Spring Security.
- `infra/error`: estrutura inicial de resposta padronizada de erro.

## Entidades criadas

### Usuario

Representa o usuario do sistema.

Campos principais:

- nome;
- email;
- hash da senha;
- telefone;
- cidade;
- bairro;
- foto de perfil;
- ativo;
- datas de criacao e atualizacao.

Observacao: foi usado `passwordHash`, nao `password`, para deixar claro que senha pura nao deve ser persistida.

Na implementacao em portugues, o campo se chama `senhaHash`.

### Organizacao

Representa prefeitura ou secretaria.

Tipos suportados:

```txt
PREFEITURA
SECRETARIA
```

Uma secretaria deve apontar para uma prefeitura por meio de `organizacaoPai`.

### VinculoUsuarioOrganizacao

Representa o vinculo entre usuario e organizacao.

Papeis suportados:

```txt
ADMIN_APP
MORADOR
ADMIN_PREFEITURA
ADMIN_SECRETARIA
ATENDENTE_SECRETARIA
MODERADOR
```

### Categoria

Representa uma categoria de denuncia.

Pode possuir uma organizacao responsavel padrao.

### Denuncia

Representa a denuncia urbana.

Status suportados:

```txt
ABERTO
EM_ANALISE
ENCAMINHADO
EM_ANDAMENTO
PROGRAMADO
CONCLUIDO
REABERTO
ARQUIVADO
```

## Banco de dados

Foi criada a migration:

```txt
src/main/resources/db/migration/V1__create_core_tables.sql
```

Tabelas criadas com nomes em portugues:

- `usuarios`
- `organizacoes`
- `vinculos_usuario_organizacao`
- `categorias`
- `denuncias`

Tambem foram adicionadas constraints para:

- email unico;
- tipos validos de organizacao;
- secretaria obrigatoriamente vinculada a uma prefeitura;
- papeis validos;
- status validos de denuncia.

Indices iniciais foram criados em campos importantes de listagem e filtro de denuncias.

## Decisoes tomadas

- A base segue o nome de produto sugerido na documentacao: `Cidade Ativa`.
- O pacote Java permanece em `com.mykael.prefeitura`, pois ja era o pacote inicial do projeto.
- A documentacao Swagger foi preparada antes dos endpoints, para que cada novo controller ja nasca documentado.
- As entidades iniciais seguem os campos descritos nos documentos existentes, sem adicionar fluxos ainda nao definidos.
- A camada `ControllerOpenApi` foi criada para deixar a documentacao Swagger separada do controller, mantendo os controllers mais limpos.
- Foram criados DTOs de resposta para os endpoints iniciais, evitando expor entidades JPA diretamente.
- A configuracao de seguranca esta permissiva nesta primeira etapa apenas para permitir visualizar os endpoints iniciais e o Swagger. A restricao real sera implementada na etapa de autenticacao e autorizacao.
- O cache local do Maven foi ignorado em `.gitignore`, pois pode ser usado dentro do workspace apenas para validacao local.
- O `mvnw.cmd` recebeu um ajuste defensivo para nao falhar quando o diretorio `.m2` nao for um link simbolico no Windows.

## Proximos passos sugeridos

1. Criar configuracao inicial de seguranca.
2. Implementar cadastro e login.
3. Definir DTOs de autenticacao com validacoes.
4. Implementar BCrypt para senhas.
5. Implementar JWT usando cookies HttpOnly, conforme especificado na documentacao de seguranca.
6. Documentar os endpoints de autenticacao no Swagger.
