# Documento 2 â€” Planejamento TÃ©cnico do Sistema

## 1. VisÃ£o geral da stack

A stack escolhida para o projeto serÃ¡:

```txt
Backend: Java + Spring Boot
AutenticaÃ§Ã£o: Spring Security + JWT
Frontend: React JS
EstilizaÃ§Ã£o: Tailwind CSS
Banco de dados: PostgreSQL
Mapas/geolocalizaÃ§Ã£o: Leaflet ou Mapbox
Upload de imagens: MinIO ou serviÃ§o compatÃ­vel com S3
DocumentaÃ§Ã£o da API: Swagger/OpenAPI
Migrations: Flyway
Deploy: Docker + Docker Compose
Proxy/produÃ§Ã£o: Nginx
```

Essa stack Ã© adequada porque permite construir uma aplicaÃ§Ã£o robusta, escalÃ¡vel e bem organizada, mas ainda viÃ¡vel para desenvolvimento acadÃªmico ou MVP real.

---

## 2. Backend

O backend serÃ¡ responsÃ¡vel por:

- autenticaÃ§Ã£o;
- autorizaÃ§Ã£o;
- cadastro de usuÃ¡rios;
- gestÃ£o de denÃºncias;
- gestÃ£o de prefeituras;
- gestÃ£o de secretarias;
- comentÃ¡rios;
- interaÃ§Ãµes;
- moderaÃ§Ã£o;
- upload de imagens;
- alteraÃ§Ã£o de status;
- timeline;
- notificaÃ§Ãµes;
- APIs para o frontend.

---

## 3. ConfiguraÃ§Ã£o no Spring Initializr

ConfiguraÃ§Ãµes recomendadas:

```txt
Project: Maven
Language: Java
Spring Boot: versÃ£o estÃ¡vel atual
Packaging: Jar
Java: 21, se disponÃ­vel
```

Caso o ambiente nÃ£o suporte Java 21, usar Java 17.

---

## 4. DependÃªncias para adicionar no Spring Initializr

Adicionar:

```txt
Spring Web
Spring Security
OAuth2 Resource Server
Spring Data JPA
PostgreSQL Driver
Validation
Flyway Migration
Lombok
Spring Boot DevTools
Spring Boot Actuator
```

---

## 5. Finalidade de cada dependÃªncia

### Spring Web

Usado para criar a API REST.

Exemplos:

```txt
POST /auth/login
POST /auth/register
GET /denuncias
POST /denuncias
PATCH /denuncias/{id}/status
```

---

### Spring Security

Usado para proteger rotas e controlar permissÃµes.

Exemplo:

- morador pode criar denÃºncia;
- secretaria pode alterar status;
- admin da aplicaÃ§Ã£o pode criar prefeitura;
- moderador pode remover conteÃºdo.

---

### OAuth2 Resource Server

Ajuda o Spring Security a trabalhar com validaÃ§Ã£o de JWT.

Mesmo que o JWT seja emitido pela prÃ³pria aplicaÃ§Ã£o, essa dependÃªncia facilita a configuraÃ§Ã£o de autenticaÃ§Ã£o baseada em token.

---

### Spring Data JPA

Usado para trabalhar com entidades e repositÃ³rios.

Exemplo:

```java
UserRepository
DenunciaRepository
OrganizacaoRepository
ComentarioRepository
```

---

### PostgreSQL Driver

Permite conexÃ£o com banco PostgreSQL.

---

### Validation

Permite validar DTOs com anotaÃ§Ãµes.

Exemplo:

```java
@NotBlank
@Email
@Size(min = 8)
@NotNull
```

---

### Flyway Migration

Usado para versionar o banco de dados.

Exemplo:

```txt
V1__create_core_tables.sql
```

Durante a fase inicial, antes de executar o projeto em ambiente real, o schema foi consolidado em uma migration unica. Depois que houver banco aplicado em algum ambiente, novas mudancas devem ser feitas com migrations incrementais.

