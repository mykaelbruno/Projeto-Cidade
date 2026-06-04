# Alteracao 047 - Integracao Admin App: Organizacoes e Usuarios

Data: 2026-06-02

## Objetivo

Iniciar a integracao do Admin App pelo nucleo administrativo: gestao de organizacoes e usuarios globais.

## O que foi feito

- Criados tipos de payload para organizacoes:
  - `PrefeituraCreateRequestDTO`;
  - `SecretariaCreateRequestDTO`;
  - `OrganizacaoUpdateRequestDTO`.
- Criado `front/src/app/types/usuario.ts` com payloads de criacao e edicao de usuario.
- Expandido `organizacaoService` com:
  - listar organizacoes;
  - criar prefeitura;
  - criar secretaria;
  - atualizar organizacao;
  - ativar/inativar organizacao.
- Criado `usuarioService` com:
  - listar usuarios;
  - criar usuario;
  - atualizar usuario;
  - ativar/inativar usuario.
- Reescrita a pagina de organizacoes do Admin App para usar backend real.
- Reescrita a pagina de usuarios globais do Admin App para usar backend real.

## Regras respeitadas

- Prefeituras e secretarias sao agrupadas por `organizacaoPaiId`.
- Criacao de secretaria usa uma prefeitura existente e pode enviar `categoriasIds`.
- Edicao de organizacao usa apenas os campos aceitos pelo backend: `nome`, `cidade`, `estado`, `verificada`.
- Usuarios globais usam os perfis reais `ADMIN_APP`, `MODERADOR` e `MORADOR`.
- Ativar/inativar usuarios e organizacoes usa os endpoints reais de ativacao.

## Pendencias conscientes

- O backend nao possui edicao de categorias vinculadas a uma secretaria no endpoint `PUT /api/organizacoes/{id}`. Por isso, categorias sao selecionadas apenas na criacao da secretaria.
- A busca de usuarios e organizacoes e feita localmente sobre a lista carregada, porque os endpoints atuais nao possuem query server-side.
- Exportacao de usuarios foi removida desta etapa porque nao existe endpoint especifico para isso.
- O build do front gerou apenas o aviso de chunk grande do Vite, sem erro de compilacao.

## Validacao

- `npm.cmd run build` executado com sucesso em `front/`.
