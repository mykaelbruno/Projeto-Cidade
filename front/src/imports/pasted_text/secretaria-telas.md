Crie/complete no Figma apenas as telas do perfil SECRETARIA para o projeto já existente.

Não recontextualize o produto. O projeto já existe no Figma com telas de Morador e Prefeitura. Use a identidade visual, componentes, espaçamentos, tokens, linguagem, padrões de navegação, botões, tabelas, cards, modais e responsividade que já existem no Figma. Ignore qualquer front-end antigo ou rascunhado; ele serve apenas como referência funcional do que precisa existir, não como referência visual.

Objetivo das telas:
Criar a experiência operacional de uma secretaria municipal logada, para os perfis:
- ADMIN_SECRETARIA
- ATENDENTE_SECRETARIA

Esses perfis atuam sobre uma secretaria específica. Eles não administram a cidade toda e não fazem gestão ampla de usuários/órgãos. A função principal é atender denúncias atribuídas à sua secretaria.

Escopo funcional obrigatório das telas de Secretaria:

1. Painel Operacional da Secretaria

Criar uma tela principal de dashboard operacional da secretaria.

Ela deve abrir diretamente no contexto da secretaria vinculada ao usuário. Não deve haver seletor manual de organização para secretaria.

Conteúdo da tela:
- Título: “Painel da Secretaria” ou “Gestão Operacional”
- Nome da secretaria no cabeçalho, exemplo: “Secretaria de Infraestrutura”
- Subtítulo funcional, exemplo: “Atendimento, atualização de status e acompanhamento dos relatos atribuídos à sua secretaria.”
- Estado de vínculo/carregamento:
  - Carregando vínculo operacional
  - Erro ao carregar vínculo
  - Usuário sem vínculo ativo com secretaria

Cards/resumo no topo:
- Total de relatos atribuídos
- Taxa de conclusão confirmada pelo morador
- Taxa de reabertura/contestação
- Tempo médio até confirmação final
- Relatos em andamento
- Relatos reabertos ou que exigem atenção

Blocos analíticos:
- Bairros com mais demandas
- Categorias mais demandadas
- Opcional: ranking simples de urgência/engajamento
- Opcional: últimas movimentações operacionais

Importante:
A secretaria deve ver apenas dados da sua própria secretaria, não dados agrupados de toda a prefeitura.

2. Lista de Denúncias da Secretaria

Criar uma seção/tela de listagem operacional de denúncias atribuídas à secretaria.

Organização funcional:
- Cabeçalho da seção: “Relatos sob responsabilidade da secretaria”
- Botão de ação: “Exportar relatório CSV”
- Barra de filtros acima da tabela/lista:
  - Cidade
  - Bairro
  - Status
  - Categoria
  - Busca por ID/título, se houver espaço no padrão do projeto
- Estado de carregamento
- Estado vazio: “Nenhum relato atribuído a esta secretaria no momento.”

Tabela/lista deve conter:
- ID e título
- Data de criação
- Bairro
- Categoria
- Status
- Relevância: confirmações e urgências
- Ações rápidas

Ações rápidas por denúncia:
- Ver detalhe
- Atualizar status
- Solicitar transferência

Não incluir “Reatribuir responsável” para secretaria. Essa ação é da Prefeitura/Admin Prefeitura, não da Secretaria.

Status possíveis:
- ABERTO
- EM_ANALISE
- ENCAMINHADO
- EM_ANDAMENTO
- PROGRAMADO
- CONCLUIDO
- REABERTO
- ARQUIVADO

Representar os status como chips/etiquetas compatíveis com o design já existente no Figma.

3. Atualização de Status

Criar um fluxo/modal/drawer/subpainel para atualização de status da denúncia.

No rascunho funcional, essa ação aparece como um painel acionado pelo botão “Atualizar Status”. Recrie isso com a melhor solução visual do Figma atual.

Campos:
- Novo status
- Motivo/Ação realizada, opcional
- Botões:
  - Cancelar
  - Confirmar/Atualizar

Texto auxiliar importante:
- “A alteração ficará registrada no histórico da denúncia.”
- Para CONCLUIDO: “Após marcar como concluído, o morador ainda poderá confirmar ou contestar a resolução.”

Não impor uma ordem obrigatória rígida de status. O responsável pode definir o status mais adequado.

4. Solicitação de Transferência

Criar fluxo para secretaria solicitar transferência de responsabilidade quando entender que o problema não pertence a ela.

Essa função deve ficar disponível para ADMIN_SECRETARIA e ATENDENTE_SECRETARIA.

A secretaria NÃO aprova transferência e NÃO troca o responsável diretamente. Ela apenas solicita à prefeitura.

Campos:
- Órgão/secretaria de destino sugerido
- Motivo da transferência, obrigatório
- Botões:
  - Cancelar
  - Solicitar transferência

