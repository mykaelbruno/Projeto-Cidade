# 📑 Cidade Ativa: Contrato e Documentação da API REST

Este documento fornece o mapeamento completo e de altíssima precisão de todas as rotas, entidades, validações, fluxos de acesso e segurança do backend da plataforma **Cidade Ativa**. Ele serve como o guia definitivo e o contrato formal para o consumo de dados pela camada frontend.

---

## ⚙️ 1. Visão Geral da API

*   **Nome do Backend**: Cidade Ativa API (v1)
*   **Objetivo**: Registro, controle georreferenciado, engajamento social (crowdsourcing) e gestão operacional/mediação de relatos de problemas urbanos (zeladoria urbana).
*   **Tecnologias Utilizadas**:
    *   Java 21 (JDK 21)
    *   Spring Boot 4.x (Web, Data JPA, Security)
    *   Spring Security com OAuth2 Resource Server & JWT (comunicação stateless e cookie-based)
    *   Banco de Dados Relacional H2 (testes/dev) e PostgreSQL/MySQL (produção)
*   **Prefixo Base das Rotas**: `/api` (ex: `http://localhost:8080/api/...`)
*   **Formato de Erro Padronizado**: Todos os endpoints de falha retornam o DTO `ErroApiResponse` no seguinte formato:
    ```json
    {
      "timestamp": "2026-05-30T19:40:00Z",
      "status": 400,
      "erro": "VALIDATION_ERROR",
      "mensagem": "{titulo=O título deve ter no mínimo 5 caracteres}",
      "caminho": "/api/denuncias"
    }
    ```
    *   *Códigos de Erro Comuns (`erro`)*:
        *   `VALIDATION_ERROR`: Falha de validação de beans (campos incorretos ou em branco).
        *   `ARQUIVO_MUITO_GRANDE`: Upload que ultrapassa o tamanho máximo configurado (ex: arquivo de anexo maior que o limite).
        *   `ACESSO_NEGADO`: Tentativa de acesso sem os privilégios ou papéis institucionais exigidos pelo endpoint.
        *   `LIMITE_REQUISICOES` (HTTP `429 Too Many Requests`): Disparado pelo filtro de rate limiting quando houver abuso de chamadas a endpoints sensíveis em curto período de tempo.
        *   `ERRO_INTERNO`: Falha genérica ou erro inesperado no backend (HTTP 500).

---

## 🛣️ 2. Endpoints Encontrados (Mapeamento Completo)

Abaixo estão todos os endpoints mapeados diretamente dos controladores REST do backend.

### 2.1. Autenticação e Gestão de Contas públicas (Sem Autenticação)
Todas as rotas sob `/api/auth` e `/api/conta` listadas a seguir são **públicas** e protegidas por limites de requisição (*Rate Limiting*).

| Método | Rota | Arquivo/Controller | Descrição | Payload de Entrada (Request Body) | Resposta Esperada | Possíveis Status HTTP |
|---|---|---|---|---|---|---|
| **POST** | `/api/auth/cadastro-morador` | `AuthController.java` | Cadastra um novo Morador comum na plataforma. | `CadastroMoradorRequestDTO` | `AuthResponseDTO` *(contém mensagem de sucesso e DTO do usuário)* | 200, 400, 429, 500 |
| **POST** | `/api/auth/login` | `AuthController.java` | Realiza autenticação com e-mail ou username. | `LoginRequestDTO` | `AuthResponseDTO` + Cookies `access_token` e `refresh_token` | 200, 400, 401, 429, 500 |
| **POST** | `/api/auth/refresh` | `AuthController.java` | Renova a sessão usando o cookie `refresh_token`. | *Nenhum (lê do Cookie)* | `AuthResponseDTO` + Novo Cookie `access_token` | 200, 401, 429, 500 |
| **POST** | `/api/auth/logout` | `AuthController.java` | Limpa a sessão no backend e expira os cookies. | *Nenhum* | *Sem conteúdo (No Content)* + Limpeza de cookies | 204, 500 |
| **GET** | `/api/auth/me` | `AuthController.java` | Retorna dados do usuário autenticado no token. | *Nenhum (Exige Token)* | `UsuarioLogadoResponseDTO` *(usuário, papéis e vínculos)* | 200, 401 |
| **POST** | `/api/conta/verificacao-email/solicitacao` | `ContaController.java` | Solicita código de verificação para o e-mail de cadastro. | `SolicitacaoTokenRequestDTO` *(email)* | `MensagemResponseDTO` *(sucesso genérico anti-pesquisa)* | 200, 429, 500 |
| **POST** | `/api/conta/verificacao-email/confirmacao` | `ContaController.java` | Confirma e-mail por meio do token recebido. | `ConfirmacaoTokenRequestDTO` *(token)* | `MensagemResponseDTO` *(sucesso)* | 200, 400, 429, 500 |
| **POST** | `/api/conta/recuperacao-senha/solicitacao` | `ContaController.java` | Solicita token para redefinição de senha perdida. | `SolicitacaoTokenRequestDTO` *(email)* | `MensagemResponseDTO` *(sucesso genérico)* | 200, 429, 500 |
| **POST** | `/api/conta/recuperacao-senha/redefinicao` | `ContaController.java` | Redefine senha do usuário usando o token de recuperação. | `RedefinicaoSenhaRequestDTO` *(token, novaSenha)* | `MensagemResponseDTO` *(sucesso)* | 200, 400, 429, 500 |

