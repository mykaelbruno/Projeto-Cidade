Crie um protótipo completo, moderno e responsivo para uma plataforma chamada **Conecta Cidadão**.

Slogan da marca:
**Você informa. A prefeitura resolve.**

O sistema é uma plataforma de zeladoria urbana, participação cidadã e gestão pública colaborativa. A ideia principal é conectar moradores à prefeitura de forma simples, transparente e eficiente. O app não deve parecer uma ferramenta de protesto, revolta ou denúncia agressiva. Ele deve transmitir colaboração, cuidado com a cidade, escuta ativa, confiança pública e resolução de problemas.

A pergunta central do produto é:
**Como a prefeitura pode resolver algo que ainda não conhece?**

O sistema permite que moradores informem problemas urbanos, como buracos em ruas, iluminação pública apagada, lixo acumulado, vazamentos, entulho, focos de dengue, problemas de saneamento, mobilidade urbana, saúde pública, meio ambiente e outros problemas da cidade.

A prefeitura recebe esses relatos, organiza por secretaria responsável, acompanha o andamento, responde oficialmente, muda o status e resolve. Os moradores podem apoiar relatos de outros cidadãos, marcar urgência, comentar e acompanhar a resolução.

---

# 1. Identidade visual da marca

Nome:
**Conecta Cidadão**

Slogan:
**Você informa. A prefeitura resolve.**

Conceito da logo:
Usar como base uma logo com ícone de aperto de mãos formando um símbolo de colaboração, conexão e confiança. O ícone deve misturar tons de verde e azul, representando:
- Verde: cidade, cuidado, solução, esperança, zeladoria
- Azul: confiança, governo, tecnologia, segurança institucional

A logo deve parecer:
- Moderna
- Humana
- Institucional sem ser burocrática
- Confiável
- Amigável
- Simples de reconhecer em app mobile

Evitar:
- Visual agressivo
- Símbolos de protesto
- Megafone
- Punho fechado
- Cores muito vermelhas como principal
- Aparência policialesca
- Aparência excessivamente governamental antiga

Estilo desejado:
**Civic Modern**
Visual limpo, moderno, profissional e acolhedor. Deve equilibrar seriedade institucional com sensação de comunidade ativa.

Referências conceituais:
- GovTech moderna
- Civic Tech
- Aplicativos públicos bem desenhados
- Waze pela colaboração comunitária
- Notion pela organização visual
- Gov.br pela confiança institucional
- Duolingo pela clareza e microinterações leves
- LinkedIn pelo feed profissional e organizado

---

# 2. Direção visual geral

Criar uma interface **mobile first**, mas também gerar telas web responsivas.

O design deve priorizar:
- Clareza
- Acessibilidade
- Rapidez para registrar um relato
- Visual escaneável
- Cards objetivos
- Estados de andamento bem visíveis
- Botões grandes e fáceis de tocar
- Boa hierarquia visual
- Layout limpo e arejado
- Sensação de cidade viva
- Confiança e transparência

Paleta sugerida:
- Verde principal: #087F5B ou #0F8A5F
- Verde escuro: #064E3B
- Verde claro: #DFF7EA
- Azul institucional: #0F4C81 ou #155EEF
- Azul escuro/navy: #0B1F33
- Fundo claro: #F7FAFC
- Branco: #FFFFFF
- Cinza texto: #475569
- Cinza borda: #E2E8F0
- Amarelo urgência: #F59E0B
- Vermelho apenas para alertas críticos: #DC2626
- Roxo opcional para comentários ou interação: #7C3AED

Tipografia:
Usar uma fonte moderna, limpa e de alta legibilidade.
Sugestões:
- Inter
- Manrope
- Plus Jakarta Sans
- Sora

Estilo dos componentes:
- Cards com bordas arredondadas entre 16px e 24px
- Sombras suaves
- Espaçamentos generosos
- Ícones lineares modernos
- Botões com estados visuais claros
- Tags coloridas por categoria
- Microinterações suaves
- Estados vazios bem explicativos
- Layout com grid responsivo

---

# 3. Estrutura do produto

O produto deve ter dois grandes ambientes:

## A) Portal do Morador

Usado pelo cidadão comum para:
- Ver relatos da cidade
- Criar novo relato
- Apoiar problemas já existentes
- Marcar urgência
- Comentar
- Acompanhar status
- Receber notificações
- Confirmar se a prefeitura realmente resolveu o problema
- Contestar uma resolução mal feita

