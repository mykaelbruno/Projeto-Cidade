# ✅ Checklist de Quality Assurance - Cidade Ativa

## 📱 Teste de Responsividade

### Mobile (< 640px)
- [ ] Cards de stats em 2 colunas
- [ ] Tabelas convertidas em cards
- [ ] Botões empilhados verticalmente
- [ ] Padding reduzido (p-3 vs p-6)
- [ ] Texto menor mas legível
- [ ] Bottom navigation visível (morador)
- [ ] Modais ocupam largura adequada
- [ ] Profile switcher não sobrepõe conteúdo
- [ ] Notificações dropdown se ajusta
- [ ] Scroll horizontal não aparece

### Tablet (640px - 1024px)
- [ ] Grid de 2 colunas funciona
- [ ] Sidebar visível (admin/secretaria/admin app)
- [ ] Cards de tamanho médio
- [ ] Tabelas legíveis
- [ ] Modais centralizados

### Desktop (> 1024px)
- [ ] Grid de 4 colunas em stats
- [ ] Sidebar completa expandida
- [ ] Tabelas completas visíveis
- [ ] Todos os detalhes mostrados
- [ ] Hover states funcionam

## 🔐 Teste de Autenticação e Navegação

### Login
- [ ] Selecionar "Morador" → Redireciona para `/feed`
- [ ] Selecionar "Prefeitura" → Redireciona para `/prefeitura/dashboard`
- [ ] Selecionar "Secretaria" → Redireciona para `/secretaria/dashboard`
- [ ] Selecionar "Moderador" → Redireciona para `/moderador/painel`
- [ ] Selecionar "Admin App" → Redireciona para `/admin-app/visao-geral`

### RouteGuard
- [ ] Morador não acessa rotas de prefeitura
- [ ] Prefeitura não acessa rotas de secretaria
- [ ] Secretaria não acessa rotas de admin app
- [ ] Moderador não acessa rotas de morador
- [ ] Admin app não acessa rotas de morador
- [ ] Redirecionamento automático funciona

### Profile Switcher
- [ ] Botão visível em todas as telas administrativas
- [ ] Dropdown abre corretamente
- [ ] Mostra perfil atual com badge "Atual"
- [ ] Troca de perfil funciona
- [ ] Navega para rota correta do perfil selecionado
- [ ] Visual consistente em mobile e desktop

## 👤 Morador - Testes

### Feed
- [ ] Cards de denúncias carregam
- [ ] Filtros funcionam
- [ ] Scroll infinito (se implementado)
- [ ] Apoiar denúncia funciona
- [ ] Abrir detalhe funciona

### Criar Denúncia
- [ ] Fluxo de 4 etapas funciona
- [ ] Validações de formulário
- [ ] Upload de foto (simulado)
- [ ] Seleção de localização
- [ ] Confirmação final

### Meu Perfil
- [ ] Dados exibidos corretamente
- [ ] Estatísticas aparecem
- [ ] Editar funciona (se implementado)

## 🏢 Prefeitura - Testes

### Dashboard
- [ ] Cards de stats carregam
- [ ] Gráficos aparecem (se implementado)
- [ ] Performance por secretaria carrega
- [ ] Denúncias recentes listam
- [ ] Ações rápidas funcionam

### Relatos
- [ ] Tabela de relatos carrega
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Ordenação funciona
- [ ] Detalhes abrem

### Administração
- [ ] Gerenciar secretarias
- [ ] Criar operador
- [ ] Editar dados

### Analytics
- [ ] Métricas carregam
- [ ] Período selecionável
- [ ] Gráficos renderizam (se implementado)

## 🏛️ Secretaria - Testes

### Dashboard
- [ ] Relatos atribuídos carregam
- [ ] Métricas da secretaria aparecem
- [ ] Filtros funcionam

### Atendimento
- [ ] Abrir relato
- [ ] Atualizar status
- [ ] Adicionar comentário (se implementado)
- [ ] Concluir atendimento

