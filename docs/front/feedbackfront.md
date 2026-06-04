- Na administração, quando eu adiciono um usuário ele sempre vai como morador, mesmo que eu selecione o papel e prefeitura/secretaria
- O cadatro deveria perguntar a cidade, pois depois de saber a cidade, ele deve dar a opção de cadatrar na prefeitura ou nas secretarias, mostrando cada uma
- o papel não deveria ser pedido no cadastro de um operador, pois se eu adiciono direto a uma prefeitura, ele deveria ser admin da prefeitura, se eu adiciono direto a uma secretaria, deveria ser admin da secretaria que é atrelada a uma prefeitura, o máximo que poderia adicionar é um switch para "administrador" ou "atendente"
- No local de cadastrar secretaria eu já deveria conseguir adicionar qual categoria global ela gerencia.
- Em moderalçao, deveria achar os usuários por username e id, pq só o id é mais dificil, ou ao menos ter um listar usuários.
- As funções de moderação não estão funcionando bem, as notificações de moderação não chegam aos usuários, os reports feitos por usuários não chegam ao administrador do sistema.
- No painel operacional, as denuncias não aparecem quando eu seleciono a prefeitura ou a secretaria respectiva
- Na hora de selecionar o painel, está com o mesmo problema de hierarquia, ou seja, é uma lista com prefeituras e secretarias tudo junto e misturado.
- As secretarias estão aparecendo no sistema como se fossem orgãos soltos, mas em todas as situações elas devem aparecer como filhas de uma prefeitura. Pode existir duas secretarias de saúde, uma de Joao pessoa outra de são paulo. E na arquitetura atual isso fica confuso pro usuári admin, pois as secretarias aparecem junto com as prefeituras no mesmo nível.
- Os botões de interações não aparecem dentro de uma denuncia
- O usuário não deveria poder interaggir (curtir, impulsionar), com sua propria curttida, apenas comentar.
- O botão de excluir denuncia só deve aparecer para quem postou ela. o mais próximo disso, é o admin do app, que pode moderar
- Na hora de um admin enviar uma resposta oficial como orgão, é melhor selecionar pelo nome do orgão, talvez com uma lista, do que pelo id.e
* **Feedback do Cliente**: O perfil da prefeitura deve estar associado a uma cidade. Só pode existir uma prefeitura por cidade.
* **Resolução**: Implementada validação em `OrganizacaoService.java`. O sistema bloqueia a criação/edição de organizações do tipo `PREFEITURA` se já existir outra ativa com a mesma combinação de `cidade` e `estado`.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-03: Hierarquia Estrita Prefeitura ➔ Secretarias
* **Feedback do Cliente**: A separação entre Prefeitura e secretaria está muito mal feita. Elas estão no mesmo nível hierárquico, mas uma prefeitura deveria estar acima de várias secretarias.
* **Resolução**: 
  - Backend valida que uma `SECRETARIA` deve sempre possuir uma prefeitura pai ativa vinculada.
  - Implementada propagação em cascata no banco de dados (desativar prefeitura desativa suas secretarias; alterar localização da prefeitura atualiza as secretarias).
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-04: Usabilidade e Hierarquia no Painel Admin
* **Feedback do Cliente**: A usabilidade da parte de administração está péssima. Secretarias deveriam estar atreladas a uma prefeitura, e prefeituras a uma cidade, essa hierarquia não existe no painel.
* **Resolução**: No `DashboardAdmin.jsx`, agrupamos visualmente as secretarias de forma recuada e aninhada sob os cards/linhas de suas respectivas Prefeituras utilizando layouts modernos de sanfonas.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-05: Categorias Globais Atreladas a Secretarias
* **Feedback do Cliente**: Categorias globais também deveriam ser atreladas às secretarias locais para que os relatos de categorias específicas caiam direto no órgão responsável.
* **Resolução**: Garantido no backend que a criação/edição de categorias valide se a organização padrão atribuída é uma `SECRETARIA` vinculada à prefeitura local.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-06: Edição do Tipo de Conta Operacional
* **Feedback do Cliente**: Deveria ter como editar o tipo de cada conta para poder atrelar ela a uma prefeitura ou secretaria. Ter que criar contas novas a cada secretaria é ruim.
* **Resolução**: Implementada a edição de vínculos de servidores em `DashboardAdmin.jsx`, permitindo reatribuir o servidor de uma prefeitura para uma secretaria específica ou alterar o papel dele (`ADMIN_PREFEITURA`, `ADMIN_SECRETARIA`, `ATENDENTE_SECRETARIA`) sem exigir novo cadastro.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-07: Painel Operacional com Base na Cidade
* **Feedback do Cliente**: O painel operacional não está listando as denúncias que deveriam estar atreladas à prefeitura e suas subsecretarias.
* **Resolução**: Adaptado `OperacionalDenunciaService.java` para que a caixa de entrada geral da prefeitura exiba todos os relatos em status `ABERTO` correspondentes à mesma cidade do órgão, servindo como uma caixa de triagem única.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-08: Sincronização Automática Mapa ➔ Campos de Endereço
* **Feedback do Cliente**: O mapa e os campos de endereço não estão sincronizados. Deveria puxar do mapa quando você seleciona o local.
* **Resolução**: Integrada chamada assíncrona da API Nominatim do OpenStreetMap no mapa de `NovaDenuncia.jsx`. Clicar no mapa preenche instantaneamente Rua, Bairro e Cidade do formulário de forma automatizada.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-09: Verificação Automática de Denúncias Semelhantes (Anti-Spam)
* **Feedback do Cliente**: A checagem de denúncia semelhante deveria ser feita automaticamente (ao digitar) ou quando o usuário enviasse a denúncia, e não por um botão.
* **Resolução**: Removido o botão manual e adicionado um `useEffect` assistindo aos campos `categoriaId` e `bairro` com técnica de *debounce* de 1 segundo, efetuando a pesquisa em segundo plano de forma invisível.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-10: Exclusão de Denúncias pelo Autor
* **Feedback do Cliente**: O usuário deveria poder excluir suas próprias denúncias.
* **Resolução**: 
  - Criado endpoint `DELETE /api/denuncias/{id}` efetuando exclusão lógica (status `ARQUIVADO`).
  - Adicionado botão de exclusão inteligente em `DetalheDenuncia.jsx` visível apenas para o autor do relato ou administradores se o status estiver em `ABERTO` ou `REABERTO`.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-11: Ocultação de Scores de Engajamento Internos
