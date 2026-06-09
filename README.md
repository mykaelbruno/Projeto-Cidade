# 🏙️ Cidade Ativa

O **Cidade Ativa** é um sistema de zeladoria urbana e participação cidadã. A plataforma conecta moradores à administração pública municipal (Prefeitura e Secretarias) para registrar, acompanhar e resolver problemas de infraestrutura urbana de forma pública e transparente.

Ao contrário dos canais tradicionais de atendimento individual, o sistema funciona como uma rede georreferenciada. Os problemas são publicados em um feed público, permitindo o engajamento da vizinhança e o acompanhamento de todo o processo de resolução.

---

## 🛠️ O que o sistema faz (Funcionalidades)

O sistema divide suas operações com base em perfis de acesso:

### 👤 Morador
*   **Registrar Ocorrências**: Cria relatos informando título, descrição, categoria (asfalto, iluminação, saneamento, etc.), fotos e localização exata em mapa interativo.
*   **Anonimato**: Opção de ocultar a identidade na visualização pública do relato, mas mantendo os dados internos para fins legais e auditoria.
*   **Engajamento Cívico**: Apoiar relatos de outros cidadãos (sistema de upvotes) ou marcar ocorrências como urgentes e dar mais visibilidades a problemas reais e mais engajados, ou seja, mais relevantes para a população.
*   **Comentários**: Interagir publicamente nos relatos de outros cidadãos, para discutir desdobramentos de problemas urbanos em seções públicas.
*   **Validação da Resolução**: Quando o serviço é marcado como concluído pela prefeitura, o morador pode **confirmar** a resolução ou **contestar** o resultado (o que reabre o ticket operacional automaticamente).

### 🏛️ Prefeitura (Gestão Central)
*   **Painel de Controle**: Visão holística de todas as secretarias e do andamento de todas as ocorrências da cidade.
*   **Mediação de Demandas**: Aprovar, recusar ou reatribuir solicitações de transferência de chamados entre secretarias (evitando o "jogo de empurra").
*   **Cadastros Municipais**: Gerenciar a equipe municipal, categorias de denúncia, respectivos responsáveis por cada categoria e os bairros ativos da cidade.
*   **Exportação**: Geração de relatórios operacionais em formato CSV.

### 🏢 Secretarias (Operacional)
*   **Fila de Trabalho**: Atender relatos que pertencem à sua área de atuação (Ex: Secretaria de Obras, Meio Ambiente).
*   **Respostas Oficiais**: Publicar respostas oficiais que alteram o status operacional da ocorrência na linha do tempo pública.
*   **Solicitar Transferência**: Sugerir a transferência fundamentada de um relato caso a demanda pertença a outra secretaria.

### 🛡️ Moderador
*   **Moderação**: Revisar denúncias de abuso reportadas por moradores, com permissão para arquivar relatos indevidos ou remover comentários impróprios.
*   **Gestão de Usuários**: Aplicar advertências, suspensões ou reativações em contas de moradores com histórico de infrações.

### 👑 Administrador do Sistema (Super Admin)
*   **Gestão SaaS**: Gerenciar o cadastro de municípios parceiros, usuários globais do sistema, vínculos institucionais e visualizar logs gerais de auditoria.

---

## ⚙️ Ciclo de Vida de um Relato

Cada ocorrência segue a seguinte máquina de estados no banco de dados:

```Java
graph TD
    ABERTO["Aberto"] --> EM_ANALISE["Em Análise"]
    EM_ANALISE --> ENCAMINHADO["Encaminhado"]
    ENCAMINHADO --> EM_ANDAMENTO["Em Andamento"]
    EM_ANDAMENTO --> PROGRAMADO["Programado"]
    PROGRAMADO --> CONCLUIDO["Concluído"]
    
    CONCLUIDO -->|"Confirmação do Morador"| CONCLUIDO_CONFIRMADO["Concluído e Confirmado"]
    CONCLUIDO -->|"Contestação do Morador"| REABERTO["Reaberto"]
    
    REABERTO --> EM_ANALISE
    ABERTO --> ARQUIVADO["Arquivado"]
    EM_ANALISE --> ARQUIVADO
```

---

## 💻 Stack Tecnológica

*   **Backend**: Java 21, Spring Boot, Spring Security (Autenticação baseada em JWT com cookies HttpOnly seguros), Spring Data JPA, Hibernate, PostgreSQL e Flyway.
*   **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Query (@tanstack/react-query) e Leaflet (OpenStreetMap).

---

## 🚀 Como Executar o Projeto

### Modo Completo (Docker Compose)
Inicia o banco de dados, o backend e o frontend juntos:
```bash
# 1. Copie o arquivo de variáveis de ambiente
copy .env.docker.example .env.docker

# 2. Suba o ambiente
docker compose up -d --build
```
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Backend (API)**: [http://localhost:8080](http://localhost:8080)

---

### Modo Híbrido (Desenvolvimento)
Inicia o banco de dados no Docker e executa a aplicação localmente para desenvolvimento:

1.  **Banco de Dados**:
    ```bash
    copy .env.example .env
    docker compose up -d postgres
    ```
2.  **Backend**:
    ```bash
    .\mvnw.cmd spring-boot:run
    ```
3.  **Frontend**:
    ```bash
    cd front
    npm install
    npm run dev
    ```

*   **Swagger da API**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
*   **Credenciais do Admin Local (`ADMIN_APP`)**:
    *   *Usuário*: `admin_app`
    *   *Senha*: `admin-local-dev-change-me` (definida no arquivo `.env`)

---

## 📂 Organização do Repositório

```text
├── src/main/java/com/mykael/prefeitura
│   ├── core/         # Regras de negócio (denúncia, feed, usuário, comentários)
│   └── infra/        # Segurança, JWT, expurgo de dados, storage
├── src/main/resources
│   ├── db/migration  # Scripts Flyway de banco de dados
│   └── application.yml
├── front/            # Código-fonte do frontend (React / TypeScript)
├── docs/             # Contrato de API e manuais técnicos
└── docker-compose.yml
```