---

### 2.2. Denúncias e Relatos (Core)

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil Mínimo | Query Params / Path Variable | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **POST** | `/api/denuncias` | `DenunciaController.java` | **Sim** | `MORADOR` | N/A | `DenunciaCreateRequestDTO` | `DenunciaResponseDTO` |
| **POST** | `/api/denuncias/semelhantes` | `DenunciaController.java` | **Sim** | `MORADOR` | N/A | `DenunciaCreateRequestDTO` | `List<DenunciaSemelhanteResponseDTO>` |
| **GET** | `/api/denuncias` | `DenunciaController.java` | **Sim** | Qualquer Autenticado | Query: `cidade`, `bairro`, `status`, `categoriaId`, `page`, `size` | N/A | `Page<DenunciaResponseDTO>` |
| **GET** | `/api/denuncias/minhas` | `DenunciaController.java` | **Sim** | `MORADOR` | Query: `cidade`, `bairro`, `status`, `categoriaId`, `page`, `size` | N/A | `Page<DenunciaResponseDTO>` |
| **GET** | `/api/denuncias/{id}` | `DenunciaController.java` | **Sim** | Qualquer Autenticado | Path: `id` | N/A | `DenunciaResponseDTO` |
| **DELETE** | `/api/denuncias/{id}` | `DenunciaController.java` | **Sim** | Autor ou `ADMIN_APP` | Path: `id` | N/A | 204 *(No Content)* |
| **PATCH** | `/api/denuncias/{id}/status` | `DenunciaController.java` | **Sim** | Institucionais (com vínculo) | Path: `id` | `StatusDenunciaUpdateRequestDTO` | `DenunciaResponseDTO` |
| **POST** | `/api/denuncias/{id}/conclusao/confirmacao` | `DenunciaController.java` | **Sim** | Autor do chamado | Path: `id` | `FeedbackConclusaoRequestDTO` | 200 *(Mensagem)* |
| **POST** | `/api/denuncias/{id}/conclusao/contestacao` | `DenunciaController.java` | **Sim** | Autor do chamado | Path: `id` | `FeedbackConclusaoRequestDTO` | 200 *(Mensagem)* |

---

### 2.3. Anexos de Denúncia (Fotos)

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil | Parâmetros | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **POST** | `/api/denuncias/{denunciaId}/anexos` | `AnexoDenunciaController.java` | **Sim** | Autor do chamado | Path: `denunciaId` | Multipart Form: `arquivo` *(MultipartFile)* | `AnexoDenunciaResponseDTO` |
| **GET** | `/api/denuncias/{denunciaId}/anexos` | `AnexoDenunciaController.java` | **Sim** | Qualquer Autenticado | Path: `denunciaId` | N/A | `Page<AnexoDenunciaResponseDTO>` |
| **GET** | `/api/denuncias/{denunciaId}/anexos/{anexoId}/arquivo` | `AnexoDenunciaController.java` | **Sim** | Qualquer Autenticado | Path: `denunciaId`, `anexoId` | N/A | `Resource` *(Stream de Imagem/Binary)* |

