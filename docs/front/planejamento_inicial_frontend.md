# Planejamento Inicial do Frontend (Cidade Ativa)

Este documento registra a estratÃ©gia e as diretrizes do frontend para a aplicaÃ§Ã£o **Cidade Ativa**, organizando a estrutura de diretÃ³rios, tecnologias e fluxos operacionais com base nas diretrizes do projeto.

---

## 1. Stack TecnolÃ³gica do Frontend

Seguindo as especificaÃ§Ãµes de planejamento tÃ©cnico:
- **Core**: React 18+ (Vite)
- **Roteamento**: React Router DOM (v6)
- **EstilizaÃ§Ã£o**: Tailwind CSS (conforme planejado originalmente)
- **ComunicaÃ§Ã£o com a API**: Axios (configurado com cookies para manter sessÃµes seguras com `HttpOnly`)
- **Gerenciamento de Estado de Dados**: TanStack Query (React Query)
- **FormulÃ¡rios e ValidaÃ§Ã£o**: React Hook Form + Zod
- **Mapas**: Leaflet + React Leaflet

---

## 2. Estrutura de DiretÃ³rios Recomendada

Para manter o cÃ³digo e os pacotes organizados (conforme regras do projeto), adotaremos a seguinte estrutura dentro de `frontend/src`:

```txt
src/
â”œâ”€â”€ api/             # ConfiguraÃ§Ãµes do Axios e chamadas de API
â”œâ”€â”€ componentes/     # Componentes reutilizÃ¡veis (botÃµes, inputs, cards, layouts)
â”œâ”€â”€ contextos/       # Contextos globais do React (como AuthContext)
â”œâ”€â”€ ganchos/         # Hooks customizados do React (useAuth, useDenuncia)
â”œâ”€â”€ paginas/         # PÃ¡ginas/Telas principais da aplicaÃ§Ã£o
â”‚   â”œâ”€â”€ admin/       # Telas exclusivas do ADMIN_APP e MODERADOR
â”‚   â”œâ”€â”€ institucional/# Telas de Prefeitura, Secretarias e Atendentes
â”‚   â”œâ”€â”€ morador/     # Telas do Morador (feed, cadastrar denÃºncia, perfil)
â”‚   â””â”€â”€ publicas/    # Login, Cadastro, RecuperaÃ§Ã£o de Senha
â”œâ”€â”€ rotas/           # ConfiguraÃ§Ã£o de rotas pÃºblicas, privadas e por perfil
â””â”€â”€ utils/           # FunÃ§Ãµes utilitÃ¡rias e constantes
```

*Nota: Preferimos nomes claros e em portuguÃªs sem acentos no cÃ³digo para manter coerÃªncia com o backend.*

---

## 3. Fluxo de AutenticaÃ§Ã£o e SessÃ£o Segura

O backend utiliza tokens baseados em cookie (`access_token` e `refresh_token` como `HttpOnly`).
- O frontend nÃ£o acessarÃ¡ o token JWT diretamente (por seguranÃ§a contra XSS).
- Toda requisiÃ§Ã£o ao Axios deve enviar as credenciais (`withCredentials: true`).
- Criaremos um `AuthContext` para gerenciar se o usuÃ¡rio estÃ¡ logado, buscando os dados do usuÃ¡rio atual na rota `/api/auth/me` no carregamento da pÃ¡gina.

---

## 4. Escopo do ProtÃ³tipo Funcional

Focaremos em criar telas altamente usÃ¡veis e interativas, cobrindo todos os fluxos de ponta a ponta:
1. **PÃ¡ginas PÃºblicas**:
   - Cadastro de Morador (`/cadastro`)
   - Login com e-mail/username (`/login`)
   - RecuperaÃ§Ã£o de Senha e RedefiniÃ§Ã£o (`/recuperar-senha`)
2. **Dashboard / Feed de DenÃºncias**:
   - Feed Geral com ordenaÃ§Ã£o mista e filtros completos (`/`)
   - Detalhamento de DenÃºncia com anexo de imagens, timeline, comentÃ¡rios, respostas oficiais e interaÃ§Ãµes (confirmar, urgÃªncia).
3. **Ãrea do Morador**:
   - Criar DenÃºncia com localizaÃ§Ã£o aproximada e upload de imagens (`/denuncias/nova`)
   - Minhas DenÃºncias (`/denuncias/minhas`)
4. **Ãrea Institucional**:
   - GestÃ£o Operacional de DenÃºncias por Prefeitura e Secretarias (`/operacional`)
   - SolicitaÃ§Ãµes de TransferÃªncia e AÃ§Ãµes Oficiais.
5. **Ãrea Administrativa e ModeraÃ§Ã£o**:
   - ModeraÃ§Ã£o de DenÃºncias, ComentÃ¡rios e UsuÃ¡rios (`/moderacao`)
   - PainÃ©is com Taxas de ResoluÃ§Ã£o e Tempo MÃ©dio (`/paineis`)
