# Alteracao 046 - Integracao da Area do Moderador

Data: 2026-06-02

## Objetivo

Integrar a pagina do moderador ao backend real, removendo mocks de sinalizacoes, contadores e historico.

## O que foi feito

- Criado `front/src/app/types/moderacao.ts` com os DTOs reais de moderacao.
- Criado `front/src/app/services/moderacaoService.ts` para centralizar:
  - resumo do painel de moderacao;
  - listagem de sinalizacoes de denuncia;
  - marcacao de sinalizacao como analisada;
  - arquivamento de denuncia;
  - remocao de comentario;
  - advertencia, suspensao e reativacao de usuario;
  - historico de moderacao por usuario.
- Reescrita `front/src/app/pages/moderador/ModeradorPage.tsx` para usar dados reais.
- Mantida a tela simples:
  - cards de resumo;
  - lista de sinalizacoes pendentes;
  - acoes por sinalizacao;
  - moderacao de usuario por ID;
  - remocao de comentario por ID.

## Regras respeitadas

- Moderador comum so deve moderar usuarios `MORADOR`; essa regra e reforcada pelo backend.
- A tela nao simula busca de usuario por nome, porque o backend atual nao oferece listagem/busca de usuarios para `MODERADOR`.
- Sinalizacao arquivada por moderacao tambem e marcada como analisada no fluxo da tela.
- O link de detalhes usa a rota real `/moderador/relato/{id}`.

## Pendencias conscientes

- Busca textual de usuario para moderador depende de endpoint novo no backend. Por enquanto, a acao usa ID exato do usuario.
- Remocao de comentario tambem usa ID exato, pois as sinalizacoes atuais sao de denuncia, nao de comentario.
- O build do front gerou apenas o aviso de chunk grande do Vite, sem erro de compilacao.

## Validacao

- `npm.cmd run build` executado com sucesso em `front/`.
