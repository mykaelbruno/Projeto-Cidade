Crie as telas do perfil ADMIN_APP do Cidade Ativa.

Contexto importante:
O projeto já existe no Figma. Não redesenhe a identidade visual do zero. Mantenha a mesma linguagem visual, componentes, espaçamentos, estilo de botões, cards, tabelas, navegação, tipografia e comportamento de interface já definidos nas telas existentes de morador, prefeitura e secretaria.

Esta entrega deve focar apenas nas telas e fluxos do ADMIN_APP, que é o administrador global da plataforma.

O ADMIN_APP é o perfil mais alto do sistema. Ele é gerado inicialmente pelo backend e pode administrar a plataforma como um todo: usuários globais, prefeituras, secretarias, categorias, vínculos institucionais, moderação geral e auditoria.

Crie uma experiência clara, organizada e administrativa, com foco em manutenção do sistema, rastreabilidade e controle global.

Telas principais necessárias:

1. Dashboard Geral do ADMIN_APP

Criar uma tela inicial com visão geral da plataforma.

Deve conter cards/resumos para:
- total de usuários cadastrados;
- usuários ativos;
- usuários inativos/suspensos;
- total de prefeituras;
- total de secretarias;
- categorias ativas;
- sinalizações pendentes de moderação;
- denúncias arquivadas por moderação;
- usuários advertidos;
- usuários suspensos;
- últimos eventos auditados.

Essa tela deve funcionar como uma central de comando. O ADMIN_APP deve entender rapidamente se há algo crítico exigindo atenção.

Incluir atalhos rápidos para:
- cadastrar prefeitura;
- cadastrar secretaria;
- criar usuário global;
- cadastrar operador institucional;
- criar categoria;
- abrir moderação;
- abrir auditoria.

2. Gestão de Organizações

Criar uma tela/aba para administrar organizações.

A organização deve ser mostrada de forma hierárquica:
- Prefeitura
  - Secretarias vinculadas à prefeitura

Evitar uma lista solta misturando prefeitura e secretaria sem contexto. A hierarquia é essencial.

Funções:
- listar todas as prefeituras;
- listar secretarias subordinadas a cada prefeitura;
- cadastrar nova prefeitura;
- cadastrar nova secretaria dentro de uma prefeitura;
- editar organização;
- ativar/desativar organização;
- visualizar status da organização.

Formulário de prefeitura:
- nome da prefeitura;
- cidade;
- estado/UF;
- status/verificada, se fizer sentido na interface.

Formulário de secretaria:
- prefeitura responsável;
- nome da secretaria;
- categorias atendidas pela secretaria, usando checklist ou multiselect;
- indicar que a secretaria pertence a uma prefeitura específica.

Na listagem, usar colunas ou blocos com:
- nome;
- tipo: Prefeitura ou Secretaria;
- cidade/UF;
- prefeitura mãe, quando for secretaria;
- status: ativa/inativa;
- ações: editar, ativar/desativar, ver operadores.

3. Gestão de Operadores Institucionais

Criar uma área para cadastro e manutenção de operadores vinculados a organizações.

O ADMIN_APP pode cadastrar usuários institucionais para qualquer prefeitura ou secretaria.

Funções:
- selecionar prefeitura ou secretaria;
- criar operador institucional;
- definir papel institucional;
- listar operadores por organização;
- ativar/desativar vínculo;
- editar papel do vínculo.

Papéis possíveis:
- ADMIN_PREFEITURA;
- ADMIN_SECRETARIA;
- ATENDENTE_SECRETARIA.

Formulário de novo operador:
- nome;
- e-mail;
- username;
- senha inicial;
- telefone;
- organização vinculada;
- papel institucional.

Importante:
Se a organização escolhida for Prefeitura, o papel deve ser ADMIN_PREFEITURA.
Se a organização escolhida for Secretaria, permitir ADMIN_SECRETARIA ou ATENDENTE_SECRETARIA.

A interface deve deixar claro que o vínculo é institucional e separado do perfil global do usuário.

4. Gestão de Usuários Globais

Criar uma tela para administrar usuários do sistema.

Funções:
- listar usuários;
- buscar por nome, e-mail ou username;
- filtrar por perfil global;
- filtrar por cidade;
- filtrar por situação: ativo/inativo;
- criar usuário global;
- editar dados cadastrais;
- ativar/desativar usuário.

Perfis globais:
- ADMIN_APP;
- MODERADOR;
- MORADOR.

A listagem deve mostrar:
- ID;
- nome;
- username;
- e-mail;
- perfil global;
- cidade;
- bairro;
- situação da conta;
- ações.

Ações:
- editar;
- ativar/desativar;
- ver histórico de moderação, quando aplicável.

Regras importantes:
- O ADMIN_APP pode criar outros ADMIN_APP e MODERADOR.
- O moderador não é uma prefeitura nem secretaria; ele atua na moderação global.
- O morador é o usuário comum da plataforma.

5. Categorias Globais

Criar tela/aba para administração de categorias de denúncias.

Funções:
- listar categorias;
- criar categoria;
- editar categoria;
- ativar/desativar categoria;
- definir organização responsável padrão, opcionalmente.

Campos:
- nome;
- descrição;
- organização responsável padrão, opcional;
- situação: ativa/inativa.

A listagem deve mostrar:
- ID;
- nome;
- descrição;
- organização responsável padrão;
- status;
- ações.

A categoria é global e pode orientar a distribuição inicial das denúncias.

6. Vínculos Institucionais

Criar tela para visualizar e editar vínculos entre usuários e organizações.