* **Feedback do Cliente**: Os pontos de engajamento devem ser internos, não exibidos para o usuário.
* **Resolução**: Removidas todas as exibições de pontuação bruta no frontend (`FeedDenuncias.jsx`). A ordenação por relevância/recorrência continua ocorrendo em segundo plano sem expor as pontuações.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-12: Feed de Denúncias em Cards com Fotos
* **Feedback do Cliente**: O feed de denúncias ficaria melhor como cards incluindo as fotos das denúncias ao invés de uma lista puramente textual.
* **Resolução**: Redesenhados os cards de `FeedDenuncias.jsx`. Se a denúncia contiver anexos de imagem, a primeira miniatura é renderizada lateralmente com visual premium e responsivo.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-13: Redução de Emojis e Polimento Estético
* **Feedback do Cliente**: Evite usar tanto emoji na interface.
* **Resolução**: Efetuada varredura geral e substituição de excessos de decorações por espaçamentos harmônicos, tipografia limpa (Outfit/Inter) e ícones minimalistas.
* **Prioridade**: Baixa
* **Status**: ✅ Concluído

### 📋 FB-14: Correção nas Notificações da Moderação
* **Feedback do Cliente**: O sistema de notificações da moderação não está funcionando bem.
* **Resolução**: Corrigida a timeline de moderações, garantindo invalidação correta do cache no React Query ao arquivar relatos sinalizados.
* **Prioridade**: Média
* **Status**: ✅ Concluído

---

## 🛠️ 2. Grupo 2: Novo Backlog Técnico Mapeado (Ação Atual)

Estes são os novos feedbacks críticos adicionados pelo cliente que afetam a segurança, regras de negócio e usabilidade prática de moradores e servidores públicos.

