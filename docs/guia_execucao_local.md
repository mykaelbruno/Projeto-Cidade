# Guia de execucao local

## Objetivo

Este guia serve para subir o projeto pela primeira vez em ambiente local, usando PostgreSQL via Docker Compose e configuracoes vindas do arquivo `.env`.

## Arquivos de configuracao

O projeto possui:

- `.env`: arquivo local usado na execucao. Fica ignorado pelo Git.
- `.env.example`: modelo seguro para recriar o `.env` em outra maquina.

O Spring Boot carrega o `.env` automaticamente quando ele existir, por meio da configuracao:

```yml
spring.config.import: optional:file:.env[.properties]
```

## Variaveis principais

Banco:

```env
POSTGRES_DB=cidadeativa
POSTGRES_USER=cidadeativa
POSTGRES_PASSWORD=cidadeativa-local-dev
POSTGRES_PORT=5433

SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/cidadeativa
SPRING_DATASOURCE_USERNAME=cidadeativa
SPRING_DATASOURCE_PASSWORD=cidadeativa-local-dev
```

Seguranca:

```env
JWT_SECRET=dev-local-secret-change-before-production-32-chars
JWT_ISSUER=cidade-ativa-api
JWT_ACCESS_TOKEN_DURATION=15m
JWT_REFRESH_TOKEN_DURATION=7d
AUTH_COOKIE_SECURE=false
```

Admin inicial:

```env
ADMIN_APP_ENABLED=true
ADMIN_APP_USERNAME=admin_app
ADMIN_APP_EMAIL=admin@app.local
ADMIN_APP_PASSWORD=admin-local-dev-change-me
```

Importante: esses valores sao apenas para desenvolvimento local. Antes de qualquer ambiente compartilhado ou producao, trocar senhas e segredo JWT.

E-mail:

```env
MAIL_ENABLED=false
MAIL_NOTIFICATIONS_ENABLED=false
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=no-reply@cidadeativa.local
MAIL_FROM_NAME=Cidade Ativa
```

Com `MAIL_ENABLED=false`, verificacao de conta e recuperacao de senha continuam funcionando em modo local pelos logs da aplicacao. Para testar envio real localmente, use um servidor SMTP de desenvolvimento, como MailHog/Mailpit, e mude `MAIL_ENABLED=true`.

## Subir banco

```powershell
docker compose up -d
```

O Docker Compose usa as variaveis do `.env`.

### Erro: dockerDesktopLinuxEngine nao encontrado

Se aparecer um erro parecido com:

```txt
open //./pipe/dockerDesktopLinuxEngine: O sistema nao pode encontrar o arquivo especificado
```

isso normalmente significa que o Docker Desktop esta instalado, mas o motor Linux ainda nao esta rodando.

Passos recomendados:

1. Abrir o Docker Desktop pelo menu iniciar.
2. Esperar aparecer que o Docker esta em execucao.
3. Rodar novamente:

```powershell
docker compose up -d
```

Se o Docker Desktop nao abrir ou pedir configuracao do WSL, habilitar o backend Linux/WSL nas configuracoes do Docker Desktop.

Se tambem aparecer aviso de acesso negado em `C:\Users\mykae\.docker\config.json`, corrigir primeiro abrindo o Docker Desktop normalmente. Se continuar, verificar as permissoes desse arquivo ou recriar a configuracao do Docker do usuario.

### Erro: autenticacao por senha falhou para o usuario cidadeativa

Se a aplicacao iniciar, mas falhar com:

```txt
FATAL: autenticacao do tipo senha falhou para o usuario "cidadeativa"
```

a causa mais comum em ambiente local e o volume do PostgreSQL ja ter sido criado com uma senha antiga. O PostgreSQL oficial usa `POSTGRES_PASSWORD` apenas na primeira criacao do banco; depois disso, mudar o `.env` nao troca a senha de um volume ja existente.

Se ainda nao houver dados importantes no banco local, o caminho mais simples e recriar o volume:

```powershell
docker compose down -v
docker compose up -d
```

Depois, executar a aplicacao novamente.

Se houver dados que precisam ser preservados, nao remover o volume. Nesse caso, ajustar `SPRING_DATASOURCE_PASSWORD` no `.env` para a senha real do banco ja criado, ou alterar a senha do usuario dentro do PostgreSQL.

## Rodar aplicacao

```powershell
.\mvnw.cmd spring-boot:run
```

Ao iniciar, o Flyway cria o schema usando:

```txt
src/main/resources/db/migration/V1__create_core_tables.sql
```

Se `ADMIN_APP_ENABLED=true`, o sistema cria o primeiro `ADMIN_APP` se ainda nao existir usuario com o mesmo e-mail ou username.

## Acessos uteis

Swagger:

```txt
http://localhost:8080/swagger-ui.html
```

Health check:

```txt
http://localhost:8080/actuator/health
```

API docs:

```txt
http://localhost:8080/api-docs
```

## Conferir banco no pgAdmin

No pgAdmin, "Server" e apenas uma conexao salva para um PostgreSQL que ja esta rodando. Ele nao cria o servidor Docker.

Neste projeto:

- O servidor PostgreSQL e o container `cidadeativa-postgres`.
- O banco esperado e `cidadeativa`.
- O usuario esperado e `cidadeativa`.

Para cadastrar ou ajustar a conexao no pgAdmin:

```txt
Name: Cidade Ativa Docker
Host: localhost
Port: 5433
Maintenance database: cidadeativa
Username: cidadeativa
Password: cidadeativa-local-dev
```

Se o pgAdmin mostrar apenas bancos antigos, como `aquatrack_api`, a conexao salva provavelmente esta apontando para outro servidor/container ou para o PostgreSQL instalado diretamente no Windows. Neste projeto, o Postgres do Docker usa a porta local `5433` para nao conflitar com um PostgreSQL local que ja esteja usando `5432`.

## Rodar testes

```powershell
.\mvnw.cmd test
```

No estado atual, os testes incluem uma primeira bateria de regras de dominio para denuncia:

- recalculo de pontuacao de relevancia;
- protecao contra contadores negativos;
- confirmacao de conclusao pelo morador;
- contestacao de conclusao com reabertura.

O perfil de testes usa H2 com schema gerado pelo Hibernate. A migration oficial continua voltada para PostgreSQL e deve ser validada ao subir a aplicacao local com Docker Compose.

## Acessar e limpar o banco de dados

### Como acessar o banco de dados

Você pode acessar o banco de dados local do PostgreSQL de duas maneiras principais:

#### 1. Via pgAdmin (Ferramenta Visual)
Como detalhado na seção **Conferir banco no pgAdmin**, utilize as seguintes configurações de conexão:
- **Host**: `localhost`
- **Porta**: `5433` *(configurada via Docker Compose para não conflitar com o PostgreSQL nativo na porta 5432)*
- **Username**: `cidadeativa`
- **Password**: `cidadeativa-local-dev`
- **Database**: `cidadeativa`

#### 2. Via CLI (Linha de comando do Docker)
Para rodar comandos SQL diretamente dentro do container do PostgreSQL, utilize:
```powershell
docker exec -it cidadeativa-postgres psql -U cidadeativa -d cidadeativa
```
*(Caso o nome gerado pelo compose inclua o nome da pasta como prefixo, substitua pelo ID ou nome exato do container correspondente, ex: `prefeitura-cidadeativa-postgres-1`).*

---

### Como limpar o banco de dados (Reset Geral)

Durante o desenvolvimento ou testes, pode ser necessário limpar todos os dados do banco para recomeçar o estado da aplicação do zero. Escolha uma das abordagens a seguir de acordo com a sua necessidade:

#### Abordagem A: Limpeza Total do Container e Volume (Recomendada)
Esta abordagem remove o container e limpa fisicamente o volume do Docker, fazendo com que o PostgreSQL seja recriado e o Flyway aplique as migrations do zero na próxima inicialização da aplicação.

1. Pare os containers e **destrua o volume associado**:
   ```powershell
   docker compose down -v
   ```
2. Inicie os containers novamente:
   ```powershell
   docker compose up -d
   ```
3. Rode a aplicação. As tabelas serão recriadas do zero automaticamente pelo Flyway:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

#### Abordagem B: Reset Manual das Tabelas via SQL
Se você deseja apenas esvaziar os dados das tabelas mantendo a estrutura do banco intacta, você pode se conectar no banco (via CLI ou pgAdmin) e executar um script de `TRUNCATE`. 

Para limpar todos os dados e manter o banco zerado sem apagar o histórico de migrations do Flyway:
```sql
TRUNCATE TABLE interacao_denuncia, comentario, timeline_denuncia, anexo_denuncia, denuncia, categoria, vinculo_usuario_organizacao, organizacao, usuario CASCADE;
```
*(O `CASCADE` garante a remoção de todos os dados respeitando as restrições de chaves estrangeiras em cascata).*

Se preferir limpar a estrutura inteira e forçar o Flyway a rodar as migrations na próxima inicialização:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

## Cuidados

- Nao versionar `.env`.
- Nao usar os valores locais em producao.
- Manter `JWT_SECRET` com pelo menos 32 caracteres.
- Manter `AUTH_COOKIE_SECURE=true` in producao com HTTPS.
- Depois que a `V1` for aplicada em banco real, nao editar a migration aplicada. Novas mudancas devem entrar como `V2`, `V3` e assim por diante.