## B) Painel da Prefeitura / Secretarias

Usado pela prefeitura para:
- Receber relatos
- Encaminhar para secretaria correta
- Alterar status
- Responder oficialmente
- Solicitar transferência entre secretarias
- Acompanhar indicadores
- Ver mapas e regiões com mais problemas
- Exportar relatórios
- Moderar conteúdos inadequados

---

# 4. Perfis de usuário

Criar a experiência considerando estes papéis:

## Morador
Usuário cidadão. Pode:
- Criar relato público ou anônimo
- Anexar fotos
- Marcar localização no mapa
- Apoiar relatos
- Marcar urgência
- Comentar
- Acompanhar status
- Confirmar resolução
- Contestar resolução

## Atendente de Secretaria
Servidor que atua em uma secretaria específica. Pode:
- Ver relatos atribuídos à secretaria
- Responder oficialmente
- Atualizar status básico
- Acompanhar fila de trabalho

## Administrador de Secretaria
Gestor da secretaria. Pode:
- Gerenciar equipe
- Analisar métricas da secretaria
- Solicitar transferência de relato para outra secretaria
- Responder e atualizar status

## Administrador da Prefeitura
Gestor central. Pode:
- Ver todas as secretarias
- Mediar transferências
- Reatribuir relatos
- Gerenciar categorias
- Moderar conteúdos
- Ver dashboards gerais

## Moderador
Pode:
- Avaliar denúncias de abuso
- Remover comentários ofensivos
- Arquivar relatos falsos com justificativa

## Administrador do Sistema
Super admin SaaS. Pode:
- Gerenciar múltiplas prefeituras
- Ver logs globais
- Controlar configurações da plataforma

---

# 5. Estrutura mobile first

Criar primeiro as telas mobile, depois adaptar para web.

## Navegação mobile

Usar bottom navigation com 5 itens:

1. **Feed**
   Ícone de casa ou comunidade

2. **Mapa**
   Ícone de mapa/pin

3. **Nova**
   Botão central destacado com “+”

4. **Minhas**
   Ícone de lista/documento

5. **Perfil**
   Ícone de usuário

No topo do mobile:
- Logo Conecta Cidadão
- Ícone de menu lateral
- Sino de notificações
- Avatar pequeno ou inicial do usuário

O botão “Nova denúncia” ou “Novo relato” deve ser extremamente destacado.

Preferir o termo **relato** no lugar de denúncia quando o objetivo for mais colaborativo.
Usar:
- “Novo relato”
- “Informar problema”
- “Registrar ocorrência”
- “Acompanhar relato”

Evitar deixar tudo como “denúncia”, pois pode soar agressivo.

---

# 6. Tela inicial do morador — Mobile

Criar uma tela inicial altamente clara e bonita.

Conteúdo:

## Header
- Logo Conecta Cidadão
- Notificações
- Menu

## Hero principal
Texto:
**Vamos cuidar da cidade juntos**

Subtexto:
**Informe problemas urbanos, acompanhe as soluções e ajude a prefeitura a agir onde mais precisa.**

CTA principal:
**+ Novo relato**

CTA secundário:
**Ver no mapa**

## Busca
Campo:
**Buscar por rua, bairro ou problema...**

## Filtros rápidos
Chips horizontais:
- Todos
- Buracos
- Iluminação
- Limpeza
- Saúde
- Água e esgoto
- Meio ambiente
- Mobilidade
- Dengue
- Outros

## Abas de ordenação
- Em alta
- Recentes
- Perto de mim
- Urgentes
- Resolvidos

## Cards de relato
Cada card deve exibir:
- Foto principal do problema
- Categoria
- Status
- Título
- Descrição curta
- Bairro / rua
- Tempo desde publicação
- Número de apoios
- Número de urgências
- Número de comentários
- Avatares pequenos de apoiadores
- Botão “Apoiar”
- Botão “Urgente”
- Link “Ver detalhes”

Exemplo de card:
Categoria: Mobilidade
Status: Em análise
Título: Buraco grande na Rua das Flores
Descrição: Buraco está dificultando a passagem de carros e motos, com risco de acidente.
Local: Rua das Flores, Centro
Apoios: 342
Urgências: 15
Comentários: 27

O card deve ter visual moderno, leve e social.