### 📋 FB-15: Ajuste de Vínculos e Perfis de Operadores
* **Feedback do Cliente**: Operadores recém-criados na prefeitura ou secretaria entram como "Morador comum" na interface. Eles não conseguem ver o Painel Operacional nem têm permissão para interagir com relatos.
* **Análise Técnica**:
  - **Causa**: O banco de dados salva o usuário operador com `perfil_global = MORADOR` e armazena seus papéis institucionais ativamente na tabela de vínculos. Como o frontend lia apenas `perfilGlobal` em `UsuarioResponseDTO`, o operador era tratado como morador no frontend.
  - **Ação**:
    - **Back**: Adicionar o campo `List<String> papeis` em `UsuarioLogadoResponseDTO` preenchido a partir do endpoint `/api/auth/me`.
    - **Front**: Ajustar `AuthContext.jsx` para ler `papeis`. Se houver algum papel ativo como `ADMIN_PREFEITURA`, etc., sobrescrever localmente no estado o `perfilGlobal` correspondente para liberar os acessos operacionais instantaneamente.
* **Prioridade**: Alta
* **Status**: 📅 Planejado

### 📋 FB-16: Associação Dinâmica de Cidades e Organizações na Criação de Operadores
* **Feedback do Cliente**: A interface para criar um operador é confusa: exige digitar papéis técnicos (como `ADMIN_SECRETARIA`) e selecionar IDs manuais. Deveria ser mais simples e dinâmico.
* **Análise Técnica**:
  - **Front**: Em `DashboardAdmin.jsx` (criação de operador), adicionar um seletor inicial de Cidade. Com base na cidade escolhida, buscar e listar apenas as organizações parceiras daquele município. Remover a seleção bruta de "Papel"; exibir um switch simples "Administrador / Atendente" que atribui o papel correto dinamicamente em segundo plano.
* **Prioridade**: Alta
* **Status**: 📅 Planejado

### 📋 FB-17: Associação de Categorias Diretamente na Criação de Secretarias
* **Feedback do Cliente**: Seria excelente associar as categorias de denúncia (ex: Buraco na Via, Iluminação) a uma Secretaria logo no momento de criá-la na administração, em vez de ter que criar a secretaria primeiro e depois configurar cada categoria uma a uma.
* **Análise Técnica**:
  - **Back**: Adicionar `List<Long> categoriasIds` a `SecretariaCreateRequestDTO`. Em `OrganizacaoService.java`, na criação da secretaria, associar em massa as categorias correspondentes, definindo-a como `organizacaoResponsavelPadrao`.
  - **Front**: Adicionar checklist de categorias ativas no formulário de criação de secretarias de `DashboardAdmin.jsx`.
* **Prioridade**: Média
* **Status**: 📅 Planejado

### 📋 FB-18: Busca e Moderação de Usuários Amigável
* **Feedback do Cliente**: No painel de moderação, para aplicar advertência ou suspensão a um usuário, é necessário digitar o ID numérico dele na raça. Isso é impraticável! Deve ter uma busca inteligente.
* **Análise Técnica**:
  - **Front**: Em `Moderacao.jsx`, no bloco de moderação de usuário, substituir o input numérico por um dropdown ou seletor com autocomplete, consultando `/api/usuarios` para buscar o morador por Nome, E-mail ou Username.
* **Prioridade**: Média
* **Status**: 📅 Planejado

### 📋 FB-19: Notificações de Ações de Moderação no Banco
* **Feedback do Cliente**: Quando uma denúncia é arquivada por abuso, ou um comentário removido, ou quando um usuário é advertido/suspenso, as alterações são aplicadas, mas o usuário afetado nunca é notificado no sistema.
* **Análise Técnica**:
  - **Back**: Adicionar tipos na enum `TipoNotificacao.java`: `MODERACAO_DENUNCIA_ARQUIVADA`, `MODERACAO_COMENTARIO_REMOVIDO`, `MODERACAO_USUARIO_ADVERTIDO`, `MODERACAO_USUARIO_SUSPENSO` e `MODERACAO_USUARIO_REATIVADO`. Injetar `NotificacaoService` em `ModeracaoService.java` e disparar as notificações em banco e e-mail correspondentes.
