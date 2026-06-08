# Alteracao 066 - Dockerizacao completa e base DevOps

Data: 2026-06-07

## Objetivo

Preparar o projeto para deploy com uma estrutura Docker completa, previsivel e facil de manter, cobrindo frontend, backend e banco de dados.

## O que foi criado

- `Dockerfile` na raiz para empacotar o backend Spring Boot.
- `front/Dockerfile` para buildar o frontend React e servir com Nginx.
- `front/nginx.conf` com:
  - proxy de `/api` para o backend;
  - fallback SPA com `try_files`;
  - proxy utilitario para `swagger-ui`, `api-docs` e `actuator`.
- `docker-compose.yml` completo com:
  - `postgres`;
  - `backend`;
  - `frontend`;
  - volume persistente para banco;
  - volume persistente para uploads.
- `.dockerignore` na raiz e em `front/` para reduzir contexto de build.
- `.env.docker.example` com um conjunto base de variaveis para deploy.
- `docs/Documentacao-devOps.md` consolidando a arquitetura e o fluxo operacional.

## Decisoes tecnicas

### Frontend com `/api` relativo

Foi adotado `VITE_API_URL=/api` por padrao no build do frontend Dockerizado. Isso facilita:

- cookies HttpOnly;
- simplificacao de CORS;
- deploy em host unico;
- menor acoplamento do bundle a um endpoint absoluto.

### Uploads persistidos

Os anexos de denuncias foram mapeados para volume Docker em `/app/uploads/denuncias`, evitando perda de arquivos em recriacoes do backend.

### Modo full Docker e modo hibrido

O projeto agora suporta oficialmente:

- stack completa em Docker;
- apenas o banco em Docker, com backend/frontend rodando localmente.

## Documentacao atualizada

- Criado: `docs/Documentacao-devOps.md`
- Atualizado: `docs/guia_execucao_local.md`

## Observacoes

- Ainda nao foi criado pipeline CI/CD versionado no repositorio.
- Ainda nao foi criado `docker-compose.prod.yml` separado.
- O Compose atual ja atende bem deploy manual e preparacao para VPS.