---

# 7. Tela inicial do morador — Web

Criar versão web responsiva baseada na mesma identidade.

Layout recomendado:
- Sidebar esquerda fixa em desktop
- Topbar com busca global, localização, notificações e perfil
- Conteúdo central com hero e feed
- Área lateral opcional com ranking, status da cidade ou mapa compacto

Sidebar:
- Logo Conecta Cidadão
- Feed
- Mapa
- Novo relato
- Minhas solicitações
- Notificações
- Ranking cidadão
- Como funciona
- Configurações

Topbar:
- Campo de busca
- Cidade selecionada
- Sino de notificações
- Avatar do usuário

Hero:
**Vamos cuidar da cidade juntos**
Subtexto:
**Sua informação ajuda a prefeitura a resolver problemas mais rápido.**

Botões:
- Novo relato
- Abrir mapa
- Ver relatos urgentes

Área de categorias:
Cards/chips:
- Mobilidade
- Iluminação
- Limpeza urbana
- Saúde
- Saneamento
- Meio ambiente
- Educação
- Outros

Feed:
Grid de cards em 3 colunas no desktop.
Lista compacta no tablet.
Lista vertical no mobile.

---

# 8. Fluxo de criação de novo relato — Mobile first

Criar um fluxo em etapas simples, com indicador de progresso.

O objetivo é permitir que o morador registre um problema em menos de 30 segundos.

## Etapa 1 — Qual o problema?
Título:
**O que você quer informar?**

Categorias em cards com ícones:
- Buraco na rua
- Luz apagada
- Lixo acumulado
- Entulho
- Vazamento de água
- Esgoto
- Foco de dengue
- Calçada danificada
- Sinalização
- Transporte
- Saúde pública
- Outro

Botão:
**Continuar**

## Etapa 2 — Onde está acontecendo?
Título:
**Onde está o problema?**

Elementos:
- Mapa interativo
- Pin arrastável
- Botão “Usar minha localização”
- Campo de rua
- Campo de bairro
- Cidade/UF preenchida automaticamente
- Campo complemento opcional

Botão:
**Confirmar localização**

## Etapa 3 — Conte mais detalhes
Campos:
- Título do relato
- Descrição
- Grau de urgência:
  - Baixa
  - Média
  - Alta
  - Risco imediato
- Switch:
  **Publicar como anônimo**
- Upload de fotos
- Dica: “Fotos ajudam a prefeitura a entender melhor o problema.”

Botão:
**Revisar relato**

## Etapa 4 — Revisão
Mostrar resumo:
- Categoria
- Localização
- Título
- Descrição
- Fotos
- Anônimo ou identificado

Botão principal:
**Enviar relato**

## Etapa 5 — Sucesso
Tela bonita com ilustração/ícone:
**Relato enviado com sucesso!**

Subtexto:
**Sua informação foi registrada e será analisada pela prefeitura. Você poderá acompanhar cada etapa por aqui.**

Botões:
- Acompanhar relato
- Voltar ao feed

---

# 9. Tela de detalhes do relato

Criar tela detalhada para mobile e web.

Conteúdo principal:
- Foto grande do problema
- Galeria de fotos
- Título
- Categoria
- Status atual
- Código do relato
- Localização
- Mapa compacto
- Descrição completa
- Autor, podendo mostrar “Morador anônimo”
- Data de criação
- Apoios
- Urgências
- Comentários
- Botões:
  - Apoiar
  - Marcar como urgente
  - Comentar
  - Compartilhar

## Status visuais
Criar uma timeline horizontal ou vertical com os estados:

1. Aberto
2. Em análise
3. Encaminhado
4. Em andamento
5. Programado
6. Concluído
7. Concluído e confirmado

Também considerar:
- Reaberto
- Arquivado

Cada status deve ter:
- Ícone
- Data/hora
- Responsável
- Descrição curta
- Resposta oficial, quando existir

Exemplo:
Status atual: **Em andamento**
Resposta oficial:
**Secretaria de Infraestrutura:** “Equipe técnica foi acionada e o reparo está previsto para sexta-feira.”

---

# 10. Confirmação ou contestação da resolução

Quando o status for “Concluído”, o morador que criou o relato deve ver uma área destacada:

Título:
**A prefeitura informou que o problema foi resolvido.**

Texto:
**Você confirma que a situação foi solucionada?**

