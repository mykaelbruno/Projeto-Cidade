# 🏙️ Cidade Ativa: Plataforma Inteligente de Zeladoria Urbana e Participação Cidadã

## 📌 1. Resumo Executivo (Executive Summary)

O **Cidade Ativa** é uma plataforma de Governança Digital, Zeladoria Urbana e Ouvidoria Inteligente (*GovTech* / *Civic Tech*) projetada para conectar de forma transparente e eficiente os cidadãos (**Moradores**) à administração pública municipal (**Prefeitura** e suas respectivas **Secretarias**). 

Ao contrário dos sistemas tradicionais de ouvidoria municipal (como os canais telefônicos 156), que atuam como caixas-pretas de protocolos individuais, o Cidade Ativa funciona como uma **rede social cívica georreferenciada**. A plataforma expõe visualmente os problemas de zeladoria de uma cidade — tais como buracos em vias, lâmpadas queimadas, descarte irregular de resíduos, vazamentos de água ou focos de dengue — em um feed público unificado e interativo. 

Os moradores podem registrar ocorrências com fotos e geolocalização exata via mapas integrados, além de interagir nos relatos de seus vizinhos através de apoios (upvotes), sinalizações de urgência e comentários públicos. Por outro lado, a administração pública dispõe de um robusto **ERP de Zeladoria Urbana**, com roteamento inteligente de demandas, controle de trâmite interdepartamental sem "jogo de empurra", histórico imutável em linha do tempo (*Timeline*), respostas oficiais automáticas, dashboards analíticos de performance e exportação de dados para auditoria.

---

## 👥 2. Modelo de Acesso e Governança (RBAC - Role-Based Access Control)

A plataforma utiliza um modelo hierárquico e multi-tenant (permitindo que múltiplas prefeituras coexistam no mesmo ecossistema de banco de dados) estruturado em seis papéis fundamentais de acesso:

1. **Morador (`MORADOR`)**: O usuário cidadão. Tem acesso ao feed regional de relatos da sua cidade, pode criar denúncias (públicas ou anônimas), anexar imagens, registrar geolocalização no mapa, apoiar relatos alheios, marcar ocorrências como urgentes, comentar e, crucialmente, **confirmar ou contestar a resolução do problema** após o encerramento do órgão público.
2. **Atendente de Secretaria (`ATENDENTE_SECRETARIA`)**: Servidor ou colaborador alocado em uma secretaria municipal específica (ex: Secretaria de Infraestrutura, Secretaria de Meio Ambiente). Pode visualizar os relatos atribuídos à sua secretaria, responder aos moradores e atualizar o andamento operacional básico da demanda.
3. **Administrador de Secretaria (`ADMIN_SECRETARIA`)**: Gestor da pasta municipal. Além de responder aos moradores, ele gerencia a equipe interna da secretaria, analisa as métricas de conclusão de demandas da sua respectiva pasta e solicita transferências formais de relatos caso estes tenham sido atribuídos incorretamente à sua secretaria.
4. **Administrador de Prefeitura (`ADMIN_PREFEITURA`)**: Gestor central do município (Prefeito, Ouvidor Geral ou equipe de Gestão Central). Possui visão holística de todas as secretarias, gerencia o cadastro de categorias e pastas municipais, modera conteúdos sinalizados por abuso, e atua como **mediador jurisdicional**, aprovando ou rejeitando solicitações de transferência de relatos entre secretarias e reatribuindo responsabilidades diretas.
5. **Moderador (`MODERADOR`)**: Agente neutro encarregado de verificar denúncias de abuso reportadas por moradores, excluindo comentários ofensivos ou relatos falsos (trotes) com registro formal de justificativa de moderação para preservar a ordem e civilidade da plataforma.
6. **Administrador do Sistema (`ADMIN_APP`)**: Super Administrador da infraestrutura SaaS. Possui acesso global a todas as prefeituras cadastradas, parametrizações globais do sistema, auditoria geral de logs e controle operacional absoluto do banco de dados.

---

## 🛠️ 3. Arquitetura e Engenharia de Funcionalidades

A plataforma é composta por três grandes pilares operacionais, detalhados a seguir:

### 3.1. Portal do Cidadão e Engajamento Cívico (Morador)

*   **Registro Georreferenciado de Ocorrências (Nova Denúncia)**:
    *   **Captura de Mídia**: Upload de anexos de imagens reais que servem como prova visual da infração ou do problema urbano (armazenados via serviço de uploads).
    *   **Geolocalização via Mapas**: Integração nativa com mapas interativos (utilizando Leaflet no frontend), permitindo ao morador pinçar a coordenada exata (`latitude` e `longitude`) da ocorrência.
    *   **Metadados de Endereço**: Preenchimento inteligente de Bairro, Cidade e Estado, garantindo o correto direcionamento regional da ocorrência.
    *   **Opção de Anonimato ("🤐 Denúncia Anônima")**: Visando proteger os cidadãos contra possíveis retaliações (especialmente em denúncias de descarte de entulho ou segurança urbana), o morador pode optar por ocultar seu nome na exibição pública. O sistema mascara a identidade no DTO de exibição, mas mantém o ID rastreável internamente pelo backend para fins legais.
*   **Feed Democrático e Inteligente**:
    *   **Filtros Avançados**: Busca refinada por Cidade, Bairro, Categoria do Problema (ex: Iluminação, Asfalto, Saneamento, Vigilância Sanitária), Status e Ordenação Dinâmica.
    *   **Modos de Visualização Dinâmicos**:
        *   *Recentes*: Ordenação puramente cronológica.
        *   *Em Alta (Populares)*: Ordenação ponderada pelo volume de engajamento social.
        *   *Misto*: Algoritmo que equilibra novas ocorrências com aquelas que possuem alta tração comunitária.
*   **Mecanismos de Validação Social (Crowdsourcing)**:
    *   **Apoiados (👍 Upvoting)**: Se um morador passa por um buraco que já foi relatado, ele não precisa abrir uma ocorrência duplicada. Ele clica em "Apoiar". Quanto mais apoios um relato possui, maior é o seu peso nos dashboards analíticos da prefeitura.
    *   **Sinalização de Urgência (🚨)**: Mecanismo onde moradores informam se o problema apresenta risco iminente de acidentes, danos patrimoniais ou ameaça à saúde pública, elevando o alerta de prioridade operacional do órgão governamental.
    *   **Discussão Pública e Feedback**: Seção de comentários aberta para debater desdobramentos da demanda operacional. Os moradores podem colaborar trazendo novas fotos ou atualizando a comunidade sobre visitas de equipes de manutenção.
    *   **Notificações em Tempo Real**: Central de alertas que avisa o cidadão no momento em que seu relato muda de fase operacional ou recebe uma resposta oficial da prefeitura.

---

### 3.2. ERP de Zeladoria Urbana e Gestão Operacional (Prefeitura & Secretarias)

*   **Painel Operacional Integrado**:
    *   Fila de trabalho unificada para os servidores, segmentada por cidade e responsabilidade da secretaria correspondente.
    *   Visualização rápida de indicadores operacionais: volume acumulado de demandas, status atual e alarmes de atrasos.
*   **Linha do Tempo Imutável (Timeline & Trilha de Auditoria)**:
    *   Cada relato é um processo administrativo digital com uma timeline inviolável. Toda alteração de status, transferência, comentário oficial, reabertura ou arquivamento gera um registro imutável com data, hora, autor e descrição detalhada da ação.
*   **Estados do Ciclo de Vida de um Relato**:
    ```mermaid
    graph TD
        ABERTO[Aberto] --> EM_ANALISE[Em Análise]
        EM_ANALISE --> ENCAMINHADO[Encaminhado]
        ENCAMINHADO --> EM_ANDAMENTO[Em Andamento]
        EM_ANDAMENTO --> PROGRAMADO[Programado]
        PROGRAMADO --> CONCLUIDO[Concluído]
        CONCLUIDO -->|Confirmação do Morador| CONCLUIDO_CONFIRMADO[Concluído & Confirmado]
        CONCLUIDO -->|Contestação do Morador| REABERTO[Reaberto]
        REABERTO --> EM_ANALISE
        ABERTO --> ARQUIVADO[Arquivado]
        EM_ANALISE --> ARQUIVADO
    ```