---

### 2.4. Comentários e Interações Sociais

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil | Parâmetros | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **POST** | `/api/denuncias/{denunciaId}/comentarios` | `ComentarioController.java` | **Sim** | `MORADOR` | Path: `denunciaId` | `ComentarioCreateRequestDTO` *(conteudo)* | `ComentarioResponseDTO` |
| **POST** | `/api/denuncias/{denunciaId}/respostas-oficiais` | `ComentarioController.java` | **Sim** | Institucionais (com vínculo) | Path: `denunciaId` | `RespostaOficialCreateRequestDTO` *(conteudo, organizacaoId)* | `ComentarioResponseDTO` |
| **GET** | `/api/denuncias/{denunciaId}/comentarios` | `ComentarioController.java` | **Sim** | Qualquer Autenticado | Path: `denunciaId` | N/A | `Page<ComentarioResponseDTO>` |
| **POST** | `/api/denuncias/{denunciaId}/confirmacoes` | `InteracaoDenunciaController.java` | **Sim** | `MORADOR` | Path: `denunciaId` | N/A | 200 *(Sucesso)* |
| **DELETE** | `/api/denuncias/{denunciaId}/confirmacoes` | `InteracaoDenunciaController.java` | **Sim** | `MORADOR` | Path: `denunciaId` | N/A | 200 *(Sucesso)* |
| **POST** | `/api/denuncias/{denunciaId}/urgencias` | `InteracaoDenunciaController.java` | **Sim** | `MORADOR` | Path: `denunciaId` | N/A | 200 *(Sucesso)* |
| **DELETE** | `/api/denuncias/{denunciaId}/urgencias` | `InteracaoDenunciaController.java` | **Sim** | `MORADOR` | Path: `denunciaId` | N/A | 200 *(Sucesso)* |
| **GET** | `/api/denuncias/{denunciaId}/interacoes/status` | `InteracaoDenunciaController.java` | **Sim** | `MORADOR` | Path: `denunciaId` | N/A | `InteracaoStatusResponseDTO` *(apoiado: bool, urgente: bool)* |

---

### 2.5. Timeline (Histórico de Trâmite) e Feed Principal

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil | Parâmetros / Query | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **GET** | `/api/denuncias/{denunciaId}/timeline` | `TimelineDenunciaController.java` | **Sim** | Qualquer Autenticado | Path: `denunciaId` | N/A | `Page<TimelineDenunciaResponseDTO>` |
| **GET** | `/api/feed/denuncias` | `FeedDenunciaController.java` | **Sim** | Qualquer Autenticado | Query: `cidade`, `bairro`, `status`, `categoriaId`, `modo` *(MISTO, RECENTES, EM_ALTA)*, `excluirProprias` *(bool)*, `page`, `size` | N/A | `Page<FeedDenunciaMistoResponseDTO>` *(relato + booleans de interação)* |

---

