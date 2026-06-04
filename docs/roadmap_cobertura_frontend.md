# Roadmap de Cobertura do Frontend — Integrações de Endpoints Faltantes

## Objetivo

Este documento funciona como nossa **Mesa de Trabalho** para o desenvolvimento e fechamento definitivo do frontend. Ele mapeia os endpoints do backend que já foram integrados às interfaces do usuário, garantindo cobertura de 100% da API, rastreabilidade e segurança.

---

## Tabela de Cobertura e Integrações — Status Final

| Status | Prioridade | Item / Funcionalidade | Endpoint Relacionado | Perfil de Acesso | Complexidade | Justificativa |
|:---:|:---:|---|---|---|:---:|---|
| `[x]` | Alta | **Confirmação de E-mail** | `POST /api/conta/verificacao-email/confirmacao` | Público | Baixa | Permite que moradores cliquem no link do e-mail recebido e ativem suas contas na interface SPA. |
| `[x]` | Média | **Remoção Moderada de Comentário** | `POST /api/moderacoes/comentarios/{id}/remocao` | Moderador / Admin | Baixa | Permite que moderadores excluam comentários inadequados ou ofensivos diretamente na denúncia. |
| `[x]` | Média | **Reatribuição Direta de Órgão** | `PATCH /api/operacional/denuncias/{id}/responsavel` | Admin Prefeitura | Média | Permite que a prefeitura mude a secretaria responsável por um relato sem exigir solicitação de transferência. |
| `[x]` | Média | **Moderação de Órgãos e Parceiros** | `PUT /api/organizacoes/{id}` & `PATCH /api/organizacoes/{id}/ativacao` | Admin Geral (`ADMIN_APP`) | Média | Permite editar dados (nome/tipo) e ativar ou desativar prefeituras e secretarias. |
| `[x]` | Média | **Moderação de Categorias Globais** | `PUT /api/categorias/{id}` & `PATCH /api/categorias/{id}/ativacao` | Admin Geral (`ADMIN_APP`) | Média | Permite editar e desativar categorias de denúncias obsoletas no painel. |
| `[x]` | Média | **Moderação de Vínculos e Servidores** | `PUT /api/vinculos/{id}` | Admin Geral & Admin Pref | Média | Permite desativar ou redefinir papéis operacionais de servidores vinculados. |

---

## Checklist Geral de Desenvolvimento

Total de integrações: **6 / 6 ✅ CONCLUÍDAS**

- **`[x]` Integração 1: Confirmação de E-mail do Morador**
  - `[x]` Criar página pública de confirmação: `ConfirmarEmail.jsx`
  - `[x]` Capturar parâmetro `token` na rota `/confirmar-email`
  - `[x]` Disparar mutação do React Query para a API `/api/conta/verificacao-email/confirmacao`
  - `[x]` Registrar rota `/confirmar-email` em `AppRotas.jsx` como pública
  - `[x]` Exibir estados visuais de sucesso, carregando e erro na tela

- **`[x]` Integração 2: Remoção Moderada de Comentários**
  - `[x]` Identificar perfil moderador/admin logado em `DetalheDenuncia.jsx`
  - `[x]` Adicionar botão de remoção rápida (lixeira) ao lado de cada comentário
  - `[x]` Criar modal/input para coletar o motivo/justificativa de moderação
  - `[x]` Implementar a mutação para o endpoint `/api/moderacoes/comentarios/{comentarioId}/remocao`
  - `[x]` Invalidar queries de comentários ao deletar para atualizar a interface

- **`[x]` Integração 3: Reatribuição Manual de Responsável**
  - `[x]` Identificar o perfil `ADMIN_PREFEITURA` no painel `Operacional.jsx`
  - `[x]` Disponibilizar botão/ação de "Reatribuir" na tabela de denúncias atribuídas
  - `[x]` Exibir formulário de seleção rápida listando as secretarias associadas
  - `[x]` Implementar mutação para disparar `PATCH /api/operacional/denuncias/{id}/responsavel`

- **`[x]` Integração 4: Edição e Ativação de Organizações**
  - `[x]` Adicionar coluna de ações na listagem de organizações em `DashboardAdmin.jsx`
  - `[x]` Implementar botão interativo para ativar/desativar organização (`PATCH /api/organizacoes/{id}/ativacao`)
  - `[x]` Criar modal de edição rápida de nome e tipo da organização (`PUT /api/organizacoes/{id}`)

- **`[x]` Integração 5: Edição e Ativação de Categorias**
  - `[x]` Adicionar coluna de ações na tabela de categorias em `DashboardAdmin.jsx`
  - `[x]` Implementar botão interativo para ativar/desativar categoria (`PATCH /api/categorias/{id}/ativacao`)
  - `[x]` Adicionar formulário de edição rápida (nome/descrição/responsável padrão) da categoria (`PUT /api/categorias/{id}`)

- **`[x]` Integração 6: Moderação e Edição de Vínculos**
  - `[x]` Adicionar coluna de ações na listagem de vínculos de servidores em `DashboardAdmin.jsx`
  - `[x]` Permitir editar papel e desativar/ativar o vínculo do operador (`PUT /api/vinculos/{id}`)

---

## Regras de Operação e Diretrizes de Design

1. **Aesthetics & Tailwind v4**: As novas janelas de edição e formulários seguem o layout moderno e premium da plataforma, utilizando janelas suspensas (glassmorphism/modais fluídos) e cores adaptadas (azul/indigo/âmbar/cinza refinados).
2. **Mensagens Construtivas**: `alerts` amigáveis de sucesso e erros retornados da API em todas as mutações.
3. **Persistência**: Invalidação do cache do React Query em todas as mutações para refletir as alterações instantaneamente sem exigir F5.

---

## Status Final

🎉 **Mesa de Trabalho 100% concluída.** Todas as 6 integrações foram implementadas com sucesso.