---

### Lombok

Reduz cÃ³digo repetitivo.

Exemplo:

```java
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
```

---

### DevTools

Facilita o desenvolvimento local com reinicializaÃ§Ã£o automÃ¡tica.

---

### Actuator

Permite endpoints de monitoramento.

Exemplo:

```txt
/actuator/health
```

Ãštil para verificar se a aplicaÃ§Ã£o estÃ¡ no ar.

---

## 6. DependÃªncias que podem ser adicionadas manualmente depois

### Springdoc OpenAPI / Swagger

Adicionar no `pom.xml`:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.8</version>
</dependency>
```

A documentaÃ§Ã£o da API ficarÃ¡ disponÃ­vel em uma rota semelhante a:

```txt
/swagger-ui/index.html
```

---

### MinIO Client

Caso use MinIO para upload de imagens:

```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.17</version>
</dependency>
```

---

## 7. Banco de dados

Banco recomendado:

```txt
PostgreSQL
```

Inicialmente, salvar localizaÃ§Ã£o com campos simples:

```txt
latitude: Double
longitude: Double
```

Isso jÃ¡ permite implementar filtros bÃ¡sicos por localizaÃ§Ã£o.

Depois, se o sistema evoluir, usar PostGIS para buscas geogrÃ¡ficas mais avanÃ§adas.

### Quando usar PostGIS

Usar PostGIS quando precisar de:

- busca por raio;
- denÃºncias prÃ³ximas;
- mapa com concentraÃ§Ã£o;
- cÃ¡lculo geogrÃ¡fico mais preciso;
- filtro por distÃ¢ncia.

Para o MVP, latitude e longitude jÃ¡ sÃ£o suficientes.

---

## 8. Entidades principais

### User

Representa o usuÃ¡rio do sistema.

Campos sugeridos:

```txt
id
name
email
password
phone
city
neighborhood
profileImageUrl
active
createdAt
updatedAt
```

---

### Role

Representa os papÃ©is/permissÃµes.

Exemplos:

```txt
ADMIN_APP
MORADOR
ADMIN_PREFEITURA
ADMIN_SECRETARIA
ATENDENTE_SECRETARIA
MODERADOR
```

---

### Organization

Representa prefeitura e secretaria.

Campos:

```txt
id
name
type
city
state
parentOrganizationId
verified
active
createdAt
updatedAt
```

Tipos:

```txt
PREFEITURA
SECRETARIA
```

Uma secretaria terÃ¡ `parentOrganizationId` apontando para a prefeitura.

---

### UserOrganization

Liga usuÃ¡rios a organizaÃ§Ãµes.

Campos:

```txt
id
userId
organizationId
role
active
createdAt
```

Exemplo:

```txt
Maria â†’ Prefeitura de Mamanguape â†’ ADMIN_PREFEITURA
JoÃ£o â†’ Secretaria de Infraestrutura â†’ ADMIN_SECRETARIA
Carlos â†’ Secretaria de Infraestrutura â†’ ATENDENTE_SECRETARIA
```

---

### Report

Representa a denÃºncia.

Campos:

```txt
id
title
description
categoryId
status
authorId
anonymous
city
neighborhood
street
referencePoint
latitude
longitude
responsibleOrganizationId
relevanceScore
createdAt
updatedAt
```

---

### ReportImage

Representa imagens da denÃºncia.

Campos:

```txt
id
reportId
imageUrl
createdAt
```

NÃ£o salvar imagem diretamente no banco. Salvar a imagem no MinIO/S3 e guardar apenas a URL.

---

### Category

Representa categorias de denÃºncia.

Campos:

```txt
id
name
description
defaultResponsibleOrganizationId
active
```

---

### Comment

Representa comentÃ¡rios nas denÃºncias.

Campos:

```txt
id
reportId
authorId
content
official
organizationId
createdAt
updatedAt
deletedAt
```

Campo `official` indica se o comentÃ¡rio foi feito por prefeitura/secretaria.

---

### ReportInteraction

Representa confirmaÃ§Ãµes e urgÃªncias.

Campos:

```txt
id
reportId
userId
type
createdAt
```

Tipos:

```txt
CONFIRMATION
URGENT
```

Regra: cada usuÃ¡rio sÃ³ pode registrar uma interaÃ§Ã£o de cada tipo por denÃºncia.

---

### ReportStatusHistory

Representa a timeline da denÃºncia.

Campos:

```txt
id
reportId
oldStatus
newStatus
changedByUserId
organizationId
description
createdAt
```

---

### ContentReport

Representa denÃºncias de conteÃºdo inadequado.

Campos:

```txt
id
targetType
targetId
reportedByUserId
reason
description
status
createdAt
reviewedAt
reviewedByUserId
```

Tipos de alvo:

```txt
REPORT
COMMENT
```

---

### Notification

Representa notificaÃ§Ãµes internas.

Campos:

```txt
id
userId
title
message
type
read
createdAt
```

---

## 9. AutenticaÃ§Ã£o

Fluxo com JWT:

```txt
UsuÃ¡rio faz login
â†“
Backend valida email e senha
â†“
Backend gera token JWT
â†“
Frontend salva o token
â†“
Frontend envia token no header Authorization
```

Header:

```txt
Authorization: Bearer token_aqui
```

---

## 10. AutorizaÃ§Ã£o e permissÃµes

Usar controle baseado em papÃ©is.

Exemplo de regras:

```txt
ADMIN_APP:
- cria prefeitura
- gerencia plataforma
- acessa moderaÃ§Ã£o global