### 2.6. Moderação Centralizada e Controle de Abuso

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil | Parâmetros | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **POST** | `/api/denuncias/{denunciaId}/sinalizacoes` | `SinalizacaoDenunciaController.java` | **Sim** | Qualquer Autenticado | Path: `denunciaId` | `SinalizacaoDenunciaRequestDTO` *(motivo enum, comentario)* | `SinalizacaoDenunciaResponseDTO` |
| **GET** | `/api/moderacoes/sinalizacoes-denuncia` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Query: `page`, `size` | N/A | `Page<SinalizacaoResponseDTO>` |
| **POST** | `/api/moderacoes/sinalizacoes-denuncia/{sinalizacaoId}/analise` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `sinalizacaoId` | N/A | 200 *(Sucesso)* |
| **POST** | `/api/moderacoes/denuncias/{denunciaId}/arquivamento` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `denunciaId` | `ModeracaoAcaoRequestDTO` *(motivo)* | 200 *(Sucesso)* |
| **POST** | `/api/moderacoes/comentarios/{comentarioId}/remocao` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `comentarioId` | `ModeracaoAcaoRequestDTO` *(motivo)* | 200 *(Sucesso)* |
| **POST** | `/api/moderacoes/usuarios/{usuarioId}/advertencia` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `usuarioId` | `ModeracaoAcaoRequestDTO` *(motivo)* | 200 *(Sucesso)* |
| **POST** | `/api/moderacoes/usuarios/{usuarioId}/suspensao` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `usuarioId` | `ModeracaoAcaoRequestDTO` *(motivo)* | 200 *(Sucesso)* |
| **POST** | `/api/moderacoes/usuarios/{usuarioId}/reativacao` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `usuarioId` | `ModeracaoAcaoRequestDTO` *(motivo)* | 200 *(Sucesso)* |
| **GET** | `/api/moderacoes/usuarios/{usuarioId}/historico` | `ModeracaoController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | Path: `usuarioId` | N/A | `List<UsuarioModeracaoHistoricoResponseDTO>` |

---

### 2.7. Painel Operacional das Secretarias e Prefeitura

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil Mínimo | Parâmetros / Query | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **GET** | `/api/operacional/organizacoes/{organizacaoId}/denuncias` | `OperacionalDenunciaController.java` | **Sim** | Institucional da Org | Path: `organizacaoId` \| Query: `cidade`, `bairro`, `status`, `categoriaId` | N/A | `Page<DenunciaResponseDTO>` |
| **POST** | `/api/operacional/denuncias/{denunciaId}/solicitacoes-transferencia` | `OperacionalDenunciaController.java` | **Sim** | `ADMIN_SECRETARIA` / `ATENDENTE_SECRETARIA` | Path: `denunciaId` | `SolicitacaoTransferenciaCreateRequestDTO` *(orgDestinoSugeridaId, motivo)* | `SolicitacaoTransferenciaResponseDTO` |
| **GET** | `/api/operacional/prefeituras/{prefeituraId}/solicitacoes-transferencia` | `OperacionalDenunciaController.java` | **Sim** | `ADMIN_PREFEITURA` | Path: `prefeituraId` | N/A | `Page<SolicitacaoTransferenciaResponseDTO>` |
| **POST** | `/api/operacional/solicitacoes-transferencia/{solicitacaoId}/aprovacao` | `OperacionalDenunciaController.java` | **Sim** | `ADMIN_PREFEITURA` | Path: `solicitacaoId` | `AprovacaoTransferenciaRequestDTO` *(organizacaoDestinoId)* | `SolicitacaoTransferenciaResponseDTO` |
| **POST** | `/api/operacional/solicitacoes-transferencia/{solicitacaoId}/recusa` | `OperacionalDenunciaController.java` | **Sim** | `ADMIN_PREFEITURA` | Path: `solicitacaoId` | `RecusaTransferenciaRequestDTO` *(motivo)* | `SolicitacaoTransferenciaResponseDTO` |
| **PATCH** | `/api/operacional/denuncias/{denunciaId}/responsavel` | `OperacionalDenunciaController.java` | **Sim** | `ADMIN_PREFEITURA` | Path: `denunciaId` | `ReatribuirResponsavelRequestDTO` *(organizacaoId)* | 200 *(Sucesso)* |

---

### 2.8. Backoffice, Usuários, Organizações e Configurações Globais

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil Mínimo | Parâmetros | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **GET** | `/api/usuarios` | `UsuarioController.java` | **Sim** | `ADMIN_APP` | Query: `busca`, `ativo` | N/A | `List<UsuarioResponseDTO>` |
| **POST** | `/api/usuarios` | `UsuarioController.java` | **Sim** | `ADMIN_APP` | N/A | `UsuarioCreateRequestDTO` | `UsuarioResponseDTO` |
| **PUT** | `/api/usuarios/{usuarioId}` | `UsuarioController.java` | **Sim** | `ADMIN_APP` | Path: `usuarioId` | `UsuarioUpdateRequestDTO` | `UsuarioResponseDTO` |
| **PATCH** | `/api/usuarios/{usuarioId}/ativacao` | `UsuarioController.java` | **Sim** | `ADMIN_APP` | Path: `usuarioId` | `AtivacaoRequestDTO` *(ativo: bool)* | `UsuarioResponseDTO` |
| **GET** | `/api/organizacoes` | `OrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Query: `tipo` | N/A | `List<OrganizacaoResponseDTO>` |
| **POST** | `/api/organizacoes/prefeituras` | `OrganizacaoController.java` | **Sim** | `ADMIN_APP` | N/A | `PrefeituraCreateRequestDTO` *(nome, cnpj, cidade, estado)* | `OrganizacaoResponseDTO` |
| **POST** | `/api/organizacoes/prefeituras/{prefeituraId}/secretarias` | `OrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `prefeituraId` | `SecretariaCreateRequestDTO` *(nome, cnpj, categoriasIds)* | `OrganizacaoResponseDTO` |
| **POST** | `/api/organizacoes/{organizacaoId}/usuarios-institucionais` | `OrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `organizacaoId` | `UsuarioInstitucionalCreateRequestDTO` *(usuarioId, papel)* | `VinculoUsuarioOrganizacaoResponseDTO` |
| **PUT** | `/api/organizacoes/{organizacaoId}` | `OrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `organizacaoId` | `OrganizacaoUpdateRequestDTO` *(nome, categoriasIds)* | `OrganizacaoResponseDTO` |
| **PATCH** | `/api/organizacoes/{organizacaoId}/ativacao` | `OrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `organizacaoId` | `AtivacaoRequestDTO` *(ativa: bool)* | `OrganizacaoResponseDTO` |
| **GET** | `/api/prefeituras/{prefeituraId}/bairros/ativos` | `BairroController.java` | **Nao** | Publico | Path: `prefeituraId` | N/A | `List<BairroResponseDTO>` |
| **GET** | `/api/prefeituras/{prefeituraId}/bairros` | `BairroController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `prefeituraId` | N/A | `List<BairroResponseDTO>` |
| **POST** | `/api/prefeituras/{prefeituraId}/bairros` | `BairroController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `prefeituraId` | `BairroCreateRequestDTO` *(nome)* | `BairroResponseDTO` |
| **PUT** | `/api/prefeituras/{prefeituraId}/bairros/{bairroId}` | `BairroController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `prefeituraId`, `bairroId` | `BairroUpdateRequestDTO` *(nome)* | `BairroResponseDTO` |
| **PATCH** | `/api/prefeituras/{prefeituraId}/bairros/{bairroId}/ativacao` | `BairroController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `prefeituraId`, `bairroId` | `AtivacaoRequestDTO` *(ativo)* | `BairroResponseDTO` |
| **GET** | `/api/vinculos` | `VinculoUsuarioOrganizacaoController.java` | **Sim** | `ADMIN_APP` | N/A | N/A | `List<VinculoUsuarioOrganizacaoResponseDTO>` |
| **GET** | `/api/vinculos/me` | `VinculoUsuarioOrganizacaoController.java` | **Sim** | Qualquer Autenticado | N/A | N/A | `List<VinculoUsuarioOrganizacaoResponseDTO>` |
| **GET** | `/api/vinculos/organizacoes/{organizacaoId}` | `VinculoUsuarioOrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `organizacaoId` | N/A | `List<VinculoUsuarioOrganizacaoResponseDTO>` |
| **PUT** | `/api/vinculos/{vinculoId}` | `VinculoUsuarioOrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `vinculoId` | `VinculoUpdateRequestDTO` *(papel, ativo)* | `VinculoUsuarioOrganizacaoResponseDTO` |
| **PATCH** | `/api/vinculos/{vinculoId}/secretaria` | `VinculoUsuarioOrganizacaoController.java` | **Sim** | `ADMIN_PREFEITURA` / `ADMIN_APP` | Path: `vinculoId` | `VinculoTransferenciaSecretariaRequestDTO` *(secretariaDestinoId)* | `VinculoUsuarioOrganizacaoResponseDTO` |
| **GET** | `/api/categorias` | `CategoriaController.java` | **Sim** | Qualquer Autenticado | N/A | N/A | `List<CategoriaResponseDTO>` |
| **POST** | `/api/categorias` | `CategoriaController.java` | **Sim** | `ADMIN_APP` | N/A | `CategoriaCreateRequestDTO` *(nome, descricao)* | `CategoriaResponseDTO` |
| **PUT** | `/api/categorias/{categoriaId}` | `CategoriaController.java` | **Sim** | `ADMIN_APP` | Path: `categoriaId` | `CategoriaCreateRequestDTO` | `CategoriaResponseDTO` |
| **PATCH** | `/api/categorias/{categoriaId}/ativacao` | `CategoriaController.java` | **Sim** | `ADMIN_APP` | Path: `categoriaId` | `AtivacaoRequestDTO` *(ativa: bool)* | `CategoriaResponseDTO` |