*   **Respostas Oficiais com Transição de Status**:
    *   Toda vez que a secretaria muda o status operacional do relato (ex: de *Aberto* para *Em Andamento* ou de *Programado* para *Concluído*), o sistema exige o registro de uma justificativa formal. Esta justificativa é convertida automaticamente pelo sistema em uma **Resposta Oficial** visível para toda a comunidade no feed público, eliminando a opacidade nos serviços de manutenção.
*   **Mecanismo Contra o "Jogo de Empurra" (Trâmite de Transferências)**:
    *   Se a categoria de um relato está incorreta (ex: um cidadão classificou um vazamento de água na categoria "Asfalto" e o sistema o direcionou automaticamente para a Secretaria de Infraestrutura, quando o correto seria a Companhia de Saneamento), a secretaria de origem não pode simplesmente ignorar o ticket.
    *   A secretaria de origem preenche uma **Solicitação de Transferência**, sugerindo o órgão de destino correto e justificando formalmente a falta de competência da sua pasta sobre a área.
    *   A demanda sobe para a mediação da prefeitura (`ADMIN_PREFEITURA`), que analisa o caso de forma imparcial. O gestor central pode aprovar a transferência (enviando o ticket para o novo órgão), recusar a transferência (exigindo que o órgão original resolva o problema sob justificativa fundamentada) ou realizar uma reatribuição direta a um terceiro setor responsável.

---

### 3.3. Accountability de Dupla Confirmação (Feedback Loop do Cidadão)

Um dos maiores diferenciais técnicos e metodológicos do Cidade Ativa é a quebra do monopólio do encerramento de chamados por parte do prestador de serviço público:

*   **Poder de Veto Cidadão**: Quando a equipe operacional da prefeitura executa o serviço de zeladoria, o status do relato é alterado para `CONCLUIDO`. No entanto, o chamado **não é arquivado imediatamente**.
*   **Fluxo de Resolução Homologada**:
    *   O morador que originou o chamado recebe uma notificação solicitando sua validação da obra.
    *   **Ação de Confirmação**: Caso o serviço tenha sido prestado de maneira satisfatória, o cidadão confirma a resolução, adicionando um feedback textual. O relato transiciona para um estado finalizado definitivo (`CONCLUIDO_CONFIRMADO`).
    *   **Ação de Contestação**: Caso o cidadão verifique que a equipe pública apenas "maquiou" o problema ou não realizou o serviço adequadamente (ex: tapou um buraco de forma inadequada e na primeira chuva o asfalto cedeu), ele clica em **Contestar**.
    *   **Reabertura Operacional Automatizada**: Ao contestar, o morador adiciona sua justificativa de falha operacional. O relato é automaticamente reaberto pelo sistema, retornando para o status `REABERTO` e voltando à fila operacional prioritária da secretaria responsável, com o histórico da falha registrado na timeline pública.

---

### 3.4. Inteligência de Dados e Tomada de Decisão (Analytics)

O sistema conta com um poderoso console de Business Intelligence (BI) focado em Zeladoria de Precisão:

*   **KPIs Fundamentais de Performance**:
    *   *Total de Demandas Registradas / Atribuídas*.
    *   *Taxa de Conclusão Confirmada*: Percentual de ordens de serviço executadas pela prefeitura que receberam a chancela positiva direta do cidadão.
    *   *Taxa de Reabertura (Churn de OS)*: O percentual de serviços operacionais reprovados pelos moradores, revelando eventuais gargalos de qualidade técnica na equipe de obras ou empreiteiras licitadas.
    *   *Tempo Médio de Solução (MTTR - Mean Time To Resolution)*: O tempo médio exato (calculado em horas pelo backend com base nos timestamps das transições de status) decorrido entre a abertura do relato e a validação final do cidadão.
*   **Geointeligência de Demandas**:
    *   Ranking e agregação volumétrica dos **Bairros com maior número de demandas**, permitindo ao poder público planejar mutirões e investimentos estruturais focados nas regiões mais degradadas.
    *   Ranking das **Categorias mais demandadas**, apontando se o gargalo do município no momento está em saneamento básico, iluminação pública ou asfalto.