Microcopy:
- “Use esta opção quando o relato não for de competência desta secretaria.”
- “A prefeitura avaliará a solicitação e definirá o destino final.”

Após envio:
- Estado de sucesso: “Solicitação enviada para avaliação da prefeitura.”
- Estado de erro
- Estado enviando/carregando

Não criar botão de “Aprovar”, “Recusar” ou “Reatribuir” na visão da secretaria. Essas ações pertencem à prefeitura.

5. Detalhe Operacional da Denúncia

Criar/ajustar a tela de detalhe da denúncia quando acessada por uma secretaria.

Essa tela deve conter:

Cabeçalho:
- Voltar
- ID e título da denúncia
- Status atual
- Categoria
- Bairro/cidade
- Responsável atual: nome da secretaria
- Data de criação
- Indicadores: confirmações, urgências, comentários

Conteúdo principal:
- Descrição do relato
- Anexos/imagens
- Localização textual
- Mapa/localização, se esse componente já existir no projeto Figma
- Categoria
- Dados de relevância

Painel de ações do operador:
Deve aparecer em destaque, mas sem poluir a tela.

Ações disponíveis para Secretaria:
- Atualizar Status
- Solicitar Transferência

Ações NÃO disponíveis para Secretaria:
- Reatribuir responsável
- Aprovar transferência
- Recusar transferência
- Gerenciar usuários da prefeitura
- Gerenciar secretarias

A organização funcional desse painel pode ser:
- Botões de ação no topo do detalhe
- Ao clicar, abre um subpainel, drawer ou modal abaixo/ao lado
- Apenas um subpainel aberto por vez

6. Resposta Oficial

Na tela de detalhe da denúncia, criar área para a secretaria publicar resposta oficial.

Função:
- Secretaria pode escrever resposta institucional visível no espaço de discussão da denúncia.

Campos:
- Texto da resposta oficial
- Botão “Enviar resposta oficial”

Para secretaria, não precisa selecionar órgão publicador, pois o órgão deve ser a própria secretaria vinculada. Se o Figma já tiver um padrão para mostrar “Como [Nome da Secretaria]”, use isso como rótulo informativo, não como seletor.

Microcopy:
- “Escrever resposta oficial como Secretaria de [nome]”
- Placeholder: “Informe providências, previsão, encaminhamento ou orientação ao morador.”

Na lista de comentários/discussão:
- Respostas oficiais devem aparecer destacadas em relação aos comentários comuns.
- Exibir selo/rótulo: “Resposta oficial”
- Exibir nome da secretaria
- Exibir data/hora

7. Timeline / Histórico

Criar uma seção de histórico da denúncia.

Ela deve mostrar eventos como:
- Denúncia criada
- Status alterado
- Resposta oficial publicada
- Solicitação de transferência enviada
- Transferência aprovada/recusada pela prefeitura, se aplicável
- Denúncia concluída
- Morador confirmou conclusão
- Morador contestou conclusão
- Denúncia reaberta

Organização sugerida:
- Timeline vertical em coluna lateral ou seção própria
- Cada evento com:
  - Ícone/indicador
  - Descrição curta
  - Data/hora
  - Destaque visual para eventos importantes

A timeline é importante para rastreabilidade operacional.

8. Comentários / Discussão

Criar seção de discussão junto ao detalhe da denúncia.

Conteúdo:
- Lista de comentários de moradores
- Lista de respostas oficiais
- Estado vazio
- Campo para resposta oficial da secretaria

A secretaria não cria comentário comum como morador; ela publica resposta oficial.

Comentários removidos por moderação não devem aparecer como ação da secretaria. Moderação é outro perfil.

9. Relatório CSV

Adicionar ação de exportação CSV na visão da secretaria.

Local:
- No painel/lista de denúncias, próximo ao título da seção ou filtros.

Função:
- Exportar relatório operacional da secretaria com filtros aplicados.

Filtros que devem refletir no relatório:
- Cidade
- Bairro
- Status
- Categoria

Microcopy:
- “Exportar relatório CSV”
- “O relatório considera os filtros aplicados.”
- “Dados pessoais sensíveis do autor não devem ser exibidos.”

10. Notificações Operacionais da Secretaria

Se houver área de notificações no Figma, criar estados/itens específicos para secretaria.

Tipos de notificações:
- Nova denúncia atribuída à secretaria
- Denúncia reaberta
- Morador contestou conclusão
- Nova resposta/comentário relevante
- Status atualizado
- Solicitação de transferência enviada
- Solicitação de transferência aprovada ou recusada pela prefeitura
- Relato com muitas urgências/confirmações

Cada item deve ter:
- Tipo
- Título curto
- Descrição
- Data/hora
- Estado lida/não lida
- Link/ação para abrir denúncia

