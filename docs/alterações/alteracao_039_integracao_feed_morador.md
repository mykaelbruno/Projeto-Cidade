# Alteracao 039 - Integracao do Feed do Morador

Data: 2026-06-02

## Objetivo

Conectar a tela inicial do morador ao feed real do backend, substituindo o uso direto de `mockReports` na `HomePage` por chamadas ao contrato oficial da API.

## O que foi alterado

- Criado `front/src/app/types/api.ts` com o tipo generico `PageResponse<T>` para respostas paginadas do Spring.
- Criado `front/src/app/types/denuncia.ts` com os DTOs principais de denuncia, feed e interacao.
- Criado `front/src/app/services/feedService.ts` para `GET /api/feed/denuncias`.
- Criado `front/src/app/services/interacaoDenunciaService.ts` para apoio e urgencia reversiveis.
- Criado `front/src/app/mappers/denunciaMapper.ts` para converter `FeedDenunciaResponseDTO` em `ReportCard.Report`.
- Atualizada `HomePage` para:
  - carregar o feed real com paginacao;
  - usar `modo=MISTO` por padrao;
  - usar `modo=EM_ALTA` e `modo=RECENTES` nas abas correspondentes;
  - mostrar resolvidos com `status=CONCLUIDO`;
  - enviar `cidade` do usuario logado quando disponivel;
  - tratar loading, erro, vazio e tentativa novamente;
  - chamar backend ao apoiar/remover apoio;
  - chamar backend ao marcar/remover urgencia.
- Atualizado `ReportCard` para:
  - exibir estado visual de apoio ja feito;
  - adicionar botao de urgencia;
  - exibir motivo de ordenacao quando o feed retornar essa informacao;
  - corrigir labels quebrados de status/categorias tocados pelo card.

## Regras respeitadas

- O feed padrao ficou misto, sem enviesar totalmente por cronologia nem por engajamento.
- Denuncias concluidas continuam visiveis, mas a regra final de negocio permanece pendente para estudo futuro.
- A tela nao busca anexos/foto de capa em cada card, para evitar N+1 e preservar performance.
- Nenhum endpoint, DTO ou regra de negocio do backend foi alterado nesta etapa.

## Pendencias conscientes

- A busca textual do modal ainda e local sobre a pagina carregada, porque o backend nao possui filtro de texto livre no feed.
- O filtro de categoria ainda e local por nome, porque o backend filtra por `categoriaId` e a tela ainda nao carrega categorias reais.
- O mapa, minhas denuncias e detalhe ainda usam mocks em outras telas e devem ser integrados nas proximas etapas.
- Foto de capa no card continua pendente de decisao tecnica: endpoint/campo otimizado no backend ou carregamento lazy controlado.

## Validacao

- Executado `npm.cmd run build` em `front/`.
- Resultado: build concluido com sucesso.
- Observacao: o Vite manteve apenas o aviso de chunk JavaScript acima de 500 kB, ja existente/esperado neste prototipo.