### Usuários
- [ ] Listar atendentes
- [ ] Criar atendente (se implementado)
- [ ] Editar permissões

## 🛡️ Moderador - Testes

### Sinalizações
- [ ] Lista de pendentes carrega
- [ ] Busca funciona
- [ ] Botão "Ver Denúncia" abre modal
- [ ] Modal exibe detalhes completos
- [ ] Botão "Arquivar" abre modal
- [ ] Validação de 10 caracteres funciona
- [ ] Confirmação de arquivamento

### Ver Denúncia (Modal)
- [ ] Detalhes completos aparecem
- [ ] Comentários listam
- [ ] Botão remover comentário aparece
- [ ] Modal de remover funciona
- [ ] Responsivo em mobile
- [ ] Fechar modal funciona

### Moderação de Usuários
- [ ] Busca de usuário funciona
- [ ] Dados do usuário carregam
- [ ] Botão "Advertir" abre modal
- [ ] Botão "Suspender" abre modal
- [ ] Botão "Reativar" abre modal
- [ ] Botão "Ver Histórico" abre modal
- [ ] Validação de motivo (10 chars) funciona
- [ ] Confirmação exibe toast de sucesso

### Histórico
- [ ] Lista de ações carrega
- [ ] Badges coloridos por tipo de ação
- [ ] Data formatada corretamente
- [ ] Moderador responsável exibido
- [ ] Estado vazio aparece se sem histórico

### Notificações
- [ ] Badge de não lidas aparece
- [ ] Dropdown abre corretamente
- [ ] Lista de notificações carrega
- [ ] Marcar como lida funciona
- [ ] Marcar todas como lidas funciona
- [ ] Fechar dropdown funciona

## 👑 Admin App - Testes

### Visão Geral
- [ ] Cards de stats carregam (8 cards)
- [ ] Stats de moderação aparecem
- [ ] Eventos auditados listam
- [ ] Resumo da plataforma carrega
- [ ] Ações rápidas funcionam
- [ ] Responsivo mobile (2 colunas)

### Organizações
- [ ] Lista de prefeituras carrega
- [ ] Expandir/colapsar funciona
- [ ] Secretarias aparecem dentro da prefeitura
- [ ] Busca funciona
- [ ] Botão "Nova Prefeitura" abre modal
- [ ] Botão "Nova Secretaria" abre modal
- [ ] Formulários validam
- [ ] Hierarquia visual clara

### Usuários
- [ ] Tabela carrega (desktop)
- [ ] Cards carregam (mobile)
- [ ] Filtros funcionam (perfil, situação)
- [ ] Busca funciona
- [ ] Stats corretos
- [ ] Modal criar usuário abre
- [ ] Formulário completo
- [ ] Botões de ação presentes

### Vínculos
- [ ] Lista de vínculos carrega
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Badges de papel coloridos
- [ ] Nota sobre desativar vínculo visível

### Categorias
- [ ] Tabela carrega
- [ ] Busca funciona
- [ ] Modal criar categoria abre
- [ ] Campo organização responsável opcional
- [ ] Stats corretos

### Moderação
- [ ] Similar ao moderador mas com mais poderes
- [ ] Sinalizações carregam
- [ ] Modal de moderação de usuário funciona
- [ ] Busca de usuário funciona

### Auditoria
- [ ] Tabela carrega (desktop)
- [ ] Cards carregam (mobile/tablet)
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Badges de método HTTP coloridos
- [ ] Paginação presente
- [ ] Botão exportar presente

### Operacional Global
- [ ] Seletor de prefeitura funciona
- [ ] Stats da prefeitura carregam
- [ ] Secretarias listam
- [ ] Performance de secretarias aparece
- [ ] Filtros funcionam
- [ ] Tabela de relatos carrega
- [ ] Botão exportar CSV presente
- [ ] Nota sobre supervisão visível

## 🔔 Notificações - Todos os Perfis

