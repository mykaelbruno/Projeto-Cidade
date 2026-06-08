# Documentacao DevOps - Cidade Ativa

## Objetivo

Este documento centraliza a estrategia atual de containerizacao do projeto `Cidade Ativa`. Ele foi criado para facilitar manutencao, onboarding e preparacao do deploy, usando uma estrutura simples e previsivel:

- `postgres` para persistencia;
- `backend` Spring Boot;
- `frontend` React compilado e servido por Nginx.

O repositorio ainda nao possui pipeline de CI/CD versionado em `.github/workflows`. No estado atual, a base DevOps preparada aqui atende bem dois cenarios:

- execucao local com stack completa em Docker;
- deploy manual ou semiautomatico em VPS usando `docker compose`.

Como apoio operacional, o projeto agora tambem possui um modelo de ambiente para deploy:

- [.env.docker.example](C:/Users/mykae/OneDrive/Desktop/prefeitura/.env.docker.example)

O `docker-compose.yml` agora aceita dois arquivos opcionais para injetar variaveis no container do backend:

- `.env` para uso local geral do projeto;
- `.env.docker` para um pacote/exportacao focado em Docker.

Se nenhum deles existir, a stack ainda consegue montar usando os defaults definidos no Compose e no `application.yml`, mas isso nao e o ideal para ambiente real.

## Arquitetura Docker adotada

### Servicos

#### `postgres`

- Imagem: `postgres:16-alpine`
- Responsabilidade: banco principal da aplicacao
- Volume: `postgres_data`
- Health check com `pg_isready`

#### `backend`

- Build local a partir do `Dockerfile` na raiz
- Runtime: Java 21
- Responsabilidade: API Spring Boot, regras de negocio, uploads, Flyway e autenticacao
- Volume: `backend_uploads`

#### `frontend`

- Build local a partir de `front/Dockerfile`
- Runtime: `nginx:alpine`
- Responsabilidade: servir a SPA React e fazer proxy reverso para o backend

## Arquivos principais

- [Dockerfile](C:/Users/mykae/OneDrive/Desktop/prefeitura/Dockerfile): imagem do backend
- [docker-compose.yml](C:/Users/mykae/OneDrive/Desktop/prefeitura/docker-compose.yml): orquestracao da stack
- [front/Dockerfile](C:/Users/mykae/OneDrive/Desktop/prefeitura/front/Dockerfile): imagem do frontend
- [front/nginx.conf](C:/Users/mykae/OneDrive/Desktop/prefeitura/front/nginx.conf): proxy e fallback SPA
- [.dockerignore](C:/Users/mykae/OneDrive/Desktop/prefeitura/.dockerignore): reduz contexto de build do backend
- [front/.dockerignore](C:/Users/mykae/OneDrive/Desktop/prefeitura/front/.dockerignore): reduz contexto de build do frontend
- [.env.docker.example](C:/Users/mykae/OneDrive/Desktop/prefeitura/.env.docker.example): modelo base para deploy com Compose

## Decisoes tecnicas

### 1. Frontend usando proxy `/api`

O frontend Dockerizado e compilado com `VITE_API_URL=/api` por padrao.

Isso permite:

- manter frontend e backend no mesmo host publico;
- reduzir problemas com cookies HttpOnly;
- simplificar CORS em producao;
- esconder a URL interna real do backend do bundle do frontend.

No Nginx, as rotas abaixo sao encaminhadas para o backend:

- `/api/`
- `/api-docs`
- `/v3/api-docs/`
- `/swagger-ui.html`
- `/swagger-ui/`
- `/actuator/`

### 2. Uploads persistidos em volume

O backend salva anexos em:

```text
/app/uploads/denuncias
```

Esse diretorio fica dentro do volume `backend_uploads`, evitando perda de arquivos quando o container do backend for recriado.

### 3. Banco interno da rede Docker

O backend nao usa `localhost` para falar com o banco quando sobe via Compose. Dentro da rede Docker, a conexao passa a ser:

```text
jdbc:postgresql://postgres:5432/${POSTGRES_DB}
```

### 4. Dois modos de uso suportados

