# 🏙️ Cidade Ativa (Conecta Cidadão)

**Você informa. A prefeitura resolve.**

Plataforma completa de zeladoria urbana e participação cidadã que conecta moradores, prefeituras, secretarias e moderadores de forma simples, transparente e eficiente.

## 🎯 Sobre o Projeto

O Conecta Cidadão é uma solução de civic tech que permite aos cidadãos informar problemas urbanos como buracos, iluminação pública, lixo acumulado, vazamentos e outros problemas da cidade. A prefeitura recebe os relatos, organiza por secretaria responsável, acompanha o andamento e resolve.

## 👥 Perfis de Usuário

### 1. 👤 Morador - Cidadão Comum
Portal do cidadão com todas as funcionalidades principais:
- 📱 Feed de relatos da cidade
- 🗺️ Visualização no mapa interativo
- ➕ Criar novo relato com fotos e localização
- 👍 Apoiar relatos de outros cidadãos
- ⚠️ Marcar urgência
- 💬 Comentar e acompanhar status
- ✅ Confirmar ou contestar resolução
- 🏆 Sistema de badges e engajamento

### 2. 🏢 Prefeitura - Gestão Municipal
Painel administrativo completo da prefeitura:
- 📊 Dashboard geral com visão de todas as denúncias
- 🏛️ Gerenciamento de secretarias
- 📈 Analytics e métricas de desempenho
- 👥 Administração de usuários institucionais
- 📑 Relatórios e exports

### 3. 🏛️ Secretaria - Atendimento Setorial
Interface operacional para secretarias:
- 🎯 Painel de denúncias atribuídas
- ✅ Atendimento e resolução de demandas
- 👥 Gestão de equipe de atendentes
- 📊 Métricas operacionais da secretaria

### 4. 🛡️ Moderador - Moderação de Conteúdo
Sistema de moderação da plataforma:
- 🚩 Análise de sinalizações e denúncias reportadas
- ⚠️ Moderação de usuários (advertir, suspender, reativar)
- 🗑️ Remoção de comentários inadequados
- 📜 Histórico completo de moderação
- 🔍 Detalhes de denúncias com sistema de comentários

### 5. 👑 Admin App - Administração Global
Controle total da plataforma:
- 🏢 Gestão de organizações (prefeituras e secretarias)
- 👥 Gerenciamento de usuários globais
- 🔗 Vínculos institucionais
- 🏷️ Categorias de denúncias
- 🛡️ Moderação geral
- 📋 Auditoria completa de eventos
- 📊 Acompanhamento operacional global
- 🔔 Sistema de notificações

## ✨ Funcionalidades Implementadas
- Interface mobile-first responsiva
- Feed de relatos com filtros por categoria e status
- Fluxo completo de criação de novo relato (4 etapas)
- Visualização detalhada de relatos com timeline
- Mapa interativo com pins categorizados
- Perfil do usuário com estatísticas
- Sistema de minhas solicitações
- Design system Civic Modern

## 🎨 Design System

### Identidade Visual
- **Nome:** Conecta Cidadão
- **Slogan:** Você informa. A prefeitura resolve.
- **Estilo:** Civic Modern - limpo, profissional, colaborativo e confiável

### Paleta de Cores
- Verde Principal: #087F5B (cidade, cuidado, solução)
- Azul Institucional: #0F4C81 (confiança, governo)
- Background: #F7FAFC
- Status com cores específicas por etapa

### Tipografia
- **Display:** Manrope (títulos e cards)
- **Body:** Inter (texto corrido)
- **Mono:** JetBrains Mono (códigos e labels)

## 🚀 Tecnologias

- React 18.3
- TypeScript
- React Router 7 (navegação e rotas)
- Tailwind CSS 4
- Lucide React (ícones)
- Vite
- Motion (animações)

## 📱 Responsividade

O protótipo é mobile-first e se adapta para diferentes tamanhos de tela:
- **Mobile:** Bottom navigation, lista vertical, filtros horizontais
- **Tablet:** Cards em 2 colunas
- **Desktop:** Sidebar, grid de cards, painel completo

## 🎭 Telas Implementadas