ADMIN_PREFEITURA:
- cria secretarias
- gerencia usuÃ¡rios da prefeitura
- visualiza todas as denÃºncias da cidade

ADMIN_SECRETARIA:
- gerencia secretaria
- atualiza denÃºncias da secretaria

ATENDENTE_SECRETARIA:
- responde e atualiza denÃºncias atribuÃ­das

MORADOR:
- cria denÃºncias
- comenta
- confirma
- valida resoluÃ§Ã£o

MODERADOR:
- revisa conteÃºdos reportados
```

---

## 11. Endpoints principais

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

---

### UsuÃ¡rios

```txt
GET /api/users/me
PATCH /api/users/me
```

---

### Prefeituras e organizaÃ§Ãµes

```txt
POST /api/organizations/prefeituras
GET /api/organizations/prefeituras
GET /api/organizations/{id}
PATCH /api/organizations/{id}
POST /api/organizations/{prefeituraId}/secretarias
GET /api/organizations/{prefeituraId}/secretarias
```

---

### VÃ­nculo de usuÃ¡rios com organizaÃ§Ãµes

```txt
POST /api/organizations/{id}/users
GET /api/organizations/{id}/users
DELETE /api/organizations/{id}/users/{userId}
```

---

### DenÃºncias

```txt
POST /api/reports
GET /api/reports
GET /api/reports/{id}
PATCH /api/reports/{id}
DELETE /api/reports/{id}
PATCH /api/reports/{id}/status
PATCH /api/reports/{id}/transfer
```

---

### Imagens da denÃºncia

```txt
POST /api/reports/{id}/images
GET /api/reports/{id}/images
DELETE /api/reports/{id}/images/{imageId}
```

---

### ComentÃ¡rios

```txt
POST /api/reports/{id}/comments
GET /api/reports/{id}/comments
DELETE /api/comments/{id}
```

---

### InteraÃ§Ãµes

```txt
POST /api/reports/{id}/confirm
DELETE /api/reports/{id}/confirm