Botões:
- **Sim, foi resolvido**
- **Ainda não foi resolvido**

Se clicar em “Sim”:
Abrir modal com feedback opcional:
- Avaliação de 1 a 5
- Comentário
- Botão “Confirmar resolução”

Se clicar em “Ainda não foi resolvido”:
Abrir modal:
- Campo obrigatório: “Explique o que ainda está errado”
- Upload opcional de nova foto
- Botão “Contestar e reabrir relato”

Após contestar:
Status muda para:
**Reaberto**

Mostrar mensagem:
**Obrigado pelo retorno. O relato voltou para análise da secretaria responsável.**

---

# 11. Minhas solicitações / Meus relatos

Criar tela onde o morador acompanha seus relatos.

Filtros:
- Todos
- Abertos
- Em andamento
- Aguardando minha confirmação
- Resolvidos
- Reabertos
- Arquivados

Cards devem mostrar:
- Título
- Categoria
- Status
- Local
- Última atualização
- Próxima ação esperada
- Botão “Ver detalhes”

Dar destaque para relatos que exigem ação do morador:
Exemplo:
**Aguardando sua confirmação**

---

# 12. Notificações

Criar tela de notificações.

Tipos:
- Prefeitura respondeu seu relato
- Status alterado
- Seu relato recebeu novos apoios
- Seu relato foi marcado como urgente por outros moradores
- Solicitação concluída, confirme se foi resolvida
- Comentário novo
- Relato reaberto
- Relato arquivado com justificativa

Cada notificação deve ter:
- Ícone
- Título
- Descrição
- Tempo
- Estado lida/não lida
- Link para o relato

---

# 13. Ranking cidadão / Engajamento

Criar uma tela de ranking leve e positiva.

Não deve parecer competição agressiva.
Deve estimular participação cívica saudável.

Elementos:
- Pontos de colaboração
- Selos:
  - Morador Ativo
  - Olho na Rua
  - Colaborador do Bairro
  - Guardião da Cidade
  - Cidadão Parceiro
- Ranking por bairro
- Quantidade de relatos criados
- Apoios dados
- Problemas resolvidos com ajuda do cidadão

Texto:
**Sua participação ajuda a cidade a melhorar.**

---

# 14. Mapa da cidade

Criar tela de mapa para mobile e web.

Elementos:
- Mapa com pins coloridos por categoria
- Clusters de problemas
- Filtros por categoria
- Filtros por status
- Filtro “Perto de mim”
- Filtro “Urgentes”
- Ao clicar no pin, abrir card resumido
- Botão para criar relato naquele ponto

Cores dos pins:
- Mobilidade/Buracos: verde ou azul
- Iluminação: amarelo
- Limpeza: azul claro
- Saúde/Dengue: vermelho moderado
- Água/Esgoto: ciano
- Meio ambiente: verde claro
- Urgente: borda laranja/vermelha

---

# 15. Painel da Prefeitura — Web

Criar um painel administrativo profissional para prefeitura e secretarias.

Visual:
- Mais institucional
- Mais denso em dados
- Ainda moderno e limpo
- Sidebar escura ou clara elegante
- Cards de KPI
- Tabelas bem organizadas
- Mapa e gráficos

## Dashboard principal
Cards de indicadores:
- Total de relatos
- Relatos abertos
- Em análise
- Em andamento
- Programados
- Concluídos
- Concluídos confirmados
- Reabertos
- Tempo médio de resposta
- Taxa de confirmação pelo cidadão
- Taxa de reabertura
- Categoria mais demandada
- Bairro com mais relatos

## Fila operacional
Tabela/lista com:
- Código
- Título
- Categoria
- Bairro
- Secretaria responsável
- Status
- Prioridade
- Apoios
- Urgências
- Data de abertura
- SLA
- Ações

Ações:
- Ver detalhes
- Responder oficialmente
- Alterar status
- Encaminhar
- Solicitar transferência
- Arquivar com justificativa

## Tela de detalhe operacional
Mostrar:
- Dados do relato
- Fotos
- Localização no mapa
- Dados do morador, respeitando anonimato público
- Histórico completo
- Timeline imutável
- Comentários públicos
- Respostas oficiais
- Campo para atualização de status
- Campo obrigatório de justificativa
- Secretaria atual
- Possibilidade de solicitar transferência

