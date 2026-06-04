# Alteracao 040 - Integracao do Detalhe da Denuncia

Data: 2026-06-02

## Objetivo

Substituir o detalhe mockado de relato por uma tela conectada aos endpoints reais do backend, aproveitando a navegacao ja integrada do feed.

## O que foi alterado

- Criados tipos adicionais em `front/src/app/types/denuncia.ts`:
  - `ComentarioResponseDTO`;
  - `AnexoDenunciaResponseDTO`;
  - `TimelineDenunciaResponseDTO`;
  - `MotivoSinalizacaoDenuncia`;
  - `SinalizacaoDenunciaRequestDTO`.
- Criado `front/src/app/services/denunciaService.ts` com chamadas para:
  - `GET /api/denuncias/{id}`;
  - `GET /api/denuncias/{id}/anexos`;
  - `GET /api/denuncias/{id}/comentarios`;
  - `POST /api/denuncias/{id}/comentarios`;
  - `GET /api/denuncias/{id}/timeline`;
  - `POST /api/denuncias/{id}/sinalizacoes`;
  - `POST /api/denuncias/{id}/conclusao/confirmacao`;
  - `POST /api/denuncias/{id}/conclusao/contestacao`.
- Atualizado `front/src/app/services/interacaoDenunciaService.ts` para buscar `GET /api/denuncias/{id}/interacoes/status`.
- Atualizado `front/src/app/services/apiClient.ts` com `getApiUrl`, usado para montar URLs protegidas de anexos.
- Reescrita `ReportDetailPage` para:
  - carregar denuncia real;
  - exibir anexos/imagens reais apenas no detalhe;
  - listar comentarios reais;
  - enviar comentario de morador;
  - listar timeline real;
  - carregar e alternar apoio/urgencia;
  - sinalizar relato para moderacao com motivo fixo e comentario;
  - confirmar ou contestar conclusao quando a denuncia estiver concluida e for do morador logado.
- Removido `front/src/app/components/ReportDetail.tsx`, que era um componente antigo, mockado e sem uso depois da integracao.
- Removido `front/src/app/components/DenunciaDetailModal.tsx`, que ainda usava `mockDenuncia` fixo e fazia relatos diferentes parecerem ter os mesmos comentarios/dados.
- Criadas rotas de detalhe real tambem para:
  - `/prefeitura/relato/:id`;
  - `/moderador/relato/:id`;
  - `/admin-app/relato/:id`.
- Ajustados botoes de prefeitura, moderador e admin app para abrirem a `ReportDetailPage` real, em vez de modal mockado ou rota de morador.

## Regras respeitadas

- Nao foi feita busca de anexos no feed, apenas no detalhe, para preservar performance.
- A confirmacao final continua sendo responsabilidade do morador autor.
- A sinalizacao usa o contrato atual do backend: `motivo` enum + `comentario`.
- Nenhum endpoint ou regra de negocio do backend foi alterado nesta etapa.

## Pendencias conscientes

- A tela de detalhe para secretaria/prefeitura ainda nao executa acoes operacionais como atualizar status, resposta oficial ou transferencia; isso deve entrar na etapa dos paineis operacionais.
- Telas de moderacao e administracao ainda possuem listas mockadas, mas ao abrir o detalhe da denuncia agora a navegacao vai para a pagina real por `id`.
- O mapa do detalhe ainda exibe apenas dados textuais e coordenadas quando disponiveis. A integracao visual do mapa real fica para a etapa de mapa.
- Upload de anexos na criacao de denuncia ainda nao foi integrado.
- As imagens protegidas dependem do envio de cookie pelo navegador ao carregar a URL do anexo.

## Validacao

- Executado `npm.cmd run build` em `front/`.
- Resultado: build concluido com sucesso.
- Observacao: o Vite manteve apenas o aviso de chunk JavaScript acima de 500 kB.
