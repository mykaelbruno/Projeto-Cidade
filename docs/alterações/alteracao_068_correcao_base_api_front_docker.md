# Alteração 068 - Correção da base da API no frontend Docker

## Problema identificado

No ambiente Docker, o frontend era buildado com `VITE_API_URL=/api`.

Ao mesmo tempo, os services do frontend já chamavam endpoints com prefixo `/api`, por exemplo:

- `/api/auth/login`
- `/api/auth/me`
- `/api/denuncias`

Isso fazia o cliente HTTP montar URLs duplicadas, como:

- `/api/api/auth/login`

Na prática, o login falhava no navegador mesmo com backend saudável.

## O que foi alterado

- Ajustado o `apiClient` do frontend para normalizar a composição da URL da API.
- Quando a base configurada termina com `/api` e o caminho solicitado já começa com `/api/...`, o cliente evita duplicar o prefixo.

## Benefício

- O frontend passa a funcionar corretamente:
  - no Docker com proxy reverso via `/api`
  - no desenvolvimento local com base absoluta, como `http://localhost:8080`
- A correção reduz risco de erro de configuração entre ambientes.

## Arquivo principal

- `front/src/app/services/apiClient.ts`

## Validação esperada

Depois do rebuild do frontend Docker, os logs do Nginx devem mostrar:

- `POST /api/auth/login`

e não mais:

- `POST /api/api/auth/login`