---

### 2.9. Relatórios, Notificações, Painéis de BI e Auditoria

| Método | Rota | Arquivo/Controller | Exige Auth? | Perfil Mínimo | Parâmetros | Request Body | Resposta |
|---|---|---|---|---|---|---|---|
| **GET** | `/api/relatorios/operacional/organizacoes/{organizacaoId}/denuncias.csv` | `RelatorioOperacionalController.java` | **Sim** | Institucional da Org | Path: `organizacaoId` \| Query: `cidade`, `bairro`, `status`, `categoriaId` | N/A | `Resource` *(Stream de Arquivo CSV)* |
| **GET** | `/api/paineis/operacional/organizacoes/{organizacaoId}/resumo` | `PainelController.java` | **Sim** | Institucional da Org | Path: `organizacaoId` | N/A | `PainelOperacionalResumoResponseDTO` |
| **GET** | `/api/paineis/moderacao/resumo` | `PainelController.java` | **Sim** | `ADMIN_APP` / `MODERADOR` | N/A | N/A | `PainelModeracaoResumoResponseDTO` |
| **GET** | `/api/notificacoes/minhas` | `NotificacaoController.java` | **Sim** | Qualquer Autenticado | Query: `somenteNaoLidas` *(bool)* | N/A | `Page<NotificacaoResponseDTO>` |
| **PATCH** | `/api/notificacoes/{notificacaoId}/leitura` | `NotificacaoController.java` | **Sim** | Qualquer Autenticado | Path: `notificacaoId` | N/A | `NotificacaoResponseDTO` |
| **GET** | `/api/auditorias` | `AuditoriaController.java` | **Sim** | `ADMIN_APP` | Query: `usuarioId`, `acao`, `page`, `size` | N/A | `Page<AuditoriaResponseDTO>` |

