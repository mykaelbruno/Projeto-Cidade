# Alteracao 069 - Refinos de QA nos fluxos do morador

Data: 2026-06-08

## Objetivo

Aplicar os ajustes levantados no QA manual das telas do morador, priorizando fluxo de criacao de relato, detalhe do relato, perfil, notificacoes e pagina "Ver no mapa".

## O que foi ajustado

### 1. Criacao de relato

- o passo de localizacao deixou de usar placeholder e passou a usar mapa funcional com `ReportLocationMap`;
- a cidade ficou fixa na cidade da conta do usuario;
- o campo "Rua" foi renomeado visualmente para "Endereco";
- digitacao manual de endereco agora tenta geocodificar e posicionar o relato no mapa;
- o botao de localizacao atual agora captura coordenadas, tenta preencher endereco/bairro e atualiza o mapa;
- no desktop, o passo de localizacao ficou em duas colunas: mapa na esquerda e campos na direita;
- no desktop, o passo de detalhes tambem virou duas colunas: fotos/upload na esquerda e campos na direita;
- a etapa de revisao passou a exibir mapa e previews reais das imagens selecionadas;
- ao finalizar o envio, o usuario volta para o feed e recebe um modal de confirmacao com atalho para abrir o relato criado.

### 2. Pagina de relato

- as imagens anexadas agora podem ser navegadas em formato de carrossel simples, com setas, bolinhas e miniaturas;
- o campo de comentario ganhou borda/realce mais claro;
- a base existente de comentarios do proprio morador foi preservada e continua disponivel;
- o destaque visual de comentario oficial foi mantido.

### 3. Notificacoes

- criado um mecanismo simples de contagem real de notificacoes nao lidas;
- o ponto vermelho do sino agora aparece apenas quando existem notificacoes nao lidas;
- o estado vazio do drawer/lista de notificacoes foi melhorado visualmente;
- os fluxos que marcam notificacoes como lidas agora disparam atualizacao do contador.

### 4. Perfil do morador

- a pagina deixou de usar dados mockados e passou a usar sessao real + denuncias reais do usuario;
- a secao de conquistas foi removida;
- os blocos inferiores foram simplificados para manter apenas a acao de sair;
- foi adicionada uma secao de ultimos relatos em formato de mini carrossel com atalho para "Meus relatos";
- a acao "Editar perfil" foi deixada visivel como placeholder de UX para implementacao posterior.

### 5. Mapa da cidade

- os pins voltaram a ser clicaveis;
- o card do relato no mapa permanece associado ao pin mesmo durante movimento/zoom, em vez de desaparecer;
- o popup passou a se comportar como card flutuante do proprio pin.

## Arquivos principais

- `front/src/app/components/NewReportFlow.tsx`
- `front/src/app/pages/NewReportPage.tsx`
- `front/src/app/pages/HomePage.tsx`
- `front/src/app/pages/ReportDetailPage.tsx`
- `front/src/app/pages/MapPage.tsx`
- `front/src/app/components/Profile.tsx`
- `front/src/app/components/MyReports.tsx`
- `front/src/app/components/NotificationsDrawer.tsx`
- `front/src/app/components/NotificationsList.tsx`
- `front/src/app/components/NotificationBellButton.tsx`
- `front/src/app/hooks/useUnreadNotificationsCount.ts`
- `front/src/app/services/geocodingService.ts`

## Validacao

- `npm.cmd run build` passou com sucesso apos as alteracoes.

## Pendencias conscientes

- validar no navegador a qualidade da geocodificacao com enderecos reais da cidade;
- implementar futuramente a tela/fluxo de "Editar perfil";
- se o uso do mapa de criacao pedir mais precisao no futuro, avaliar clique direto no mapa alem da geocodificacao por endereco.