#### Modo A: stack completa em Docker

Usa `postgres + backend + frontend`.

Comando:

```powershell
docker compose up -d --build
```

#### Modo B: hibrido para desenvolvimento

Usa apenas o banco em Docker e roda backend/frontend localmente.

Comandos:

```powershell
docker compose up -d postgres
.\mvnw.cmd spring-boot:run
cd front
npm run dev
```

Esse modo continua util para desenvolvimento diario, depuracao e acesso ao Swagger local.

## Variaveis de ambiente mais importantes

### Banco

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

### Aplicacao

- `SERVER_PORT`
- `JWT_SECRET`
- `JWT_ISSUER`
- `AUTH_COOKIE_SECURE`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `DENUNCIA_ANEXOS_DIR`

### Frontend build

- `VITE_API_URL`
- `FRONTEND_PORT`

### Email

- `MAIL_ENABLED`
- `MAIL_NOTIFICATIONS_ENABLED`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

## Recomendacoes para producao

Para um deploy real em VPS ou host dedicado:

- usar `SPRING_PROFILES_ACTIVE=prod`;
- usar `AUTH_COOKIE_SECURE=true` com HTTPS;
- definir `FRONTEND_URL` com o dominio publico real;
- definir `CORS_ALLOWED_ORIGINS` com o mesmo dominio publico;
- trocar `JWT_SECRET` por um segredo forte e exclusivo do ambiente;
- usar credenciais reais de SMTP se o envio de email estiver habilitado;
- manter `backend_uploads` e `postgres_data` persistidos fora do ciclo de recreacao dos containers.

Exemplo de valores de producao:

```env
SPRING_PROFILES_ACTIVE=prod
AUTH_COOKIE_SECURE=true
FRONTEND_URL=https://cidadeativa.seu-dominio.com
CORS_ALLOWED_ORIGINS=https://cidadeativa.seu-dominio.com
VITE_API_URL=/api
```

## Fluxo sugerido de deploy manual

Antes do primeiro deploy, a recomendacao e:

1. copiar `.env.docker.example` para `.env.docker`;
2. ajustar senhas, dominio, JWT e SMTP;
3. subir a stack com esse arquivo presente na raiz do projeto.

No servidor:

```powershell
docker compose pull
docker compose up -d --build
docker compose ps
```

Se a estrategia de deploy for com build local no proprio servidor, o `pull` pode ser dispensado e o fluxo fica:

```powershell
docker compose up -d --build
docker compose ps
```

## Validacoes recomendadas depois do deploy

### Backend

- `GET /actuator/health`
- login com usuario real
- criacao de denuncia
- upload de anexo
- abertura de pagina de detalhe de relato

### Frontend

- carregamento da SPA sem erro de rota
- refresh em rotas internas sem `404`
- chamadas para `/api` funcionando no navegador
- cookies de autenticacao sendo enviados corretamente

Observacao: quando `MAIL_ENABLED=false`, o health de e-mail tambem fica desabilitado automaticamente para evitar falso `503` em ambientes sem SMTP local.

## Validacao da dockerizacao nesta etapa

Nesta revisao final de exportacao:

- `docker compose config` foi validado com sucesso;
- `docker compose build backend frontend` foi validado com sucesso;
- a stack ficou consistente com o frontend em `front/`, backend na raiz e banco em `postgres`.

## Limites conscientes desta etapa

- Nao foi criado pipeline CI/CD neste momento.
- Nao foi criado `docker-compose.prod.yml` separado.
- O frontend usa build-time config para `VITE_API_URL`; a estrategia padrao adotada foi manter `/api` relativo via Nginx.
- O Swagger continua acessivel no ambiente padrao, mas o perfil `prod` do backend ja o desativa.

## Direcao futura recomendada

Quando a parte de deploy entrar em producao de vez, o proximo passo natural e:

1. versionar um workflow de CI para teste e build;
2. publicar imagens em registry;
3. padronizar um compose de VPS ou um `docker-compose.prod.yml`;
4. adicionar reverse proxy externo com HTTPS, como Nginx Proxy Manager, Traefik ou Caddy.