POST /api/reports/{id}/urgent
DELETE /api/reports/{id}/urgent
```

---

### ValidaÃ§Ã£o de resoluÃ§Ã£o

```txt
POST /api/reports/{id}/resolution-votes
GET /api/reports/{id}/resolution-votes
```

---

### ModeraÃ§Ã£o

```txt
POST /api/moderation/reports
GET /api/moderation/reports
PATCH /api/moderation/reports/{id}/review
```

---

### NotificaÃ§Ãµes

```txt
GET /api/notifications
PATCH /api/notifications/{id}/read
```

---

## 12. Estrutura sugerida de pacotes no backend

```txt
src/main/java/com/seuprojeto/cidadeativa
â”œâ”€â”€ auth
â”œâ”€â”€ user
â”œâ”€â”€ organization
â”œâ”€â”€ report
â”œâ”€â”€ category
â”œâ”€â”€ comment
â”œâ”€â”€ interaction
â”œâ”€â”€ moderation
â”œâ”€â”€ notification
â”œâ”€â”€ storage
â”œâ”€â”€ security
â”œâ”€â”€ config
â””â”€â”€ shared
```

Cada mÃ³dulo pode ter:

```txt
controller
service
repository
entity
dto
mapper
```

Exemplo:

```txt
report
â”œâ”€â”€ ReportController.java
â”œâ”€â”€ ReportService.java
â”œâ”€â”€ ReportRepository.java
â”œâ”€â”€ Report.java
â”œâ”€â”€ dto
â””â”€â”€ mapper
```

---

## 13. Frontend

Stack:

```txt
React JS
Vite
Tailwind CSS
React Router
Axios
TanStack Query
React Hook Form
Zod
Leaflet
```

---

## 14. Bibliotecas recomendadas no React

InstalaÃ§Ã£o base:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

DependÃªncias Ãºteis:

```bash
npm install axios react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers
npm install leaflet react-leaflet
```

Tailwind:

```bash
npm install tailwindcss @tailwindcss/vite
```

---

## 15. Telas principais do frontend

### PÃºblicas

```txt
Login
Cadastro
Feed pÃºblico, se permitido
Detalhes da denÃºncia
```

### Morador

```txt
Feed
Criar denÃºncia
Meu perfil
Minhas denÃºncias
NotificaÃ§Ãµes
Detalhes da denÃºncia
```

### Prefeitura

```txt
Dashboard da prefeitura
Gerenciar secretarias
Gerenciar usuÃ¡rios institucionais
RelatÃ³rios
```

### Secretaria

```txt
Fila de denÃºncias
Detalhes da denÃºncia
Atualizar status
Transferir denÃºncia
Responder oficialmente
```

### ModeraÃ§Ã£o

```txt
Painel de denÃºncias reportadas
RevisÃ£o de conteÃºdo
HistÃ³rico de aÃ§Ãµes
```

---

## 16. Upload de imagens

NÃ£o salvar imagens no banco.

Fluxo recomendado:

```txt
Frontend envia imagem
â†“
Backend recebe MultipartFile
â†“
Backend salva no MinIO/S3
â†“
Backend recebe URL/identificador
â†“
Backend salva metadados no PostgreSQL
```

Campos salvos no banco:

```txt
reportId
imageUrl
createdAt
```

---

## 17. DockerizaÃ§Ã£o

Para desenvolvimento local, usar Docker Compose com:

```txt
Backend Spring Boot
PostgreSQL
MinIO
Frontend React
```

No comeÃ§o, o frontend pode rodar separado com `npm run dev`, e o Docker Compose pode subir apenas PostgreSQL e MinIO.

---

## 18. docker-compose inicial para desenvolvimento

Exemplo:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: cidadeativa-postgres
    environment:
      POSTGRES_DB: cidadeativa
      POSTGRES_USER: cidadeativa
      POSTGRES_PASSWORD: cidadeativa
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  minio:
    image: minio/minio
    container_name: cidadeativa-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: cidadeativa
      MINIO_ROOT_PASSWORD: cidadeativa123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

---

## 19. Dockerfile do backend

Exemplo simples:

```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Se usar Java 17, trocar as imagens para `17-jdk` e `17-jre`.

---

## 20. Dockerfile do frontend

