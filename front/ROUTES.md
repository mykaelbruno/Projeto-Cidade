# Conecta Cidadão - Estrutura de Rotas

## 🗺️ Mapa de Rotas

### Área Pública
| Rota | Componente | Descrição | Layout |
|------|-----------|-----------|--------|
| `/` | WelcomePage | Tela de boas-vindas inicial | Standalone |

### Área do Morador
| Rota | Componente | Descrição | Layout |
|------|-----------|-----------|--------|
| `/feed` | HomePage | Feed principal com relatos | MainLayout |
| `/mapa` | MapPage | Visualização no mapa interativo | MainLayout |
| `/minhas` | MyReportsPage | Minhas solicitações | MainLayout |
| `/perfil` | ProfilePage | Perfil do usuário | MainLayout |
| `/relato/:id` | ReportDetailPage | Detalhes de um relato específico | MainLayout |
| `/novo-relato` | NewReportPage | Fluxo de criação de relato | Fullscreen |

### Área Administrativa
| Rota | Componente | Descrição | Layout |
|------|-----------|-----------|--------|
| `/admin` | AdminPage | Dashboard da prefeitura | Standalone |

## 🧭 Navegação

### Bottom Navigation (Mobile)
- **Feed** → `/feed`
- **Mapa** → `/mapa`
- **Nova** → `/novo-relato`
- **Minhas** → `/minhas`
- **Perfil** → `/perfil`

### Links Diretos
- Detalhes do relato: `/relato/1`, `/relato/2`, etc.
- Painel admin: `/admin` (botão flutuante "ADM")

## 🔀 Fluxos de Navegação

### Fluxo de Novo Relato
1. Usuário clica em "Novo relato" (qualquer tela)
2. Navega para `/novo-relato`
3. Completa o fluxo de 4 etapas
4. Ao concluir, redireciona para `/minhas`

### Fluxo de Visualização de Relato
1. Usuário clica em um card de relato
2. Navega para `/relato/:id`
3. Vê detalhes completos
4. Pode voltar com botão "Voltar" (usa `navigate(-1)`)

### Alternância entre Modos
- Morador → Admin: Botão "ADM" leva para `/admin`
- Admin → Morador: Botão "Ver modo morador" leva para `/feed`

## 📱 Responsividade

- **Mobile:** Bottom navigation visível, rotas completas
- **Desktop:** Bottom navigation oculta (pode ser substituída por sidebar futura)

## 🎯 Rotas Futuras (Planejadas)

### Área do Morador
- `/notificacoes` - Central de notificações
- `/ranking` - Ranking e badges de engajamento
- `/bairro/:nome` - Relatos filtrados por bairro
- `/categoria/:nome` - Relatos filtrados por categoria

### Área Administrativa
- `/admin/fila` - Fila operacional de relatos
- `/admin/relatorios` - Relatórios e analytics
- `/admin/secretarias` - Gestão de secretarias
- `/admin/usuarios` - Gestão de usuários
- `/admin/moderacao` - Painel de moderação
- `/admin/configuracoes` - Configurações do sistema

## ⚙️ Configuração Técnica

**Router:** React Router v7.13.0

**Estrutura:**
```
src/app/
├── App.tsx (configuração de rotas)
├── layouts/
│   └── MainLayout.tsx (layout com BottomNav)
└── pages/
    ├── WelcomePage.tsx
    ├── HomePage.tsx
    ├── MapPage.tsx
    ├── MyReportsPage.tsx
    ├── ProfilePage.tsx
    ├── NewReportPage.tsx
    ├── ReportDetailPage.tsx
    └── AdminPage.tsx
```

## 🔒 Autenticação (Futuro)

Quando implementar autenticação:
- Criar `ProtectedRoute` wrapper
- Rotas `/admin/*` requerem role de funcionário
- Rotas `/minhas` requerem login
- Rota `/` (welcome) será pública