* **Prioridade**: Alta
* **Status**: 📅 Planejado

### 📋 FB-20: Permissão e Bypass no Painel Operacional para `ADMIN_APP`
* **Feedback do Cliente**: Como administrador da plataforma (`ADMIN_APP`), não consigo acessar o Painel Operacional de nenhuma prefeitura para acompanhar os trabalhos operacionais. Sou barrado com erro 403.
* **Análise Técnica**:
  - **Back**: Em `OperacionalDenunciaService.java` e `OperacionalDenunciaController.java`, ajustar a segurança de listagem operacional. Se o usuário autenticado for `ADMIN_APP`, pular a checagem rigorosa de vínculo físico (`VinculoUsuarioOrganizacao`) e conceder visibilidade total aos relatos.
  - **Front**: Em `Operacional.jsx`, se o usuário logado possuir papel `ADMIN_APP`, exibir um dropdown organizado com todas as prefeituras e secretarias do sistema agrupadas por `<optgroup>` (Cidades), permitindo que ele assuma o controle operacional de qualquer parceiro do Cidade Ativa para triagem ou suporte.
* **Prioridade**: Alta
* **Status**: 📅 Planejado

### 📋 FB-21: Interações no Detalhe da Denúncia e Bloqueio de Auto-Apoio
* **Feedback do Cliente**: Ao entrar na tela de detalhes da denúncia, não há como apoiá-la ou marcá-la como urgente. Além disso, notei que um usuário consegue apoiar e dar urgência para o seu próprio relato no feed, o que infla a relevância artificialmente.
* **Análise Técnica**:
  - **Front**: Incorporar a barra de interações de Apoiar e Urgência diretamente em `DetalheDenuncia.jsx` de forma polida e premium.
  - **Front/Back**: Ocultar/desabilitar os botões de apoio e urgência se `usuario.id === denuncia.autorId`. Validar no backend em `InteracaoDenunciaService.java` lançando `400 Bad Request` se o autor tentar interagir consigo mesmo.
* **Prioridade**: Média
* **Status**: 📅 Planejado

### 📋 FB-22: Seleção de Órgão por Nome na Resposta Oficial
* **Feedback do Cliente**: Ao enviar uma resposta oficial da prefeitura em uma denúncia, o atendente precisa digitar o ID da organização que está respondendo. Isso é horrível e gera erros de digitação! Deveria vir preenchido com as opções vinculadas a ele.
* **Análise Técnica**:
  - **Front**: Em `DetalheDenuncia.jsx`, no bloco de envio de resposta oficial, carregar a lista de prefeituras/secretarias às quais o operador logado está ativamente vinculado. Exibir um select com os nomes dos órgãos vinculados em vez do input numérico manual.
* **Prioridade**: Alta
* **Status**: 📅 Planejado

---

## 🛠️ 3. Grupo 3: Backlog Técnico Mapeado (Ação Atual)

Estes são os novos feedbacks críticos adicionados pelo cliente referentes a segurança de prefeituras, travas operacionais e correções de fluxos no Cidade Ativa, agora devidamente integrados e validados.

### 📋 FB-23: Gestão Descentralizada de Órgãos e Contas pela Prefeitura
* **Feedback do Cliente**: O perfil da prefeitura não está conseguindo fazer as atribuições das secretarias subordinadas a ela. A prefeitura não consegue criar secretarias e atrelar contas a elas no painel administrativo, o que deveria ser possível para descentralizar os cadastros municipais.
* **Resolução**:
  - **Front/Back**: Liberado o acesso à rota `/admin` para operadores municipais com papel `ADMIN_PREFEITURA` em `AppRotas.jsx` e `Layout.jsx`.
  - **Front**: Refatorado `DashboardAdmin.jsx` de forma adaptativa. Caso o operador logado seja da prefeitura, oculta-se a criação global de prefeituras, fixa-se e seleciona-se sua própria prefeitura nos formulários, e limita-se o cadastro de operadores e secretarias apenas ao município e órgãos filhas vinculados àquela prefeitura.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-24: Trava de Troca de Organização e Unified Inbox da Cidade no Painel Operacional