## Solicitação de transferência
Modal:
- Secretaria de destino sugerida
- Justificativa obrigatória
- Botão “Solicitar transferência”

Para admin da prefeitura:
Tela de mediação:
- Aprovar transferência
- Recusar transferência
- Reatribuir para outra secretaria
- Justificativa da decisão

---

# 16. Moderação

Criar telas para moderação.

Elementos:
- Lista de conteúdos denunciados
- Tipo: relato ou comentário
- Motivo da denúncia
- Usuário reportado
- Histórico
- Ações:
  - Manter conteúdo
  - Remover conteúdo
  - Arquivar relato falso
  - Aplicar advertência
- Campo obrigatório de justificativa

Visual deve ser cuidadoso e institucional.

---

# 17. Analytics / BI

Criar tela de relatórios e inteligência de dados.

Gráficos:
- Relatos por categoria
- Relatos por bairro
- Evolução de relatos por mês
- Tempo médio de solução
- Taxa de confirmação
- Taxa de reabertura
- Secretarias com mais demandas
- Heatmap no mapa
- Ranking de problemas mais apoiados
- Relatos urgentes por região

Botões:
- Exportar CSV
- Gerar relatório
- Filtrar por período
- Filtrar por secretaria
- Filtrar por bairro

---

# 18. Estados do ciclo de vida do relato

Usar estes status no design:

- Aberto
- Em análise
- Encaminhado
- Em andamento
- Programado
- Concluído
- Aguardando confirmação do morador
- Concluído e confirmado
- Reaberto
- Arquivado

Criar uma linguagem visual para status:
- Aberto: cinza/azul claro
- Em análise: azul
- Encaminhado: roxo
- Em andamento: amarelo/laranja
- Programado: azul escuro
- Concluído: verde
- Aguardando confirmação: laranja
- Concluído confirmado: verde forte
- Reaberto: vermelho/laranja
- Arquivado: cinza

---

# 19. UX writing

Usar linguagem simples, humana e colaborativa.

Evitar termos agressivos:
- “Denunciar”
- “Reclamar”
- “Exigir”
- “Acusar”

Preferir:
- “Informar”
- “Relatar”
- “Registrar”
- “Acompanhar”
- “Apoiar”
- “Sinalizar urgência”
- “Ajudar a resolver”
- “Sua informação ajuda a cidade”

Exemplos de textos:

Hero:
**Vamos cuidar da cidade juntos**
**Informe problemas urbanos e acompanhe as soluções da prefeitura em tempo real.**

Botão:
**+ Novo relato**

Card vazio:
**Nenhum relato encontrado**
**Quando um morador informar um problema nesta região, ele aparecerá aqui.**

Sucesso:
**Relato enviado com sucesso**
**Sua informação já foi registrada. Agora a prefeitura poderá analisar e agir.**

Confirmação:
**O problema foi resolvido?**
**Sua confirmação ajuda a garantir que a solução foi concluída de verdade.**

Contestação:
**Conte o que ainda precisa ser corrigido**
**Seu retorno ajuda a prefeitura a melhorar a qualidade do serviço.**

---

# 20. Componentes principais a criar

Criar um design system com:

## Botões
- Primário
- Secundário
- Outline
- Ghost
- Perigo
- Sucesso
- Botão flutuante de nova ação

## Inputs
- Campo de busca
- Campo de texto
- Textarea
- Select
- Autocomplete
- Upload de imagem
- Switch
- Checkbox
- Radio cards

## Cards
- Card de relato
- Card compacto de relato
- Card de KPI
- Card de categoria
- Card de notificação
- Card de status
- Card de ranking

## Tags
- Categoria
- Status
- Urgência
- Em alta
- Resolvido
- Reaberto
- Anônimo

## Navegação
- Sidebar web
- Topbar web
- Bottom navigation mobile
- Menu mobile
- Breadcrumbs no painel administrativo

## Feedback
- Toasts
- Modais
- Skeleton loading
- Empty states
- Error states
- Success states

---

# 21. Responsividade

O design deve ser mobile first.

## Mobile
- Lista vertical
- Bottom navigation
- CTA grande e fixo quando necessário
- Fluxo de novo relato em tela cheia
- Cards compactos
- Filtros horizontais com scroll
- Menus simples

## Tablet
- Cards em 2 colunas
- Sidebar recolhível
- Mapa e lista lado a lado quando possível