11. Diferença entre ADMIN_SECRETARIA e ATENDENTE_SECRETARIA

No backend atual, os dois perfis podem atuar operacionalmente nas denúncias da secretaria.

Ambos podem:
- Ver denúncias atribuídas à secretaria
- Atualizar status
- Responder oficialmente
- Solicitar transferência
- Ver resumo operacional
- Exportar relatório da secretaria

Não criar gestão de usuários para ADMIN_SECRETARIA nesta etapa, a menos que já exista no Figma como área desabilitada/“em breve”. A gestão de usuários institucionais é responsabilidade da Prefeitura/Admin App.

Se quiser representar diferença de perfil:
- ADMIN_SECRETARIA pode ter rótulo “Administrador da Secretaria”
- ATENDENTE_SECRETARIA pode ter rótulo “Atendente da Secretaria”
Mas as ações principais devem permanecer as mesmas.

12. Estados obrigatórios

Para cada tela/fluxo, criar variações ou componentes de estado:

- Carregando
- Erro
- Lista vazia
- Enviando ação
- Sucesso
- Validação de campo obrigatório
- Usuário sem vínculo ativo
- Denúncia sem anexos
- Denúncia sem comentários
- Denúncia sem eventos de timeline
- Solicitação de transferência enviada

13. Switch entre perfis no protótipo

Adicionar um switch discreto para alternar entre as três experiências do protótipo:

- Morador
- Prefeitura
- Secretaria

Como o Figma já tem telas de Morador e Prefeitura, esse switch deve servir para navegar entre os fluxos do protótipo.

Sugestão:
- Segmented control flutuante no canto inferior direito
- Ou ao lado/abaixo do botão já existente de troca de página/perfil, se houver padrão no Figma
- Opção ativa destacada
- No mobile, transformar em botão flutuante que abre menu curto

O switch deve ser discreto e não parecer uma função final obrigatória do sistema. Ele é um recurso de navegação do protótipo.

14. Restrições funcionais importantes

Não incluir na tela da Secretaria:
- Aprovar solicitação de transferência
- Recusar solicitação de transferência
- Reatribuir responsável diretamente
- Criar prefeitura
- Criar secretaria
- Gerenciar categorias globais
- Gerenciar usuários globais
- Moderação global de denúncias/reportes
- Auditoria global

Incluir na tela da Secretaria:
- Painel de métricas da própria secretaria
- Lista filtrável das denúncias atribuídas
- Exportar CSV
- Atualizar status
- Solicitar transferência
- Ver detalhe da denúncia
- Ver anexos
- Ver localização
- Ver timeline
- Ver comentários
- Enviar resposta oficial

15. Organização sugerida das telas/frames

Criar frames principais:

A. Secretaria - Dashboard Operacional
- Cabeçalho
- Cards de métricas
- Rankings de bairro/categoria
- Bloco de alertas/atenção
- Atalho para lista de denúncias

B. Secretaria - Denúncias Atribuídas
- Filtros
- Tabela/lista
- Ações rápidas
- Exportar CSV
- Estados vazio/loading/erro

C. Secretaria - Detalhe da Denúncia
- Informações do relato
- Evidências/anexos
- Localização
- Painel de ações operacionais
- Timeline
- Discussão/resposta oficial

D. Secretaria - Modal/Drawer Atualizar Status
- Status
- Motivo
- Aviso sobre registro na timeline
- Aviso sobre confirmação do morador quando concluído

E. Secretaria - Modal/Drawer Solicitar Transferência
- Destino sugerido
- Motivo
- Aviso de que prefeitura avaliará

F. Secretaria - Notificações
- Lista de notificações operacionais
- Estados lida/não lida
- Filtros simples

G. Secretaria - Relatório/Exportação
- Filtros
- Prévia/resumo
- Botão exportar CSV

16. Microcopy recomendada

Usar textos objetivos:

- “Relatos atribuídos à sua secretaria”
- “Atualizar status”
- “Solicitar transferência”
- “Enviar resposta oficial”
- “Motivo da transferência”
- “Órgão de destino sugerido”
- “A prefeitura avaliará esta solicitação”
- “Aguardando confirmação do morador”
- “Morador contestou a conclusão”
- “Relato reaberto”
- “Nenhum relato atribuído no momento”
- “Exportar relatório CSV”
- “O relatório considera os filtros aplicados”
- “Seu usuário não possui vínculo ativo com uma secretaria”

17. Resultado esperado

O resultado deve ser um conjunto de telas de Secretaria totalmente integrado ao Figma atual, mantendo a identidade visual já definida no arquivo, mas adicionando a lógica operacional própria da secretaria.

A experiência deve deixar claro que:
- Morador relata e acompanha.
- Prefeitura supervisiona a cidade e decide transferências.
- Secretaria executa o atendimento dos relatos atribuídos a ela.