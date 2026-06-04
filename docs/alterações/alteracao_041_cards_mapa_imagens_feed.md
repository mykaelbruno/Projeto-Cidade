# Alteracao 041 - Cards, Imagens no Feed e Mapa do Relato

Data: 2026-06-02

## Objetivo

Melhorar a experiencia visual e funcional do feed e da pagina interna do relato, corrigindo cards quebrados, ativando denuncia pelo card, exibindo fotos e adicionando mapa quando houver coordenadas.

## O que foi alterado

- Atualizado `ReportCard` para:
  - exibir a foto do relato quando disponivel;
  - exibir um mockup visual quando o relato nao possui foto;
  - manter o botao de denuncia isolado no canto do card;
  - transformar apoio e urgencia em botoes compactos com contador e estado ativo/inativo;
  - remover a duplicacao visual em que apoio aparecia como contador e tambem como botao separado;
  - melhorar truncamento de local e estabilidade do layout do card.
- Atualizada `HomePage` para:
  - buscar anexos dos relatos carregados no feed e usar a primeira imagem como foto do card;
  - abrir modal funcional de denuncia/sinalizacao pelo card;
  - enviar `motivo` e `comentario` para `POST /api/denuncias/{id}/sinalizacoes`.
- Criado `ReportLocationMap` para a pagina interna do relato:
  - exibe mapa embutido do OpenStreetMap quando `latitude` e `longitude` existem;
  - mostra fallback por endereco quando nao ha coordenadas;
  - nao exibe coordenadas em texto para o usuario.
- Atualizada `ReportDetailPage` para:
  - usar o mapa interno em uma faixa horizontal entre o bloco principal do relato e as secoes de acompanhamento/comentarios;
  - reposicionar o mapa para a coluna direita, logo abaixo do botao `Sinalizar relato`, ocupando o espaco livre do layout antes das secoes inferiores;
  - melhorar a diagramacao geral da pagina de detalhe, com imagem em proporcao mais estavel, coluna esquerda fixa em desktop, localizacao compacta, metadados em blocos, acoes agrupadas e cards inferiores com espacamento mais consistente;
  - destacar comentarios oficiais com outline, fundo suave e selo oficial;
  - exibir organizacoes oficiais no formato `Nome da Secretaria - Cidade`;
  - remover exibicao textual das coordenadas;
  - manter nomes reais de usuario nos pontos conectados ao backend.
- Ajustadas telas mockadas de moderacao para evitar exibir `@username` como nome principal.

## Pendencias conscientes

- O feed agora busca anexos por relato da pagina atual. Isso atende ao pedido visual, mas ainda nao e a melhor solucao de performance.
- A solucao ideal futura e o backend retornar uma `fotoCapaUrl`/thumbnail no proprio `FeedDenunciaResponseDTO`, evitando chamadas extras por card.
- Listas de moderacao/admin ainda possuem dados mockados; o detalhe aberto por elas ja usa pagina real por `id`.

## Validacao

- Executado `npm.cmd run build` em `front/` apos a implementacao inicial, apos o reposicionamento do mapa e apos o refinamento de diagramacao.
- Resultado: build concluido com sucesso.
- Observacao: permaneceu apenas o aviso do Vite sobre chunk JavaScript acima de 500 kB.