---

## 💾 3. Entidades Principais (Modelo de Dados)

### 3.1. Usuário (`Usuario`)
Representa qualquer conta registrada. O nível e papéis de acesso institucionais são desacoplados por meio da entidade `VinculoUsuarioOrganizacao`.
*   `id` (Long, PK, Auto-increment)
*   `nome` (String, Not Null)
*   `email` (String, Unique, Not Null)
*   `username` (String, Unique, Not Null)
*   `senha` (String, Not Null, criptografada em hash BCrypt)
*   `telefone` (String, Nullable)
*   `cidade` (String, Not Null)
*   `bairro` (String, Not Null)
*   `ativo` (boolean, Default true)
*   `criadoEm` (Instant, Auto-generated)

### 3.2. Denúncia (`Denuncia`)
Entidade central do fluxo operacional. Guarda geolocalização e pontuações calculadas.
*   `id` (Long, PK, Auto-increment)
*   `titulo` (String, Not Null)
*   `descricao` (String, Not Null)
*   `categoria` (FK `Categoria`, Not Null)
*   `status` (Enum `StatusDenuncia`: `ABERTO`, `EM_ANALISE`, `ENCAMINHADO`, `EM_ANDAMENTO`, `PROGRAMADO`, `CONCLUIDO`, `REABERTO`, `ARQUIVADO`)
*   `autor` (FK `Usuario`, Not Null - ocultado nas APIs públicas se `anonima` for true)
*   `anonima` (boolean, Default false)
*   `cidade` (String, Not Null)
*   `bairro` (String, Not Null)
*   `rua` (String, Nullable)
*   `pontoReferencia` (String, Nullable)
*   `latitude` (Double, Nullable)
*   `longitude` (Double, Nullable)
*   `organizacaoResponsavel` (FK `Organizacao`, Nullable - define qual prefeitura ou secretaria está resolvendo o problema)
*   `pontuacaoRelevancia` (int, pontuação baseada em apoios e urgências para algoritmos de feed)
*   `quantidadeConfirmacoes` (int, número de apoios 👍)
*   `quantidadeUrgencias` (int, número de marcações de urgência 🚨)
*   `quantidadeComentarios` (int, número total de comentários ativos)
*   `conclusaoConfirmadaEm` (Instant, Nullable - data da confirmação do morador)
*   `conclusaoContestadaEm` (Instant, Nullable - data da contestação do morador)
*   `feedbackConclusao` (String, Nullable - comentário de homologação final do morador)
*   `criadoEm` (Instant)
*   `atualizadoEm` (Instant)