Exemplo com build e Nginx:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 21. VariÃ¡veis de ambiente do backend

Exemplo:

```txt
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/cidadeativa
SPRING_DATASOURCE_USERNAME=cidadeativa
SPRING_DATASOURCE_PASSWORD=cidadeativa

JWT_SECRET=sua_chave_secreta_grande
JWT_EXPIRATION=86400000

MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=cidadeativa
MINIO_SECRET_KEY=cidadeativa123
MINIO_BUCKET=reports
```

---

## 22. application.yml sugerido

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/cidadeativa}
    username: ${SPRING_DATASOURCE_USERNAME:cidadeativa}
    password: ${SPRING_DATASOURCE_PASSWORD:cidadeativa}

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true

  flyway:
    enabled: true

server:
  port: 8080

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION:86400000}

minio:
  endpoint: ${MINIO_ENDPOINT:http://localhost:9000}
  access-key: ${MINIO_ACCESS_KEY:cidadeativa}
  secret-key: ${MINIO_SECRET_KEY:cidadeativa123}
  bucket: ${MINIO_BUCKET:reports}
```

---

## 23. CORS

Como o frontend e backend rodam em portas diferentes no desenvolvimento, configurar CORS.

Exemplo:

```txt
Frontend: http://localhost:5173
Backend: http://localhost:8080
```

Permitir requisiÃ§Ãµes do frontend para a API.

---

## 24. SeguranÃ§a importante

Mesmo sendo MVP, nÃ£o esquecer:

- senha com hash usando BCrypt;
- JWT com chave segura;
- validaÃ§Ã£o de entrada com DTOs;
- nÃ£o retornar senha em respostas;
- verificar permissÃ£o antes de alterar status;
- limitar upload por tamanho e tipo;
- impedir usuÃ¡rio de votar vÃ¡rias vezes na mesma denÃºncia;
- logs para aÃ§Ãµes sensÃ­veis;
- nÃ£o permitir que prefeitura modere denÃºncias;
- nÃ£o confiar em dados enviados pelo frontend.

---

## 25. Ordem prÃ¡tica de desenvolvimento

SugestÃ£o de ordem:

```txt
1. Criar projeto Spring Boot
2. Configurar PostgreSQL com Docker
3. Configurar entidades User, Role e autenticaÃ§Ã£o JWT
4. Criar login/cadastro
5. Criar entidade Organization
6. Criar fluxo Admin App cria Prefeitura
7. Criar fluxo Prefeitura cria Secretarias
8. Criar categorias
9. Criar denÃºncia
10. Criar feed com paginaÃ§Ã£o
11. Criar comentÃ¡rios
12. Criar interaÃ§Ãµes
13. Criar alteraÃ§Ã£o de status
14. Criar timeline
15. Criar upload de imagens
16. Criar painel da prefeitura
17. Criar painel da secretaria
18. Criar moderaÃ§Ã£o
19. Criar notificaÃ§Ãµes internas
20. Dockerizar backend e frontend
```

---

## 26. Prioridade para o MVP

NÃ£o tentar fazer tudo de uma vez.

### Primeiro bloco

- autenticaÃ§Ã£o;
- usuÃ¡rio;
- prefeitura;
- secretaria;
- denÃºncia;
- feed.

### Segundo bloco

- comentÃ¡rios;
- confirmaÃ§Ãµes;
- status;
- timeline.

### Terceiro bloco

- upload de imagens;
- painel da secretaria;
- painel da prefeitura.

### Quarto bloco

- moderaÃ§Ã£o;
- notificaÃ§Ãµes;
- mÃ©tricas.

---

## 27. Nome provisÃ³rio do projeto

SugestÃµes internas:

```txt
Cidade Ativa
Voz da Cidade
Fala Bairro
Resolve Cidade
Portal CidadÃ£o
```

Usar um nome provisÃ³rio no cÃ³digo, por exemplo:

```txt
cidadeativa
```