### Mobile
1. Feed inicial com hero e filtros
2. Mapa interativo
3. Novo relato (fluxo em 4 etapas)
4. Detalhes do relato com timeline
5. Minhas solicitações
6. Perfil do usuário

## 🗺️ Rotas

### Morador
- `/` - Login / Tela inicial
- `/feed` - Feed principal de denúncias
- `/mapa` - Mapa interativo
- `/novo-relato` - Criar nova denúncia
- `/minhas` - Minhas denúncias
- `/perfil` - Perfil do usuário
- `/relato/:id` - Detalhes de denúncia específica

### Prefeitura
- `/prefeitura/dashboard` - Dashboard geral
- `/prefeitura/relatos` - Todos os relatos
- `/prefeitura/prefeituraistracao` - Administração
- `/prefeitura/analytics` - Analytics
- `/prefeitura/perfil` - Perfil institucional

### Secretaria
- `/secretaria/dashboard` - Painel operacional
- `/secretaria/relatos` - Relatos atribuídos
- `/secretaria/relato/:id` - Detalhe do relato
- `/secretaria/usuarios` - Gestão de usuários
- `/secretaria/perfil` - Perfil da secretaria

### Moderador
- `/moderador/painel` - Painel de moderação
  - Sinalizações pendentes
  - Moderação de usuários
  - Histórico de moderação

### Admin App
- `/admin-app/visao-geral` - Dashboard global
- `/admin-app/organizacoes` - Gestão de org.
- `/admin-app/usuarios` - Usuários globais
- `/admin-app/vinculos` - Vínculos institucionais
- `/admin-app/categorias` - Categorias
- `/admin-app/moderacao` - Moderação geral
- `/admin-app/auditoria` - Auditoria de eventos
- `/admin-app/operacional` - Operacional global

## 🔐 Sistema de Autenticação (Protótipo)

Para fins de demonstração, o sistema possui um **bypass de autenticação** na tela de login:

1. Acesse `/` (Login)
2. Selecione o tipo de usuário desejado
3. Faça login (sem validação real)
4. Será redirecionado para o painel apropriado

**Profile Switcher**: Canto inferior direito permite trocar entre perfis durante a navegação.

⚠️ **IMPORTANTE**: Este é apenas um protótipo. Implemente autenticação JWT real em produção.

## 🌟 Diferenciais

- Tom colaborativo (não agressivo)
- UX writing humanizado
- Visual institucional mas amigável
- Foco em transparência e acompanhamento
- Sistema de confirmação de resoluções
- Engajamento cidadão positivo

## 📝 Status do Projeto

### ✅ Completo
- ✅ Interface de todos os 5 perfis
- ✅ Sistema de roteamento e navegação
- ✅ Responsividade mobile/desktop
- ✅ Sistema de notificações
- ✅ Modais e componentes reutilizáveis
- ✅ Type safety com TypeScript
- ✅ Design system consistente

### ⚠️ Parcial (UI pronta, backend faltante)
- ⚠️ Operações CRUD
- ⚠️ Sistema de busca avançado
- ⚠️ Analytics com gráficos

### ❌ Não Implementado
- ❌ Backend/API REST
- ❌ Autenticação JWT real
- ❌ Upload de imagens
- ❌ Mapa interativo real (Google Maps/Mapbox)
- ❌ Chat/mensagens diretas
- ❌ PWA features
- ❌ Testes automatizados

Ver [REFINAMENTOS_E_MELHORIAS.md](./REFINAMENTOS_E_MELHORIAS.md) para roadmap detalhado.

## 🚀 Próximos Passos

1. **Backend (Prioridade 1)**
   - API REST completa
   - Autenticação JWT
   - Banco de dados
   - Validações server-side

2. **Features Core (Prioridade 2)**
   - Upload de imagens
   - Integração com mapa
   - Notificações em tempo real
   - Sistema de busca avançado

3. **Melhorias (Prioridade 3)**
   - Analytics com gráficos
   - PWA (offline mode)
   - Modo escuro
   - Testes automatizados

---

Desenvolvido com o conceito de **Civic Tech** para melhorar a relação entre cidadãos e governo.