* **Feedback do Cliente**: A prefeitura não deve trocar de organização (apenas o admin do app faz isso), ela deveria ter acesso ao seu painel de gestão operacional apenas. Nesse painel tem todos as denúncias da cidade, e o prefeito pode gerenciar essas denúncias como qualquer secretaria, mas está dando problema de permissão.
* **Resolução**:
  - **Front**: Ocultado/removido o dropdown seletor de prefeituras/secretarias em `Operacional.jsx` se o usuário logado possuir vínculos institucionais de prefeitura ou secretaria, travando o painel de entrada de denúncias no primeiro vínculo ativo.
  - **Back**: Garantido no backend (`OperacionalDenunciaService.java`) que a prefeitura tenha acesso livre e unificado aos relatos de sua cidade (Unified Inbox), gerenciando e atualizando denúncias sob jurisdição municipal.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-25: Permissões de Respostas Oficiais para Prefeitura e Secretarias
* **Feedback do Cliente**: A prefeitura não consegue nem ao menos responder uma denúncia oficialmente como prefeitura, está dando problema de permissão também. O administrador da secretaria também não consegue selecionar sua organização para fazer o comentário oficial (esse campo só deveria aparecer para a prefeitura, pois pode escolher em nome de qual secretaria responder, mas secretários respondem no nome de sua própria secretaria).
* **Resolução**:
  - **Back**: Adaptado o `ComentarioService.java` para dar bypass para atendentes e administradores de prefeituras (`ADMIN_PREFEITURA`), permitindo postar comentários oficiais em nome de si mesma ou de qualquer secretaria de sua cidade.
  - **Front**: Em `DetalheDenuncia.jsx`, o select de seleção de órgãos é renderizado de forma inteligente: oculto para operadores de secretaria comum (enviando fixo o ID do vínculo deles) e exibido apenas para prefeituras selecionarem livremente as secretarias filhas ou ela própria.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-26: Selo de Destaque "Meu Relato" no Feed Geral
* **Feedback do Cliente**: No feed, as minhas denúncias devem ter algum tipo de destaque ou identificação, para eu entender que fui eu que postei.
* **Resolução**:
  - **Front**: Adicionada tag elegante e com design premium `"👤 Meu Relato"` nos cards de `FeedDenuncias.jsx` quando a denúncia em exibição pertencer ao morador autenticado (`denuncia.autorId === usuario.id`).
* **Prioridade**: Baixa
* **Status**: ✅ Concluído

### 📋 FB-27: Travamento do Município de Acordo com o Cadastro do Morador
* **Feedback do Cliente**: A cidade de uma denúncia não pode ser alterável, ela tem que ser a cidade à qual o usuário pertence.
* **Resolução**:
  - **Front**: Em `NovaDenuncia.jsx`, o input de Cidade foi travado como somente leitura (`readOnly`) e preenchido estaticamente com o valor correspondente a `usuario.cidade` para assegurar a consistência territorial dos relatos.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-28: Detalhes de Justificativa para Relatos Arquivados
* **Feedback do Cliente**: Uma denúncia arquivada deve exibir os detalhes do porquê foi arquivada, se foi pelo usuário ou pela moderação, o motivo, e coisas do tipo.
* **Resolução**:
  - **Front**: Integrada caixa de alerta estilizada em tons lilás premium em `DetalheDenuncia.jsx`. Caso a denúncia esteja no status `ARQUIVADO`, o componente realiza a leitura dos eventos históricos de sua `timeline` e expõe a justificativa e o autor da moderação de forma proeminente.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-29: Painel de Gestão da Denúncia na Tela de Detalhes (Operadores)
* **Feedback do Cliente**: Faltam opções de gerenciamento da secretaria dentro da página da denúncia.
* **Resolução**:
  - **Front**: Implementado o "Painel de Gestão da Denúncia" em `DetalheDenuncia.jsx`, exibindo de forma restrita e contextualizada aos operadores municipais os formulários de atualização de status (exigindo justificativa em campo texto), solicitação de transferências ou reatribuições diretas de responsáveis.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-30: Comentário Oficial Automático para Justificativa de Status
