# Alteracao 043 - Integracao do Mapa com Dados Reais

Data: 2026-06-02

## Objetivo

Substituir o uso de `mockReports` no `MapPage` por relatos reais do backend, removendo o ultimo ponto forte do fluxo do morador que ainda podia passar sensacao de dados repetidos ou falsos.

## O que foi alterado

- Atualizado `MapPage` para:
  - carregar relatos reais com `GET /api/feed/denuncias`;
  - respeitar a cidade do usuario logado quando disponivel;
  - usar apenas relatos com `latitude` e `longitude` para exibicao no mapa;
  - calcular os pinos a partir das coordenadas reais;
  - renderizar tiles do `OpenStreetMap` no proprio React, usando limites calculados pelos relatos carregados;
  - sincronizar os pinos com pan e zoom do mapa, evitando pinos travados ao mover a visualizacao;
  - corrigir os controles de zoom para nao serem interceptados pelo handler de arraste do mapa;
  - adicionar zoom por scroll do mouse, alem dos botoes `+` e `-`;
  - exibir card de detalhe do pino com dados reais do relato;
  - navegar para `/relato/{id}` ao abrir detalhes completos;
  - mostrar loading, erro, retry e estado vazio;
  - calcular estatisticas e filtros de categoria a partir dos dados reais.
- Mantida a busca de primeira imagem dos anexos para enriquecer o card do pino quando houver foto.
- Removido `front/src/app/data/mockReports.ts`, pois ele nao era mais importado.

## Regras importantes

- Relatos sem `latitude` e `longitude` nao sao posicionados artificialmente.
- A tela informa quantos relatos carregados ficaram fora do mapa por falta de coordenadas.
- Os filtros de categoria so consideram categorias de relatos geolocalizados.

## Pendencias conscientes

- A busca de imagem ainda faz chamadas por relato carregado, como no feed e em `Minhas Denuncias`. A melhoria ideal futura e o backend retornar uma foto de capa/thumbnail no DTO de listagem.
- A pasta `front/src/app/data` ficou vazia, mas a remocao pelo terminal falhou por permissao do Windows/OneDrive. Nao ha arquivo mock restante dentro dela.
- O mapa foi implementado sem biblioteca dedicada, com tiles do OpenStreetMap e conversao Web Mercator no front. Para recursos mais avancados, uma biblioteca como Leaflet/MapLibre pode ser avaliada futuramente.

## Validacao

- Executado `npm.cmd run build` em `front/`.
- Resultado: build concluido com sucesso.
- Observacao: permaneceu apenas o aviso do Vite sobre chunk JavaScript acima de 500 kB.