## Desktop
- Sidebar fixa
- Grid de cards
- Topbar com busca
- Área lateral opcional
- Painel administrativo completo
- Tabelas e gráficos

---

# 22. Acessibilidade

Garantir:
- Bom contraste
- Fonte mínima 14px
- Botões com altura mínima de 44px no mobile
- Estados de foco visíveis
- Não depender apenas de cor para indicar status
- Ícones acompanhados de texto quando necessário
- Linguagem simples
- Feedback claro após ações

---

# 23. Telas que o protótipo deve conter

Criar pelo menos estas telas:

## Morador — Mobile
1. Splash / Login simples
2. Feed inicial
3. Busca e filtros
4. Mapa
5. Novo relato — etapa 1 categoria
6. Novo relato — etapa 2 localização
7. Novo relato — etapa 3 detalhes e fotos
8. Novo relato — etapa 4 revisão
9. Novo relato — sucesso
10. Detalhes do relato
11. Timeline do relato
12. Comentários
13. Minhas solicitações
14. Confirmação de resolução
15. Contestação de resolução
16. Notificações
17. Perfil
18. Ranking cidadão

## Morador — Web
1. Feed web
2. Mapa web
3. Detalhes do relato
4. Novo relato web
5. Minhas solicitações
6. Notificações
7. Perfil

## Prefeitura / Secretaria — Web
1. Dashboard geral
2. Fila operacional
3. Detalhe operacional do relato
4. Atualizar status
5. Resposta oficial
6. Solicitar transferência
7. Mediação de transferência
8. Moderação
9. Analytics / BI
10. Gestão de categorias
11. Gestão de secretarias
12. Gestão de usuários

---

# 24. Exemplos de dados fictícios

Cidade:
Mamanguape - PB

Bairros:
- Centro
- Planalto
- Areial
- Gurguri
- Alto do Cemitério
- Bairro Novo
- Bela Vista
- Cidade Nova

Relatos exemplo:

## Relato 1
Título:
Buraco grande na Rua das Flores

Categoria:
Mobilidade

Status:
Em andamento

Descrição:
Buraco está aumentando e dificultando a passagem de carros e motos. Moradores relatam risco de acidentes, principalmente à noite.

Local:
Rua das Flores, Centro

Apoios:
342

Urgências:
15

Comentários:
27

## Relato 2
Título:
Poste com luz apagada há mais de uma semana

Categoria:
Iluminação pública

Status:
Em análise

Descrição:
A rua fica muito escura durante a noite, causando insegurança para os moradores.

Local:
Av. Brasil, Bairro Novo

Apoios:
215

Urgências:
8

Comentários:
12

## Relato 3
Título:
Lixo acumulado próximo à praça

Categoria:
Limpeza urbana

Status:
Aberto

Descrição:
Há lixo acumulado há vários dias, causando mau cheiro e atraindo animais.

Local:
Praça Central, Centro

Apoios:
178

Urgências:
5

Comentários:
9

## Relato 4
Título:
Vazamento de água na calçada

Categoria:
Água e esgoto

Status:
Programado

Descrição:
Vazamento constante está desperdiçando água e deixando a calçada escorregadia.

Local:
Rua São João, Planalto

Apoios:
96

Urgências:
6

Comentários:
4

---

# 25. Personalidade visual

A interface deve parecer:
- Confiável
- Cidadã
- Colaborativa
- Moderna
- Clara
- Próxima
- Institucional na medida certa
- Otimista
- Profissional
- Transparente

Não deve parecer:
- Rede social bagunçada
- Sistema antigo de prefeitura
- Aplicativo de reclamação agressiva
- Dashboard pesado demais
- Interface policial
- Portal burocrático

---

# 26. Resultado esperado

Gere um protótipo completo e navegável, com:
- Design system básico
- Telas mobile first
- Versões web responsivas
- Painel administrativo da prefeitura
- Componentes reutilizáveis
- Estados de interação
- Fluxo completo de novo relato
- Fluxo completo de acompanhamento
- Fluxo de confirmação/contestação
- UX writing humanizado
- Visual Civic Modern
- Logo “Conecta Cidadão”
- Slogan “Você informa. A prefeitura resolve.”

A prioridade absoluta é:
**Um morador precisa conseguir informar um problema urbano com facilidade, e a prefeitura precisa conseguir transformar esse relato em ação acompanhável e transparente.**