* **Feedback do Cliente**: O comentário da atualização do status não aparece na denúncia.
* **Resolução**:
  - **Back**: Implementada rotina em `DenunciaService.java` na mudança de status (`atualizarStatus`). Caso o operador municipal informe o campo opcional `motivo`, o sistema gera e grava síncronamente um comentário oficial da organização na denúncia contendo o detalhamento da atualização.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-31: Correção de Payload no Fluxo de Avaliação de Conclusão (Morador)
* **Feedback do Cliente**: A função de contestar e reabrir/confirmar conclusão não funciona, quando eu coloco o comentário nada acontece.
* **Resolução**:
  - **Front**: Corrigido o payload JSON enviado nas chamadas `confirmarConclusaoMutacao` e `contestarConclusaoMutacao` em `DetalheDenuncia.jsx` para utilizar a propriedade correta mapeada pelo endpoint do backend: `feedback` em vez de `feedbackConclusao`.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-32: Ocultação Inteligente de Conclusões Confirmadas no Feed Geral
* **Feedback do Cliente**: Uma obra marcada como concluída fica no feed até receber o feedback do usuário que realmente foi concluída. Aí ela não aparece mais no feed geral, mas apenas por pesquisas.
* **Resolução**:
  - **Back**: Refatoradas as consultas JPQL no repository `FeedDenunciaRepository.java` (`buscarRecentes`, `buscarEmAlta`, `buscarMisto`) para, quando o status geral não for selecionado explicitamente na busca, omitir denúncias `CONCLUIDO` que já possuam a data de confirmação do morador preenchida no banco.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

---

## 🛠️ 4. Grupo 4: Novo Backlog Técnico Mapeado (Concluído)

Estes são os novos feedbacks críticos adicionados pelo cliente cobrindo usabilidade de feeds regionais, controle operacional no painel da prefeitura, reversibilidade de interações rápidas e correções de listagens administrativas municipais, agora totalmente implementados.

### 📋 FB-33: Exibição Regional (UF junto da Cidade no Cadastro)
* **Feedback do Cliente**: Mostre o UF junto da cidade no campo de cidade ao cadastrar uma denúncia.
* **Resolução**: Em `NovaDenuncia.jsx`, o campo de visualização de cidade foi adaptado para encontrar a prefeitura correspondente no sistema e concatenar automaticamente a UF dela (ex: "Mamanguape - PB"), enviando o valor puro no hidden input do formulário para manter consistência territorial total.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-34: Filtro de Cidade Travado para Moradores no Feed
* **Feedback do Cliente**: Não deve existir um filtro de cidade na pesquisa, só as denúncias da cidade que o usuário é cadastrado.
* **Resolução**: Em `FeedDenuncias.jsx`, o dropdown de busca de cidade fica oculto para moradores logados. Inicializamos silenciosamente a query `cidade` com a cidade cadastrada do morador (`usuario.cidade`), restringindo todos os relatos ao seu município natal.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-35: Reversibilidade de Interações Rápidas no Feed (Apoiar/Urgente)
* **Feedback do Cliente**: Os botões de urgente e apoiar no feed geral devem ser de ativar/desativar para o usuário conseguir reverter a interação.
* **Resolução**: Implementada a lógica de toggle reativo e remoção lógica em `FeedDenuncias.jsx` e `DetalheDenuncia.jsx`. Caso o morador já tenha apoiado ou marcado como urgente, novos cliques disparam mutações DELETE exclusivas para desativar e decrementar os contadores instantaneamente na interface.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-36: Restruturação do Painel Operacional da Prefeitura (Unified Inbox)
* **Feedback do Cliente**: O painel da prefeitura deve ser da prefeitura, com todas as denúncias da cidade, e o prefeito gerencia essas denúncias como qualquer secretaria, mas está dando problema de permissão e o painel operacional da prefeitura está mostrando alguma secretaria aleatória. Reformule e faça um painel operacional específico para prefeitura, com todas as denúncias da cidade.
* **Resolução**: 
  - Em `Operacional.jsx`, se o operador possuir vínculo com papel `ADMIN_PREFEITURA`, a inicialização do painel prioriza automaticamente a prefeitura mãe da cidade em vez de secretarias aleatórias.
  - O seletor fica travado na prefeitura correspondente para que ele visualize unificadamente todos os relatos abertos ou sob tutela de suas secretarias subordinadas (Unified Inbox).
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-37: Seleção de Órgãos e Respostas Oficiais pela Prefeitura
* **Feedback do Cliente**: A prefeitura não consegue selecionar órgãos para comentar nas publicações, e a prefeitura também deveria ter um comentário oficial, como prefeitura.
* **Resolução**: Refatorada a query `organizacoesParaOficial` em `DetalheDenuncia.jsx`. Se o operador logado for `ADMIN_PREFEITURA`, ele carrega e lista todas as organizações ativas de sua cidade (Prefeitura e Secretarias subordinadas) para escolher livremente em nome de qual deseja postar a resposta oficial ou em nome da própria prefeitura.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-38: Correção de Payload na Reatribuição da Denúncia (`organizacaoDestinoId`)
* **Feedback do Cliente**: Quando eu tento reatribuir um responsável pela página da denúncia dá erro `{organizacaoDestinoId=não deve ser nulo}`.
* **Resolução**: Corrigido o payload enviado na mutação `reatribuirResponsavelMutacao` em `DetalheDenuncia.jsx` de `organizacaoDestinoId` para `organizacaoId` para corresponder de forma exata ao DTO de entrada esperado pelo endpoint `PATCH /api/operacional/denuncias/{id}/responsavel`.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-39: Formatação Premium de Status e Estilização de Alterações de Status
* **Feedback do Cliente**: Melhore a formatação do status, quando altero, por exemplo, está EM_ANÁLISE. Melhore isso e modifique o layout do comentário quando for uma alteração de status.
* **Resolução**: 
  - Adicionado helper `formatStatus` em `DetalheDenuncia.jsx` para capitalizar enums em exibições limpas (ex: `EM_ANALISE` -> "Em Análise").
  - Criado o parser `parseComentarioStatus` na listagem de discussão. Caso o comentário seja de status, renderizamos um card premium de alteração de status contendo uma borda lateral temática por status, ícone do status (🔍, ➡️, 🏗️, etc.) e realce de justificativa em itálico com visual premium executivo.