*   **Exportação de Relatórios Operacionais**: Geração de relatórios operacionais completos em formato CSV sob demanda, permitindo auditorias e integrações externas por órgãos reguladores, tribunais de contas ou movimentos de transparência pública.

---

## 💎 4. Diferenciais Competitivos (Por que o Cidade Ativa é Único?)

Ao apresentar a plataforma a novos desenvolvedores, investidores ou gestores públicos, os seguintes diferenciais devem ser destacados:

1.  **Priorização Coletiva Baseada em Engajamento Cívico (Crowdsourced Backlog)**: Em vez de atender chamados estritamente por ordem de chegada cronológica ou conexões políticas, o Cidade Ativa fornece uma lista de prioridades operacionais gerada dinamicamente pelos próprios cidadãos através do volume de apoios (👍) e urgências (🚨). O poder público consegue atuar cirurgicamente nos problemas que impactam o maior número de moradores simultaneamente.
2.  **Validação Cidadã Final (Accountability Absoluto)**: Elimina o falso indicador de produtividade estatal. A prefeitura não consegue mascarar dados de eficácia, pois o encerramento real do ticket exige a confirmação do cidadão prejudicado. Isso eleva drasticamente a qualidade das obras públicas urbanas.
3.  **Trilha Operacional Contra o Clássico "Jogo de Empurra"**: Ao centralizar e formalizar as solicitações de transferência operacional entre secretarias sob a tutela do Administrador da Prefeitura, a plataforma mitiga o corporativismo burocrático de omissão, agilizando drasticamente o início da resolução das obras.
4.  **Transparência Radical como Estímulo de Gestão**: A exibição de ocorrências em um feed social público cria uma cobrança natural e saudável. A administração pública busca responder e agir com maior velocidade, pois seu nível de eficiência operacional (tempo médio de resposta, taxa de conclusão) fica exposto à crítica ou elogio dos eleitores e órgãos de fiscalização social.
5.  **Tecnologia Corporativa Pronta para Integrações**: Construído sobre uma arquitetura robusta de APIs em Spring Boot e gerenciamento reativo de estado no frontend com React Query, o sistema é altamente escalável, pronto para se integrar a sistemas legados de geoprocessamento municipal, semáforos inteligentes ou sensores de internet das coisas (IoT).

---

## 💻 5. Visão de Engenharia de Software (Tech Stack)

Para contextualizar sistemas externos e inteligências artificiais na manutenção do código:

*   **Arquitetura Backend (Java & Spring Ecosystem)**:
    *   *Framework*: **Spring Boot** (desenvolvimento ágil de microsserviços e APIs RESTful).
    *   *Segurança*: **Spring Security** com autenticação baseada em JWT para comunicação stateless segura com o frontend, protegendo endpoints do morador e barramentos operacionais restritos aos operadores.
    *   *Acesso a Dados*: **Spring Data JPA** com Hibernate como provedor de persistência relacional.
    *   *Módulos Funcionais*: Estrutura dividida no pacote `core` contendo submódulos altamente especializados e desacoplados (`denuncia`, `feed`, `comentario`, `notificacao`, `moderacao`, `operacional`, `anexo`, `usuario`, `vinculo`, etc.).
*   **Arquitetura Frontend (React Single Page Application)**:
    *   *Runtime / Bundler*: **React** com Vite, garantindo tempos rápidos de compilação e carregamento.
    *   *Gerenciamento de Requisições e Caching*: **React Query (@tanstack/react-query)**, responsável pela sincronização de estado com o servidor, invalidação e atualização reativa do Feed e das Timelines sem recarregamentos manuais de página.
    *   *Roteamento*: **React Router Dom** para controle estrito de rotas protegidas (por exemplo, bloqueio de telas do Painel Operacional para usuários com papel de Morador).
    *   *Estilização e Layout*: **Tailwind CSS** (ou classes utilitárias modernas e responsivas), garantindo design responsivo fluido com excelente adaptabilidade móvel e transições suaves.
    *   *Mapas*: **Leaflet** com mapas OpenStreetMap, fornecendo plotagem robusta de marcadores, cálculo de coordenadas de geolocalização e interface otimizada para toque em dispositivos móveis.