Funções:
- listar vínculos;
- filtrar por usuário;
- filtrar por organização;
- filtrar por prefeitura;
- filtrar por papel;
- filtrar por situação;
- editar papel do vínculo;
- ativar/desativar vínculo.

A listagem deve mostrar:
- ID do vínculo;
- usuário;
- organização associada;
- tipo da organização;
- papel atribuído;
- status do vínculo;
- ações.

A tela deve deixar claro que desativar vínculo não necessariamente desativa a conta do usuário.

7. Moderação Geral

Criar tela de moderação global do ADMIN_APP.

Essa tela pode seguir a lógica funcional do moderador, mas com poderes completos.

Deve conter resumo de moderação:
- sinalizações pendentes;
- denúncias arquivadas por moderação;
- usuários advertidos;
- usuários suspensos;
- usuários reativados.

Área de sinalizações:
- listar denúncias reportadas pelos usuários;
- mostrar motivo da sinalização;
- descrição enviada pelo usuário;
- data;
- autor da sinalização;
- denúncia relacionada;
- botão para abrir denúncia original;
- ação para marcar sinalização como analisada;
- ação para arquivar denúncia por moderação.

Ao arquivar denúncia:
- exigir motivo/justificativa;
- motivo deve ter no mínimo 10 caracteres;
- mostrar confirmação clara antes da ação.

Área de moderação de usuários:
- buscar usuário por nome, e-mail ou username, não por ID manual;
- exibir dados principais do usuário selecionado;
- aplicar advertência;
- suspender usuário;
- reativar usuário;
- consultar histórico de moderação.

Importante:
O ADMIN_APP pode moderar moradores, moderadores e contas administrativas.
Deve existir cuidado visual extra em ações destrutivas, como suspensão e arquivamento.

8. Auditoria Geral

Criar tela exclusiva do ADMIN_APP para auditoria.

Funções:
- listar eventos auditados;
- filtrar por tipo de ação;
- filtrar por tipo de alvo;
- filtrar por ID do alvo;
- filtrar por ator;
- paginação.

A tabela deve mostrar:
- ação;
- ator;
- perfil do ator;
- descrição;
- detalhes;
- método HTTP;
- endpoint;
- IP;
- data/hora.

Essa tela deve parecer mais técnica e administrativa, mas ainda legível.

9. Acompanhamento Operacional Global

O ADMIN_APP pode precisar acompanhar o funcionamento de prefeituras e secretarias.

Criar uma tela de acompanhamento operacional global, sem confundir com o painel da prefeitura ou da secretaria.

Funções:
- selecionar prefeitura;
- visualizar secretarias daquela prefeitura;
- visualizar denúncias atribuídas à prefeitura/secretarias;
- filtrar por cidade, bairro, categoria e status;
- abrir detalhe da denúncia;
- exportar relatório CSV se a permissão estiver disponível no fluxo final.

Importante:
Não desenhar o ADMIN_APP como operador principal da secretaria. Ele é um supervisor global.
A tela deve comunicar “acompanhamento/suporte” e não “atendimento direto”, salvo onde o backend permitir ação.

10. Navegação e Organização

Sugestão de navegação para o ADMIN_APP:

- Visão Geral
- Organizações
- Usuários
- Vínculos
- Categorias
- Moderação
- Auditoria
- Operacional Global

Pode ser sidebar ou navegação superior, seguindo o padrão já existente no Figma.

11. Switch de Perfis

Adicionar um switch discreto para alternar visualmente entre perfis no protótipo.

Como agora existe a tela do ADMIN_APP, o switch deve contemplar:
- Morador;
- Prefeitura;
- Secretaria;
- Admin App.

Se o projeto já tiver um switch de três perfis, adicionar ADMIN_APP como quarto modo.
Sugestão de posição: canto inferior direito da tela, próximo ao botão/atalho já usado para alternar páginas administrativas, sem atrapalhar a navegação principal.

O switch é para navegação/prototipação no Figma, não precisa parecer uma função real de troca de permissão dentro do produto.

12. Estados de Interface

Criar estados para:
- carregando;
- lista vazia;
- erro de carregamento;
- formulário inválido;
- ação em andamento;
- sucesso;
- confirmação antes de desativar, suspender ou arquivar;
- busca sem resultados;
- usuário sem vínculo institucional;
- organização inativa;
- categoria inativa;
- sinalização já analisada.

13. Restrições Importantes

Não usar o frontend atual do repositório como referência visual.
Usar apenas a lógica funcional descrita aqui e manter a identidade visual do Figma atual.

Não inventar novas regras de negócio.
Não transformar ADMIN_APP em prefeitura ou secretaria.
Não misturar moderação, auditoria e operação municipal em uma única tela confusa.
Não criar telas excessivamente genéricas: cada área deve ter função clara.

Frames que devem ser criados:

A. Admin App - Visão Geral  
B. Admin App - Organizações  
C. Admin App - Cadastrar Prefeitura  
D. Admin App - Cadastrar Secretaria  
E. Admin App - Usuários Globais  
F. Admin App - Criar/Editar Usuário Global  
G. Admin App - Operadores Institucionais  
H. Admin App - Vínculos Institucionais  
I. Admin App - Categorias Globais  
J. Admin App - Moderação Geral  
K. Admin App - Histórico de Moderação do Usuário  
L. Admin App - Auditoria Geral  
M. Admin App - Operacional Global  
N. Componentes/Modais de Confirmação  
O. Switch de Perfis com Morador, Prefeitura, Secretaria e Admin App