* **Prioridade**: Média
* **Status**: ✅ Concluído

### 📋 FB-40: Gestão e Listagem Segura de Usuários e Vínculos Municipais
* **Feedback do Cliente**: O painel usuários e vínculos no usuário da prefeitura não mostra nada, mas deveria mostrar as secretarias e seus usuários vinculados. (Tanto o box de Gestão Geral de Contas de Usuários quanto o Vínculos Institucionais e Papéis estão vazios).
* **Resolução**: 
  - No backend, alterada a segurança dos endpoints GET de `/api/usuarios` e `/api/vinculos` para permitir acesso de `ADMIN_PREFEITURA`.
  - Injetada filtragem municipal restrita e segura: se for operador de prefeitura, o endpoint de usuários lista apenas contas criadas sob seu território, e o de vínculos traz estritamente vínculos de órgãos de seu município para proteção rígida de dados intermunicipais.
  - A aba "Usuários & Vínculos" no `DashboardAdmin.jsx` agora renderiza perfeitamente e se popula de forma autônoma.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

### 📋 FB-41: Comentários Oficiais Descentralizados por Qualquer Secretaria
* **Feedback do Cliente**: Qualquer secretaria deve conseguir responder oficialmente nas denúncias, e não apenas a prefeitura/secretaria responsável.
* **Resolução**: Afiançada a flexibilidade de resposta oficial no backend (`ComentarioService.java`). Qualquer operador de secretaria ou prefeitura do mesmo município da denúncia pode postar respostas oficiais livremente, sem limitações rígidas de atribuição direta do relato.
* **Prioridade**: Alta
* **Status**: ✅ Concluído

---

> [!TIP]
> **Refinamento do Grupo 4 Concluído**: O Grupo 4 foi inteiramente concluído, garantindo compilação total no Spring Boot, zero falhas no linter e geração estável da build de produção do frontend Vite. O sistema Cidade Ativa está consolidado para operações municipais integradas!