### 3.3. Organização (`Organizacao`)
Multi-tenant municipal. Representa Prefeituras ou as suas Secretarias aninhadas.
*   `id` (Long, PK)
*   `nome` (String, Not Null)
*   `cnpj` (String, Unique, Not Null)
*   `tipo` (Enum `TipoOrganizacao`: `PREFEITURA`, `SECRETARIA`)
*   `cidade` (String, Not Null)
*   `estado` (String, Not Null)
*   `ativa` (boolean, Default true)
*   `prefeituraPai` (FK `Organizacao`, Nullable - nulo para Prefeituras, preenchido para Secretarias referenciando sua Prefeitura)

### 3.4. Vínculo Usuário-Organização (`VinculoUsuarioOrganizacao`)
Tabela associativa que delega papéis operacionais e controle jurisdicional aos servidores públicos.
*   `id` (Long, PK)
*   `usuario` (FK `Usuario`, Not Null)
*   `organizacao` (FK `Organizacao`, Not Null)
*   `papel` (Enum `PapelOrganizacao`: `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA`, `ATENDENTE_SECRETARIA`)
*   `ativo` (boolean, Default true)

---

## 📨 4. DTOs (Data Transfer Objects) e Schemas

Os principais DTOs de entrada e seus respectivos endpoints de consumo:

1.  **`CadastroMoradorRequestDTO`**:
    *   *Campos*: `nome`, `email`, `username`, `senha` (min 8), `telefone` (opcional), `cidade`, `bairro`.
    *   *Endpoint*: `POST /api/auth/cadastro-morador`.
2.  **`LoginRequestDTO`**:
    *   *Campos*: `identificador` (e-mail ou username), `senha`.
    *   *Endpoint*: `POST /api/auth/login`.
3.  **`DenunciaCreateRequestDTO`**:
    *   *Campos*: `titulo` (5-120), `descricao` (20-2000), `categoriaId`, `anonima` (bool), `cidade`, `bairro`, `rua` (opcional), `pontoReferencia` (opcional), `latitude` (opcional), `longitude` (opcional).
    *   *Endpoints*: `POST /api/denuncias` e `POST /api/denuncias/semelhantes`.
4.  **`StatusDenunciaUpdateRequestDTO`**:
    *   *Campos*: `status` (Enum), `organizacaoId` (Long), `motivo` (max 300).
    *   *Endpoint*: `PATCH /api/denuncias/{id}/status`.
5.  **`FeedbackConclusaoRequestDTO`**:
    *   *Campos*: `feedback` (max 500).
    *   *Endpoints*: `POST /api/denuncias/{id}/conclusao/confirmacao` e `POST /api/denuncias/{id}/conclusao/contestacao`.
6.  **`SolicitacaoTransferenciaCreateRequestDTO`**:
    *   *Campos*: `organizacaoDestinoSugeridaId` (Long), `motivo` (String).
    *   *Endpoint*: `POST /api/operacional/denuncias/{denunciaId}/solicitacoes-transferencia`.