- [ ] Botão com badge vermelho aparece
- [ ] Contador de não lidas correto
- [ ] Dropdown abre sem quebrar layout
- [ ] Notificações listam
- [ ] Ícones por tipo funcionam
- [ ] Marcar como lida funciona
- [ ] Marcar todas como lidas funciona
- [ ] Fechar dropdown funciona
- [ ] Estado vazio aparece
- [ ] Responsivo em mobile

## 🎨 Testes Visuais

### Consistência
- [ ] Cores seguem design system
- [ ] Espaçamentos consistentes
- [ ] Bordas arredondadas uniformes
- [ ] Shadows consistentes
- [ ] Tipografia coerente

### Interatividade
- [ ] Hover states em botões
- [ ] Transições suaves
- [ ] Loading states (quando aplicável)
- [ ] Estados disabled visíveis
- [ ] Focus visible em inputs

### Estados
- [ ] Loading aparece quando necessário
- [ ] Empty states bem desenhados
- [ ] Success toasts aparecem
- [ ] Modais centralizam
- [ ] Erros são claros

## 🐛 Testes de Bugs Conhecidos

### Corrigidos
- [x] RouteGuard loop infinito
- [x] Botão "Ver Denúncia" não funciona
- [x] Notificações estáticas
- [x] Tabelas quebram em mobile
- [x] Cards muito grandes em mobile

### A Verificar
- [ ] Performance com muitos items
- [ ] Memory leaks em modais
- [ ] Scroll position ao voltar
- [ ] Cache de imagens (se implementado)

## ⚡ Testes de Performance

- [ ] Tempo de carregamento inicial < 3s
- [ ] Navegação entre rotas instantânea
- [ ] Modais abrem rapidamente
- [ ] Scroll suave
- [ ] Sem lag em inputs
- [ ] Listas virtualizadas se > 100 items (se aplicável)

## ♿ Acessibilidade Básica

- [ ] Navegação por teclado funciona
- [ ] Tab order faz sentido
- [ ] Enter ativa botões
- [ ] Esc fecha modais
- [ ] Labels em inputs
- [ ] Contraste adequado
- [ ] Textos alt em imagens (quando aplicável)

## 🔒 Segurança (Frontend)

- [ ] Não há console.logs sensíveis
- [ ] Inputs sanitizados (básico)
- [ ] Validações client-side presentes
- [ ] Rotas protegidas com RouteGuard
- [ ] Nenhuma chave de API exposta

## 📝 Notas Importantes

### ⚠️ Limitações Conhecidas

1. **Dados Mockados**: Todos os dados são simulados. Operações CRUD não persistem.

2. **Autenticação Simulada**: O login não valida credenciais reais. É apenas para prototipação.

3. **Upload de Imagens**: Simulado. Não há armazenamento real.

4. **Mapa**: Placeholder. Não há integração com Google Maps/Mapbox.

5. **Backend**: Nenhuma integração com API real implementada.

### ✅ Critérios de Aceitação

Para considerar o projeto pronto para integração com backend:

- [ ] Todas as rotas navegáveis
- [ ] Todos os modais funcionais
- [ ] Responsividade 100% mobile/desktop
- [ ] Notificações funcionando
- [ ] Profile switcher operacional
- [ ] Empty states em todos os lugares apropriados
- [ ] Loading states onde necessário
- [ ] Validações client-side presentes
- [ ] Sem erros no console (exceto avisos de dev)
- [ ] Sem warnings do React
- [ ] TypeScript sem erros
- [ ] README.md atualizado
- [ ] REFINAMENTOS_E_MELHORIAS.md completo

---

**Instruções de Uso:**

1. Clone este checklist
2. Marque cada item após testar
3. Documente bugs encontrados
4. Priorize correções críticas
5. Valide novamente após correções

**Tempo Estimado de QA Completo:** 4-6 horas

**Status Atual:** ✅ Pronto para testes