7.  **`SinalizacaoDenunciaRequestDTO`**:
    *   *Campos*: `motivo` (`IMAGEM_INADEQUADA`, `SPAM`, `FAKE_NEWS`, `CONTEUDO_OFENSIVO`, `DADOS_PESSOAIS_EXPOSTOS`, `DENUNCIA_DUPLICADA`, `LOCALIZACAO_INCORRETA`, `CATEGORIA_INCORRETA`, `OUTRO`), `comentario` (max 500).
    *   *Endpoint*: `POST /api/denuncias/{denunciaId}/sinalizacoes`.

---

## 🔒 5. Autenticação, Autorização e Sessão

*   **Login & Session Flow**:
    1.  O cliente faz um **POST** contendo as credenciais para `/api/auth/login`.
    2.  O backend valida a senha (BCrypt) e devolve no header `Set-Cookie` os tokens JWT criptografados `access_token` (curta duração) e `refresh_token` (longa duração).
    3.  Os cookies são marcados como **`HttpOnly`** e **`SameSite=Lax`** (e `Secure=true` em produção). Isso protege a sessão de forma robusta contra ataques XSS e CSRF. O frontend não precisa salvar o token em localStorage.
    4.  Toda requisição subsequente envia automaticamente os cookies para o backend. O backend os descriptografa e popula o contexto de segurança (`SecurityContextHolder`).
*   **Perfis Globais**:
    *   `MORADOR`: Cidadão comum.
    *   `MODERADOR`: Fiscal de abuso da plataforma.
    *   `ADMIN_APP`: Superusuário do sistema.
*   **Vínculos Operacionais (Papeis)**:
    *   `ADMIN_PREFEITURA`: Gestor central do município (Prefeitura).
    *   `ADMIN_SECRETARIA` & `ATENDENTE_SECRETARIA`: Agentes das pastas operacionais.

---

## 🔌 6. Pontos Importantes para Integração (Frontend ➔ Backend)

*   **Listagens Gerais & Feeds**:
    *   Feed principal consome `GET /api/feed/denuncias` enviando o query param `modo=MISTO` (padrão) para equilíbrio de novos relatos e populares.
    *   Para a tela de histórico individual do cidadão, consome-se `GET /api/denuncias/minhas`.
*   **Upload de Múltiplos Arquivos**:
    *   O upload é executado **após** a criação da denúncia. O frontend cria o chamado no endpoint `POST /api/denuncias`, obtém o `id` da denúncia no retorno e executa chamadas consecutivas de `POST /api/denuncias/{id}/anexos` passando cada imagem em um objeto `FormData` sob a chave `arquivo`.
*   **Selects e Dropdowns**:
    *   Lista de categorias operacionais consome `GET /api/categorias`.
    *   Lista de prefeituras operacionais (para extrair a lista de cidades/estados válidos e organizações ativas) consome `GET /api/organizacoes/prefeituras` (rota pública).
*   **Exclusão / Arquivamento**:
    *   A exclusão física não é executada por moradores comuns. A rota `DELETE /api/denuncias/{id}` arquiva o chamado, retirando-o do feed público.

---

## ❓ 7. Pontos a Confirmar (Incertezas)

1.  **Limitação de Uploads**: Embora a validação de *Magic Numbers* e tamanho de uploads esteja ativa no backend, o limite exato de peso em megabytes (MB) suportado por anexo deve ser confirmado pelo administrador de infraestrutura nas configurações do arquivo `application.yml` (geralmente o padrão do Spring é 10MB).
2.  **Autenticação por Bearer Header**: A configuração do `OpenApiConfig` cita a leitura alternativa de tokens via header `Authorization: Bearer <JWT>`. Embora os cookies de sessão sejam o padrão principal de produção, deve ser testada a compatibilidade do frontend móvel com essa autenticação por cabeçalhos REST caso futuramente seja criado um aplicativo de celular nativo.
3.  **Fluxo de Notificações via E-mail em Dev**: O sistema SMTP configurado no backend emite e-mails de notificação reais. Em ambiente de desenvolvimento local, deve ser verificado se as chaves do servidor SMTP (como Mailtrap) estão declaradas no arquivo `.env` para evitar falhas de execução no envio.
