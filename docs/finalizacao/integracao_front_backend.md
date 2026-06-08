# Integracao Frontend x Backend - Cidade Ativa

Data: 2026-06-02

## Objetivo

Este documento mapeia o que precisa ser feito para integrar a pasta `front/` ao backend atual do projeto. A analise usou como base:

- `docs/finalizacao/api-contract.md`;
- controllers, DTOs e enums reais do backend em `src/main/java`;
- estrutura, rotas, paginas e mocks do front em `front/src/app`.

O front novo parece ter vindo de um prototipo visual/Figma. No inicio da integracao, ele estava completo visualmente, mas ainda dependia de autenticacao simulada, mocks locais e alguns nomes de endpoints pensados em ingles ou de forma generica. As fases abaixo registram a migracao progressiva para os contratos reais do backend em portugues.

## Decisoes de Produto Ja Confirmadas

Estas decisoes foram respondidas pelo dono do produto e devem guiar a integracao:

| Tema | Decisao | Impacto |
|---|---|---|
| Prefeitura criar denuncia | A prefeitura nao cria denuncias. | Remover/ocultar qualquer acao de "novo relato" em telas de prefeitura. Denuncias continuam sendo criadas por moradores. |
| Admin app operacional | O admin app nao precisa ver metricas operacionais detalhadas por agora. | A tela de admin app deve focar em gerenciar contas, organizacoes, usuarios, vinculos, categorias, moderacao e auditoria. Se existir bloco operacional no front sem suporte direto, remover ou simplificar. |
| Report/sinalizacao de post | O report deve ter um motivo baseado em categorias e um mini comentario de quem reporta. | Backend precisa evoluir `SinalizacaoDenuncia` para motivo categorico + comentario/descricao curta. |
| Bairros controlados | Bairros devem ser cadastrados e gerenciados pela prefeitura, relacionados a cidade/prefeitura. | Implementado no backend e no front: cadastro de morador, criacao de denuncia e tela de gestao da prefeitura usam bairros ativos/controlados. |
| Transferir usuario entre secretarias | A prefeitura deve conseguir trocar um usuario de uma secretaria para outra. | Backend precisa de fluxo de movimentacao/criacao de vinculo para usuario institucional existente dentro do escopo da prefeitura. |
| Analytics | Analytics detalhado nao e necessario agora. | Remover/ocultar telas/cards de analytics que dependam de comparativos, tendencias ou filtros por periodo nao implementados. |
| Foto de capa/performance | A listagem deve buscar performance. | Implementado `imagemCapaUrl` em `DenunciaResponseDTO` para evitar N+1 de anexos nos cards do feed, mapa e minhas denuncias. |
| Denuncias concluidas | Denuncias concluidas nao aparecem no feed inicial; ficam acessiveis apenas quando o usuario entra em "Concluidas" ou filtra explicitamente por status. | Feed sem `status` agora exclui `CONCLUIDO`; a aba/rota de concluidas continua usando filtro de status. |

## Estado Atual do Front

| Area | Estado atual | Impacto |
|---|---|---|
| Autenticacao | Login, logout, sessao, cadastro, verificacao de e-mail e recuperacao de senha usam APIs reais. | O front trabalha com cookie HttpOnly e `GET /api/auth/me` como fonte de sessao. |
| Sessao/perfil | `UserContext.tsx` guarda usuario real, perfil global, papeis e vinculos operacionais. | O alternador de perfil mostra apenas acessos reais da sessao, sem bypass manual de permissao. |
| Dados de denuncias | Feed, detalhe, minhas denuncias, mapa e criacao de nova denuncia usam backend real. | O arquivo `mockReports.ts` foi removido; cards usam `imagemCapaUrl` e detalhe busca anexos completos. |
| Admin prefeitura | Dashboard, relatos, administracao, bairros e perfil usam dados reais ou contexto real. | Restam apenas refinos pontuais, como edicao posterior de categorias atendidas por secretaria. |
| Secretaria | Dashboard, relatos, transferencia, status e usuarios usam fluxo operacional real. | Restam refinos de UX e eventuais filtros adicionais. |
| Moderador | Painel simples integrado com resumo, sinalizacoes e acoes reais. | Sinalizacoes de comentario agora aparecem como alvo especifico, com conteudo do comentario reportado. |
| Admin app | Organizacoes, usuarios globais, vinculos, categorias, moderacao, auditoria e apoio operacional usam endpoints reais. | Restam apenas refinos de UX e revisao manual de consistencia com dados reais. |
| Notificacoes | Lista/dropdown usam notificacoes reais. | Refinos visuais podem ser feitos depois. |
| Upload/fotos | Criacao de denuncia envia anexos reais apos criar o relato e compacta imagens grandes no navegador. | Restam apenas ajustes finos de UX, como mensagens de progresso mais detalhadas. |

## Fonte de Verdade do Backend

### Autenticacao e sessao

O backend usa cookies HttpOnly:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

Payload real do login:

```json
{
  "identificador": "email-ou-username",
  "senha": "senha-com-minimo-8"
}
```

Resposta relevante de `/api/auth/me`:

```json
{
  "usuario": {
    "id": 1,
    "nome": "Admin",
    "email": "admin@app.local",
    "username": "admin_app",
    "perfilGlobal": "ADMIN_APP",
    "telefone": null,
    "cidade": "Mamanguape",
    "bairro": "Centro",
    "fotoPerfilUrl": null,
    "emailVerificado": true,
    "emailVerificadoEm": "2026-05-30T00:00:00Z",
    "ativo": true,
    "criadoEm": "2026-05-30T00:00:00Z",
    "atualizadoEm": "2026-05-30T00:00:00Z"
  },
  "papeis": ["ROLE_ADMIN_APP"],
  "vinculosOperacionais": []
}
```

### Perfis e papeis

| Front atual | Backend real | Observacao |
|---|---|---|
| `morador` | `perfilGlobal=MORADOR` | Perfil comum. |
| `moderador` | `perfilGlobal=MODERADOR` | Moderacao global. |
| `admin_app` | `perfilGlobal=ADMIN_APP` | Admin principal do sistema. |
| `prefeitura` | vinculo ativo com `papel=ADMIN_PREFEITURA` | Nao e perfil global. O usuario institucional continua com `perfilGlobal=MORADOR` e ganha permissao pelo vinculo. |
| `secretaria` | vinculo ativo com `papel=ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Nao e perfil global. |

Regra importante: o front nao deve decidir permissao apenas pelo `perfilGlobal`. Para prefeitura/secretaria, deve analisar `vinculosOperacionais`.

### Enums que o front deve mapear para labels

Status de denuncia:

- `ABERTO`
- `EM_ANALISE`
- `ENCAMINHADO`
- `EM_ANDAMENTO`
- `PROGRAMADO`
- `CONCLUIDO`
- `REABERTO`
- `ARQUIVADO`

Ordenacao do feed:

- `MISTO`
- `RECENTES`
- `EM_ALTA`

Perfis globais:

- `ADMIN_APP`
- `MORADOR`
- `MODERADOR`

Papeis institucionais:

- `ADMIN_PREFEITURA`
- `ADMIN_SECRETARIA`
- `ATENDENTE_SECRETARIA`

Tipo de organizacao:

- `PREFEITURA`
- `SECRETARIA`

Status de transferencia:

- `PENDENTE`
- `APROVADA`
- `RECUSADA`

Status de sinalizacao:

- `PENDENTE`
- `ANALISADA`

## Tarefas Estruturais Obrigatorias

| Prioridade | Tarefa | O que fazer | Justificativa |
|---|---|---|---|
| P0 | Criar cliente HTTP real | Criar um `apiClient` com `baseURL`, `credentials: "include"` e tratamento de erro `ErroApiResponse`. | Sem isso o cookie HttpOnly nao sera enviado. |
| P0 | Remover bypass de login | Trocar seletor manual de perfil por `POST /api/auth/login` e depois `GET /api/auth/me`. | O front hoje nao valida credenciais reais. |
| P0 | Refatorar `UserContext` | Guardar `usuario`, `papeis`, `vinculosOperacionais`, `perfilAtivo` derivado e loading de sessao. | Base de permissao e navegacao. |
| P0 | Implementar guards reais | `RouteGuard` deve validar perfil global e/ou vinculo institucional, nao apenas `userType` manual. | Evita acesso errado entre morador, prefeitura, secretaria, admin app e moderador. |
| P0 | Adaptar Spring `Page<T>` | Criar helper para `content`, `totalElements`, `totalPages`, `number`, `size`. | Quase todas as listagens do backend paginam. |
| P0 | Mapear DTOs para view models | Converter campos do backend para formatos do front: labels, `timeAgo`, imagens, contadores. | Mantem UI limpa sem distorcer contrato. |
| P0 | Criar estados de API | Loading, erro, vazio, sucesso, mutacao pendente e erro de permissao. | O prototipo ainda nao lida com backend real. |
| P1 | Configurar `.env` do front | Ex.: `VITE_API_URL=http://localhost:8080`. | Facilita execucao local. |
| P1 | Revisar CORS/cookies | Backend precisa aceitar origem do front local e cookies cross-origin se rodar em portas diferentes. | Essencial para login por cookie. |

## Mapeamento de Rotas do Front para Backend

### Autenticacao e conta

| Tela/fluxo no front | Backend real | Ajuste necessario |
|---|---|---|
| Login | `POST /api/auth/login` + `GET /api/auth/me` | Enviar `identificador` e `senha`; remover seletor de perfil em producao. |
| Logout | `POST /api/auth/logout` | Chamar API, limpar contexto e redirecionar para `/`. |
| Cadastro de morador | `POST /api/auth/cadastro-morador` | Enviar `nome`, `email`, `username`, `senha`, `telefone`, `cidade`, `bairro`. |
| Cidades no cadastro | `GET /api/organizacoes/prefeituras` | Derivar cidades/UF das prefeituras ativas. |
| Bairros no cadastro | `GET /api/prefeituras/{prefeituraId}/bairros/ativos` | Front deve listar bairros ativos cadastrados pela prefeitura/cidade selecionada. |
| Esqueci senha | `POST /api/conta/recuperacao-senha/solicitacao` | Implementar request real. |
| Redefinir senha | `POST /api/conta/recuperacao-senha/redefinicao` | Front ainda precisa de pagina para receber token e nova senha. |
| Confirmar e-mail | `POST /api/conta/verificacao-email/confirmacao` | Front novo ainda precisa de pagina/rota de confirmacao. |

### Morador

| Tela/fluxo | Backend real | Ajuste necessario |
|---|---|---|
| Feed | `GET /api/feed/denuncias` | Usar `modo=MISTO`, filtros `cidade`, `bairro`, `status`, `categoriaId`, `excluirProprias`, `termo` e paginacao. Sem filtro de status, o backend oculta `ARQUIVADO` e `CONCLUIDO`. |
| Cards de relato | `FeedDenunciaResponseDTO.denuncia` | `ReportCard` deve consumir view model gerado de `DenunciaResponseDTO`. |
| Apoiar | `POST /api/denuncias/{id}/confirmacoes` e `DELETE /api/denuncias/{id}/confirmacoes` | Usar `apoiadaPeloUsuario` no feed ou buscar status via `/interacoes/status`. |
| Urgente | `POST /api/denuncias/{id}/urgencias` e `DELETE /api/denuncias/{id}/urgencias` | Hoje o card mostra urgencias, mas o botao urgente nao esta plenamente integrado. |
| Mapa | `GET /api/feed/denuncias` ou `GET /api/denuncias` | Usar `latitude`/`longitude` reais; front hoje posiciona pins fake por porcentagem. |
| Minhas denuncias | `GET /api/denuncias/minhas` | Implementado; preserva filtro de "aguardando confirmacao" usando `status=CONCLUIDO` e `conclusaoConfirmadaEm=null`. |
| Detalhe | `GET /api/denuncias/{id}` | Buscar anexos, comentarios e timeline separadamente. |
| Comentarios | `GET/POST /api/denuncias/{id}/comentarios` | Comentario de morador usa `{ "conteudo": "..." }`. |
| Sinalizar relato | `POST /api/denuncias/{id}/sinalizacoes` | Enviar `motivo` categorico e `comentario` curto. |
| Sinalizar comentario | `POST /api/denuncias/{denunciaId}/comentarios/{comentarioId}/sinalizacoes` | Enviar `motivo` categorico e `comentario` curto; backend evita duplicidade por usuario/comentario. |
| Remover proprio comentario | `DELETE /api/denuncias/{denunciaId}/comentarios/{comentarioId}` | Apenas o autor do comentario pode remover logicamente o proprio comentario. |
| Confirmar conclusao | `POST /api/denuncias/{id}/conclusao/confirmacao` | Payload `{ "feedback": "..." }`. |
| Contestar conclusao | `POST /api/denuncias/{id}/conclusao/contestacao` | Payload `{ "feedback": "..." }`. |
| Nova denuncia | `POST /api/denuncias` | Enviar categoria por `categoriaId`, `prefeituraId`, `bairroId`, cidade e bairro. Backend valida que a prefeitura pertence a cidade do morador e que o bairro esta ativo nessa prefeitura. |
| Semelhantes antes do envio | `POST /api/denuncias/semelhantes` | Recomendado antes da criacao para sugerir apoio a denuncia existente; aplica a mesma validacao de cidade/prefeitura/bairro da criacao. |
| Fotos | `POST /api/denuncias/{id}/anexos` | Criar denuncia primeiro; depois enviar cada arquivo em `FormData` com chave `arquivo`. |

### Prefeitura

| Tela/fluxo | Backend real | Ajuste necessario |
|---|---|---|
| Dashboard prefeitura | `GET /api/paineis/operacional/organizacoes/{prefeituraId}/resumo` | Usar vinculo `ADMIN_PREFEITURA` para descobrir `prefeituraId`. |
| Relatos da cidade | `GET /api/operacional/organizacoes/{prefeituraId}/denuncias` | Prefeitura ve denuncias da prefeitura e secretarias filhas. |
| Atualizar status | `PATCH /api/denuncias/{id}/status` | Enviar `status`, `organizacaoId` e opcional `motivo`. |
| Resposta oficial | `POST /api/denuncias/{id}/respostas-oficiais` | Enviar `organizacaoId` e `conteudo`. |
| Solicitacoes de transferencia | `GET /api/operacional/prefeituras/{prefeituraId}/solicitacoes-transferencia` | Mostrar pendentes e historico. |
| Aprovar transferencia | `POST /api/operacional/solicitacoes-transferencia/{id}/aprovacao` | Payload real: `organizacaoDestinoId`, `motivo` opcional. |
| Recusar transferencia | `POST /api/operacional/solicitacoes-transferencia/{id}/recusa` | Payload `{ "motivo": "..." }`. |
| Reatribuir responsavel | `PATCH /api/operacional/denuncias/{id}/responsavel` | Payload real usa `organizacaoDestinoId`, nao `organizacaoId`. |
| Administrar secretarias | `POST /api/organizacoes/prefeituras/{prefeituraId}/secretarias` | Prefeitura so cria secretarias dentro do proprio escopo. |
| Criar operador | `POST /api/organizacoes/{organizacaoId}/usuarios-institucionais` | Cria usuario institucional novo e vinculo; nao vincula usuario existente. |
| Usuarios/vinculos | `GET /api/usuarios`, `GET /api/vinculos/organizacoes/{id}`, `PUT /api/vinculos/{id}` | Para prefeitura, backend filtra por cidade/vinculo. |
| Gerenciar bairros | `GET/POST/PUT/PATCH /api/prefeituras/{prefeituraId}/bairros` | Implementado em `/prefeitura/bairros`: prefeitura lista, cria, edita, ativa/desativa bairros da propria cidade e pode informar centroide opcional para uso em mapas. |
| Transferir usuario entre secretarias | `PATCH /api/vinculos/{vinculoId}/secretaria` | Prefeitura move o vinculo institucional existente para outra secretaria do proprio municipio. |

### Secretaria

| Tela/fluxo | Backend real | Ajuste necessario |
|---|---|---|
| Dashboard secretaria | `GET /api/paineis/operacional/organizacoes/{secretariaId}/resumo` | Usar vinculo ativo `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA`. |
| Relatos atribuidos | `GET /api/operacional/organizacoes/{secretariaId}/denuncias` | Filtros por cidade, bairro, status e categoria. |
| Atualizar status | `PATCH /api/denuncias/{id}/status` | Enviar `organizacaoId=secretariaId`. |
| Solicitar transferencia | `POST /api/operacional/denuncias/{id}/solicitacoes-transferencia` | Enviar `organizacaoDestinoSugeridaId` opcional e `motivo` obrigatorio. |
| Resposta oficial | `POST /api/denuncias/{id}/respostas-oficiais` | Enviar `organizacaoId=secretariaId`. |
| Usuarios da secretaria | `GET /api/vinculos/organizacoes/{secretariaId}` | Tela deve permanecer leitura/consulta, salvo se for admin prefeitura/admin app. |
| Perfil da secretaria | `GET /api/organizacoes` + vinculo atual | Backend nao tem endpoint especifico "minha secretaria"; derivar por vinculo. |

### Moderador

| Tela/fluxo | Backend real | Ajuste necessario |
|---|---|---|
| Resumo | `GET /api/paineis/moderacao/resumo` | Disponivel para `MODERADOR` e `ADMIN_APP`. |
| Sinalizacoes | `GET /api/moderacoes/sinalizacoes-denuncia?status=PENDENTE` | Retorna `Page<SinalizacaoDenunciaResponseDTO>`, podendo incluir `comentarioId` e `comentarioSinalizadoConteudo` quando a sinalizacao for sobre comentario. |
| Marcar analisada | `POST /api/moderacoes/sinalizacoes-denuncia/{id}/analise` | Sem body. |
| Arquivar denuncia | `POST /api/moderacoes/denuncias/{denunciaId}/arquivamento` | Payload `{ "motivo": "..." }`. |
| Remover comentario | `POST /api/moderacoes/comentarios/{comentarioId}/remocao` | Payload `{ "motivo": "..." }`. |
| Advertir usuario | `POST /api/moderacoes/usuarios/{usuarioId}/advertencia` | Moderador so pode agir sobre `MORADOR`. |
| Suspender usuario | `POST /api/moderacoes/usuarios/{usuarioId}/suspensao` | Moderador so pode agir sobre `MORADOR`. |
| Reativar usuario | `POST /api/moderacoes/usuarios/{usuarioId}/reativacao` | Moderador so pode agir sobre `MORADOR`. |
| Historico | `GET /api/moderacoes/usuarios/{usuarioId}/historico` | Retorna `Page<ModeracaoResponseDTO>`, nao lista simples. |

### Admin App

| Tela/fluxo | Backend real | Ajuste necessario |
|---|---|---|
| Visao geral | Combinar `/api/usuarios`, `/api/organizacoes`, `/api/categorias`, `/api/paineis/moderacao/resumo`, `/api/auditorias` | Nao ha endpoint unico de dashboard admin app. |
| Organizacoes | `GET /api/organizacoes`, `POST /api/organizacoes/prefeituras`, `POST /api/organizacoes/prefeituras/{id}/secretarias`, `PUT/PATCH /api/organizacoes/{id}`, `PATCH /api/organizacoes/{id}/categorias` | Agrupar por `organizacaoPaiId`; secretarias podem ter categorias atendidas atualizadas depois da criacao. |
| Usuarios globais | `GET/POST/PUT/PATCH /api/usuarios` | Criar `ADMIN_APP`, `MODERADOR` e `MORADOR`; `GET /api/usuarios` aceita filtros por `termo`, `perfilGlobal` e `ativo`; institucionais devem ser criados pela rota de organizacao ou vinculados por `/api/vinculos`. |
| Vinculos | `GET /api/vinculos`, `POST /api/vinculos`, `PUT /api/vinculos/{id}`, `PATCH /api/vinculos/{id}/secretaria` | `POST /api/vinculos` vincula usuario MORADOR ativo sem outro vinculo institucional ativo. |
| Categorias | `GET/POST/PUT/PATCH /api/categorias` | `organizacaoResponsavelPadraoId` e opcional. |
| Moderacao geral | Mesmas rotas do moderador | Admin app pode moderar contas administrativas; moderador nao. |
| Auditoria | `GET /api/auditorias` | Filtros reais: `acao`, `alvoTipo`, `alvoId`, `atorId`, paginacao. |
| Operacional global | Opcional por agora | Admin app nao precisa de metricas operacionais detalhadas. Se a tela existir no front, simplificar/remover blocos de metricas e manter foco em gestao global. |

## Conversao de Dados: Backend para Componentes do Front

### `ReportCard.Report`

| Campo do front | Origem backend | Observacao |
|---|---|---|
| `id` | `denuncia.id` | Converter Long para string se o componente continuar tipado assim. |
| `title` | `denuncia.titulo` | Direto. |
| `description` | `denuncia.descricao` | Direto. |
| `category` | `denuncia.categoriaNome` | Direto. |
| `status` | `denuncia.status` | Mapear enum para label: `EM_ANALISE` -> `Em analise`. |
| `location` | `denuncia.rua` ou `denuncia.pontoReferencia` | Front espera uma string unica. |
| `neighborhood` | `denuncia.bairro` | Direto. |
| `supports` | `denuncia.quantidadeConfirmacoes` | Direto. |
| `urgencies` | `denuncia.quantidadeUrgencias` | Direto. |
| `comments` | `denuncia.quantidadeComentarios` | Direto. |
| `timeAgo` | `denuncia.criadoEm` | Derivar no front com `date-fns`. |
| `image` | `DenunciaResponseDTO.imagemCapaUrl` | O backend retorna a primeira imagem da denuncia como URL relativa otimizada para cards; se vier `null`, o front usa mockup visual. |

### Detalhe da denuncia

Dados precisam vir de chamadas separadas:

- denuncia: `GET /api/denuncias/{id}`;
- anexos: `GET /api/denuncias/{id}/anexos`;
- comentarios: `GET /api/denuncias/{id}/comentarios`;
- timeline: `GET /api/denuncias/{id}/timeline`;
- status das interacoes: `GET /api/denuncias/{id}/interacoes/status`.

## Inconsistencias Importantes

### Endpoints em ingles no front/documentacao do front

O front e seus docs citam endpoints como:

- `/api/users`
- `/api/reports`
- `/api/organizations`
- `/api/categories`
- `/api/moderation`
- `/api/notifications`
- `/api/audit/events`

O backend real usa:

- `/api/usuarios`
- `/api/denuncias`
- `/api/organizacoes`
- `/api/categorias`
- `/api/moderacoes`
- `/api/notificacoes`
- `/api/auditorias`

Acao recomendada: criar uma camada `services/` no front com nomes de dominio em portugues e nunca chamar esses endpoints antigos em componentes.

### Campos esperados pelo front que nao vem prontos do backend

| Campo/ideia no front | Situacao no backend | Acao recomendada |
|---|---|---|
| `timeAgo` | Backend retorna `Instant`. | Derivar no front. |
| `image`/foto capa da denuncia | Backend retorna `imagemCapaUrl` nas listagens/detalhe e anexos completos por endpoint separado. | Cards usam `imagemCapaUrl`; detalhe continua buscando anexos para galeria completa. |
| `secretaria` em varios cards | Backend retorna `organizacaoResponsavelNome`. | Usar esse campo. |
| Variacao percentual mensal | Backend nao fornece comparativo por periodo. | Remover/ocultar por agora; analytics detalhado nao e necessario. |
| Analytics por periodo 7/30/90/365 | Backend nao filtra painel por periodo. | Remover/ocultar por agora. |
| Mapa de calor | Backend tem latitude/longitude por denuncia, mas nao agregacao heatmap. | Nao e prioridade para integracao inicial; usar mapa simples se necessario. |
| Busca de usuario por texto | Backend `GET /api/usuarios` aceita `termo`, `perfilGlobal` e `ativo`. | Usar filtros server-side no Admin App. |
| Bairros disponiveis | Backend ja possui entidade e endpoints de bairros. | Integrar no front e decidir depois se cadastro/denuncia devem enviar `prefeituraId` para validacao forte. |
| Perfil institucional detalhado | Backend nao tem `/minha-organizacao`. | Derivar de `/api/auth/me` + `/api/organizacoes`. |

### Acoes desenhadas no front que o backend nao suporta do jeito atual

| Acao no front | Problema | Decisao recomendada |
|---|---|---|
| Prefeitura criar "Novo Relato" manualmente | Backend permite criar denuncia apenas para `MORADOR`. | Remover/ocultar acao. A prefeitura nao cria denuncias. |
| Excluir usuario permanentemente | Backend nao possui DELETE de usuario. | Substituir por ativar/desativar ou suspensao por moderacao. |
| Mover usuario entre organizacoes | Backend possui transferencia entre secretarias e criacao de vinculo para usuario existente. | Usar `PATCH /api/vinculos/{vinculoId}/secretaria` para trocar secretaria e `POST /api/vinculos` apenas para usuario sem vinculo institucional ativo. |
| MODERADOR dentro de organizacao prefeitura | Backend trata `MODERADOR` como perfil global criado por `ADMIN_APP`, nao papel institucional. | Remover moderador das telas de operadores da prefeitura. |
| Reatribuir responsavel com `organizacaoId` | Backend espera `organizacaoDestinoId`. | Ajustar payload. |
| Sinalizacao com `motivo` + `descricao` | Backend aceita `motivo` categorico + `comentario`. | Ajustar o front para usar `comentario`, nao `descricao`. |
| Admin app ver resumo operacional | Listagem operacional aceita `ADMIN_APP`, mas painel resumo operacional nao aceita no controller atual. | Nao e necessario agora. Remover/ocultar metricas operacionais detalhadas do admin app. |
| Marcar todas notificacoes como lidas | Backend possui `PATCH /api/notificacoes/leitura`. | Usar chamada unica no front. |

### Divergencias no `api-contract.md` que devem ser revisadas

| Item | Documento atual | Backend confirmado |
|---|---|---|
| `POST /api/auth/register` | Aparece em docs do front, nao no contrato final. | Real: `POST /api/auth/cadastro-morador`. |
| Usuario institucional | Contrato cita `usuarioId, papel` em alguns trechos. | Real: cria usuario novo com `nome`, `email`, `username`, `senha`, `telefone`, `papel`. |
| Prefeitura/organizacao com CNPJ | Contrato menciona `cnpj` em alguns trechos de entidade/payload. | DTO real nao possui `cnpj`. |
| Atualizacao de organizacao | Contrato sugere `tipo`/`categoriasIds` em pontos antigos. | DTO real de organizacao: `nome`, `cidade`, `estado`, `verificada`; categorias da secretaria usam `PATCH /api/organizacoes/{id}/categorias`. |
| Sinalizacao | Contrato antigo citava `motivo, descricao`. | DTO real: `motivo` e `comentario`. |
| Transferencia aprovada/recusada | Contrato usa nomes genericos. | Enum real: `PENDENTE`, `APROVADA`, `RECUSADA`. |
| Auditoria filtros | Contrato cita `usuarioId` em alguns pontos. | Controller real usa `atorId`, `acao`, `alvoTipo`, `alvoId`. |
| Painel operacional para `ADMIN_APP` | Pode parecer disponivel no contrato. | Controller atual do resumo aceita apenas prefeitura/secretaria/atendente. |

## Plano de Integracao por Etapas

### Etapa 0 - Ajustes de Backend Decididos Agora

Antes de integrar essas telas no front, algumas regras novas precisam entrar no backend para evitar gambiarras:

- [x] Criar entidade/modelo de bairro vinculado a prefeitura/cidade.
- [x] Criar endpoints para prefeitura listar, criar, editar e ativar/desativar bairros do proprio municipio.
- [x] Atualizar cadastro de morador e criacao de denuncia para usar bairro controlado pela cidade/prefeitura no front.
- [x] Atualizar Swagger com os endpoints e exemplos de bairros.
- [x] Evoluir sinalizacao/report de denuncia para receber motivo categorico e mini comentario.
- [x] Definir se os motivos de report serao enum fixo, tabela propria ou categorias administraveis.
- [x] Criar fluxo para prefeitura transferir usuario institucional de uma secretaria para outra dentro do proprio municipio.
- [x] Atualizar auditoria para registrar criacao/edicao/inativacao de bairros e transferencia de usuario institucional.
- [x] Atualizar documentacao de permissoes por endpoint.

Observacoes da implementacao:

- Bairros foram implementados com `nome`, `ativo`, prefeitura vinculada e timestamps.
- A listagem publica de bairros ativos fica em `GET /api/prefeituras/{prefeituraId}/bairros/ativos`.
- A gestao autenticada fica em `GET/POST /api/prefeituras/{prefeituraId}/bairros`, `PUT /api/prefeituras/{prefeituraId}/bairros/{bairroId}` e `PATCH /api/prefeituras/{prefeituraId}/bairros/{bairroId}/ativacao`.
- A geolocalizacao automatica por bairro nao foi implementada agora. Apenas o nome do bairro nao e confiavel para localizar area no mapa com precisao; isso deve virar melhoria futura com centroide/limites geograficos se for necessario.
- A criacao de nova denuncia agora carrega prefeituras ativas, seleciona a cidade/prefeitura e lista bairros ativos por prefeitura quando houver dados disponiveis.
- A prefeitura agora tem a tela `/prefeitura/bairros` para gerir bairros cadastrados, incluindo ativacao/desativacao.
- Reports de denuncia agora usam motivo fixo por enum e comentario curto: `motivo` + `comentario`.
- Motivos fixos atuais: `IMAGEM_INADEQUADA`, `SPAM`, `FAKE_NEWS`, `CONTEUDO_OFENSIVO`, `DADOS_PESSOAIS_EXPOSTOS`, `DENUNCIA_DUPLICADA`, `LOCALIZACAO_INCORRETA`, `CATEGORIA_INCORRETA`, `OUTRO`.
- A troca de usuario entre secretarias altera o vinculo existente via `PATCH /api/vinculos/{vinculoId}/secretaria`, sem criar novo login nem novo vinculo ativo.
- A validacao obrigatoria de cidade/prefeitura e bairro foi resolvida na criacao de denuncia: o front envia `prefeituraId` e `bairroId`, e o backend valida se a denuncia pertence a cidade do morador e se o bairro ativo existe naquela prefeitura.

### Etapa 1 - Infra de API e sessao

Checklist:

- [x] Criar `front/src/app/services/apiClient.ts`.
- [x] Criar `front/.env.example` com `VITE_API_URL=http://localhost:8080`.
- [x] Usar `credentials: "include"` em todas as chamadas.
- [x] Criar tipos TypeScript dos DTOs principais de autenticacao/sessao.
- [x] Criar normalizador de erro para `ErroApiResponse`.
- [x] Trocar `UserContext` para contexto real de sessao.
- [x] Implementar `login`, `logout`, `refresh` e `me`.
- [x] Atualizar `RouteGuard` para permissoes reais.
- [x] Manter `ProfileSwitcher` como alternador apenas dos acessos reais disponiveis na sessao, sem bypass manual de permissao.

Observacoes da implementacao:

- O login agora usa `POST /api/auth/login` com `identificador` e `senha`, depois carrega `/api/auth/me`.
- O contexto passa a derivar prefeitura e secretaria dos `vinculosOperacionais`, nao de perfil global fake.
- O guard escolhe automaticamente o perfil ativo compativel com a rota quando o usuario tem mais de um acesso, por exemplo prefeitura e morador.
- Os botoes de logout nos layouts institucionais chamam `POST /api/auth/logout`.
- A rota antiga `/prefeitura/prefeituraistracao` foi mantida apenas como redirecionamento para `/prefeitura/administracao`.
- As entradas de menu de analytics detalhado da prefeitura e operacional global do admin app foram ocultadas nesta primeira limpeza, pois nao sao prioridade confirmada agora.

### Etapa 2 - Morador funcional

Checklist:

- [x] Integrar cadastro de morador.
- [x] Integrar recuperacao de senha e criar tela de redefinicao.
- [x] Criar tela de confirmacao de e-mail.
- [x] Integrar feed `MISTO`.
- [x] Integrar filtros iniciais de feed por modo/status.
- [x] Integrar mapa com latitude/longitude reais.
- [x] Integrar minhas denuncias.
- [x] Integrar detalhe com comentarios, anexos e timeline.
- [x] Integrar apoio/urgencia reversiveis.
- [x] Integrar nova denuncia com semelhantes antes do envio.
- [x] Integrar upload de anexos apos criacao.
- [x] Integrar sinalizacao/report de denuncia.
- [x] Integrar confirmacao/contestacao de conclusao.

Observacoes da implementacao:

- `RegisterPage` agora carrega prefeituras ativas de `GET /api/organizacoes/prefeituras`.
- Ao selecionar a cidade/prefeitura, o cadastro carrega bairros ativos em `GET /api/prefeituras/{prefeituraId}/bairros/ativos`.
- O cadastro envia `POST /api/auth/cadastro-morador` com `nome`, `email`, `username`, `senha`, `telefone`, `cidade` e `bairro`.
- `ForgotPasswordPage` agora chama `POST /api/conta/recuperacao-senha/solicitacao`.
- Foi criada `ResetPasswordPage` para `/redefinir-senha?token=...`, usando `POST /api/conta/recuperacao-senha/redefinicao`.
- Foi criada `VerifyEmailPage` para `/verificar-email?token=...`, usando `POST /api/conta/verificacao-email/confirmacao`.
- O cadastro depende de bairros cadastrados pela prefeitura. Se uma prefeitura nao tiver bairros ativos, o usuario ainda nao conseguira concluir o cadastro naquela cidade.
- `HomePage` agora carrega o feed real em `GET /api/feed/denuncias`.
- A aba padrao usa `modo=MISTO`, preservando a proposta de timeline mista sem depender apenas de cronologia ou engajamento.
- As abas `Em alta` e `Recentes` usam `modo=EM_ALTA` e `modo=RECENTES`.
- A aba `Concluidas` usa `status=CONCLUIDO` e `modo=MISTO`; o feed inicial sem filtro de status exclui denuncias `CONCLUIDO`.
- Quando o usuario tem cidade na sessao, o feed envia `cidade` para manter a listagem regional.
- Apoio e urgencia agora chamam `POST/DELETE /api/denuncias/{id}/confirmacoes` e `POST/DELETE /api/denuncias/{id}/urgencias`, atualizando os contadores retornados pelo backend.
- A busca textual do modal envia `termo` para o backend no feed, e a categoria do modal envia `categoriaId` real carregado de `GET /api/categorias`.
- `ReportDetailPage` agora carrega `GET /api/denuncias/{id}`, anexos, comentarios e timeline reais.
- O detalhe busca anexos apenas na tela individual para montar a galeria completa. Cards de feed, mapa e minhas denuncias usam `imagemCapaUrl`, evitando N+1 de anexos.
- Comentarios de morador usam `POST /api/denuncias/{id}/comentarios`.
- Sinalizacao/report usa `POST /api/denuncias/{id}/sinalizacoes` com `motivo` e `comentario`.
- A validacao de conclusao usa `POST /api/denuncias/{id}/conclusao/confirmacao` e `POST /api/denuncias/{id}/conclusao/contestacao`, exibida apenas quando a denuncia esta `CONCLUIDO` e pertence ao morador logado.
- A pagina de detalhe tambem usa `GET /api/denuncias/{id}/interacoes/status` para carregar apoio/urgencia ja feitos pelo usuario.
- `MyReportsPage` agora carrega os relatos reais do morador em `GET /api/denuncias/minhas`.
- A tela `Minhas Denuncias` deixou de usar `mockReports`, aplica filtros locais sobre os relatos reais e separa relatos concluidos que ainda aguardam confirmacao do morador.
- As fotos em `Minhas Denuncias` usam `imagemCapaUrl` da listagem e mantem mockup visual quando nao houver foto.
- `MapPage` agora carrega relatos reais em `GET /api/feed/denuncias`, usa apenas denuncias com `latitude` e `longitude`, calcula os pinos a partir das coordenadas e nao inventa posicao para relatos sem geolocalizacao.
- O mapa exibe estatisticas e filtros de categoria calculados a partir dos dados reais carregados.
- O arquivo `front/src/app/data/mockReports.ts` foi removido porque nao havia mais uso no fluxo do morador.
- `NewReportFlow` agora carrega categorias reais de `GET /api/categorias`, monta `DenunciaCreateRequestDTO`, consulta `POST /api/denuncias/semelhantes` antes da criacao e cria o relato com `POST /api/denuncias`.
- Apos criar a denuncia, o front envia cada foto para `POST /api/denuncias/{id}/anexos` usando multipart com o campo `arquivo`.
- Imagens grandes sao compactadas no navegador antes do upload para reduzir tamanho sem bloquear demais o usuario.

### Etapa 3 - Painel operacional prefeitura e secretaria

Checklist:

- [x] Descobrir organizacao ativa pelo `vinculosOperacionais`.
- [x] Prefeitura abre direto no painel da prefeitura vinculada.
- [x] Secretaria abre direto no painel da secretaria vinculada.
- [x] Integrar resumo operacional.
- [x] Integrar listagem operacional com filtros.
- [x] Integrar atualizacao de status.
- [x] Integrar resposta oficial.
- [x] Integrar transferencia solicitada pela secretaria.
- [x] Integrar aprovacao/recusa pela prefeitura.
- [x] Integrar reatribuicao manual pela prefeitura.
- [x] Integrar CSV operacional.
- [x] Integrar paginacao visual real usando `Page` do backend.
- [x] Garantir que denuncias concluidas aparecam nos paineis operacionais e na aba propria de concluidas, sem aparecerem no feed inicial sem filtro.

Observacoes da implementacao:

- As paginas de prefeitura e secretaria deixam de usar mocks e passam a usar `OperationalDashboard` e `OperationalReports`.
- A organizacao ativa e derivada automaticamente de `vinculosOperacionais`, evitando seletor manual e queda em secretaria fixa.
- O dashboard usa `GET /api/paineis/operacional/organizacoes/{organizacaoId}/resumo`.
- A listagem usa `GET /api/operacional/organizacoes/{organizacaoId}/denuncias` com filtros por cidade, bairro, status e categoria.
- A prefeitura carrega secretarias por `GET /api/organizacoes` para reatribuicao manual e decisao de transferencia.
- A secretaria consegue solicitar transferencia com motivo obrigatorio. O destino sugerido fica opcional porque listar todas as secretarias nao esta disponivel para esse perfil no backend atual.
- A prefeitura ve transferencias pendentes, aprova/recusa e pode escolher a secretaria de destino.
- A atualizacao de status e a resposta oficial usam a organizacao responsavel da denuncia quando ela existe; caso contrario, usam a organizacao do vinculo ativo.
- O CSV operacional usa `GET /api/relatorios/operacional/organizacoes/{organizacaoId}/denuncias.csv`.
- A listagem operacional usa paginacao real do backend, com navegacao por pagina e tamanho configuravel entre 10, 20 e 50 relatos.

### Etapa 4 - Moderador

Checklist:

- [x] Integrar resumo de moderacao.
- [x] Integrar sinalizacoes pendentes.
- [x] Integrar marcar sinalizacao como analisada.
- [x] Integrar arquivamento de denuncia.
- [x] Integrar remocao de comentario.
- [x] Integrar busca/lista de usuarios usando `/api/usuarios` apenas quando permitido.
- [x] Aplicar advertencia/suspensao/reativacao.
- [x] Exibir historico paginado de moderacao.
- [x] Bloquear visualmente moderacao de contas nao `MORADOR` para moderadores.

Observacoes da implementacao:

- `ModeradorPage` deixou de usar mocks e agora consome `moderacaoService`.
- O resumo usa `GET /api/paineis/moderacao/resumo`.
- As sinalizacoes usam `GET /api/moderacoes/sinalizacoes-denuncia?status=PENDENTE`.
- O botao "Analisada" usa `POST /api/moderacoes/sinalizacoes-denuncia/{id}/analise`.
- O arquivamento usa `POST /api/moderacoes/denuncias/{denunciaId}/arquivamento` e, em seguida, marca a sinalizacao como analisada.
- A remocao de comentario usa `POST /api/moderacoes/comentarios/{comentarioId}/remocao`.
- A moderacao de usuario usa `POST /api/moderacoes/usuarios/{usuarioId}/advertencia`, `/suspensao` e `/reativacao`.
- O historico usa `GET /api/moderacoes/usuarios/{usuarioId}/historico`.
- Como `GET /api/usuarios` nao permite `MODERADOR`, a tela nao simula busca textual de usuario. A moderacao de usuario funciona por ID exato e o backend valida se a conta pode ser moderada.
- Comentarios podem ser sinalizados pelo morador na pagina do relato; a moderacao recebe o `comentarioId` e o conteudo sinalizado. A remocao moderada ainda usa ID exato no painel simples do moderador.

### Etapa 5 - Admin app

Checklist:

- [x] Integrar visao geral combinando endpoints existentes.
- [x] Integrar organizacoes com hierarquia prefeitura -> secretarias.
- [x] Integrar criacao/edicao/ativacao de prefeitura.
- [x] Integrar criacao/edicao/ativacao de secretaria.
- [x] Integrar usuarios globais.
- [x] Integrar vinculos institucionais.
- [x] Integrar categorias globais.
- [x] Integrar moderacao geral.
- [x] Integrar auditoria.
- [x] Remover/ocultar metricas operacionais detalhadas e telas de analytics do admin app, pois nao sao necessarias agora.

Observacoes da implementacao:

- `OrganizacoesPage` deixou de usar mocks e agora consome `organizacaoService`.
- A listagem usa `GET /api/organizacoes` e agrupa secretarias por `organizacaoPaiId`.
- A criacao de prefeitura usa `POST /api/organizacoes/prefeituras`.
- A criacao de secretaria usa `POST /api/organizacoes/prefeituras/{prefeituraId}/secretarias` e pode enviar `categoriasIds`.
- A edicao de organizacao usa `PUT /api/organizacoes/{organizacaoId}` com `nome`, `cidade`, `estado` e `verificada`.
- A ativacao de organizacao usa `PATCH /api/organizacoes/{organizacaoId}/ativacao`.
- `UsuariosPage` deixou de usar mocks e agora consome `usuarioService`.
- A listagem usa `GET /api/usuarios`.
- A criacao de usuario global usa `POST /api/usuarios`.
- A edicao de usuario usa `PUT /api/usuarios/{usuarioId}`.
- A ativacao de usuario usa `PATCH /api/usuarios/{usuarioId}/ativacao`.
- `UsuariosPage` usa filtros server-side em `GET /api/usuarios?termo=&perfilGlobal=&ativo=`.
- Categorias de secretaria sao enviadas na criacao e podem ser atualizadas depois por `PATCH /api/organizacoes/{organizacaoId}/categorias`.
- `VinculosPage` deixou de usar mocks e agora consome `vinculoService`.
- A listagem global de vinculos usa `GET /api/vinculos`.
- A edicao de papel/status usa `PUT /api/vinculos/{vinculoId}`.
- A transferencia de usuario entre secretarias usa `PATCH /api/vinculos/{vinculoId}/secretaria`.
- A criacao feita pela tela e de usuario institucional novo ja vinculado a organizacao via `POST /api/organizacoes/{organizacaoId}/usuarios-institucionais`.
- A criacao de vinculo para usuario ja existente usa `POST /api/vinculos`.
- `POST /api/vinculos` aceita apenas usuario ativo com perfil `MORADOR`, organizacao ativa e usuario sem outro vinculo institucional ativo.
- Regras aplicadas na UI: prefeitura permite apenas `ADMIN_PREFEITURA`; secretaria permite `ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA`; transferencia so aparece para vinculos de secretaria e limita o destino a secretarias ativas da mesma prefeitura.
- `CategoriasPage` deixou de usar mocks e agora consome `categoriaService`.
- A listagem usa `GET /api/categorias`.
- A criacao usa `POST /api/categorias`.
- A edicao usa `PUT /api/categorias/{categoriaId}`.
- A ativacao/desativacao usa `PATCH /api/categorias/{categoriaId}/ativacao`.
- A tela tambem carrega `GET /api/organizacoes` para exibir o nome da secretaria responsavel padrao, pois o DTO de categoria retorna apenas `organizacaoResponsavelPadraoId`.
- A categoria pode ficar com distribuicao manual quando `organizacaoResponsavelPadraoId` e `null`.
- A busca e os filtros de categorias sao locais sobre a lista carregada, pois o endpoint atual nao possui filtros server-side.
- `NotificationsList` deixou de usar mocks e agora consome `GET /api/notificacoes/minhas`, `PATCH /api/notificacoes/{notificacaoId}/leitura` e `PATCH /api/notificacoes/leitura`.
- `AuditoriaPage` deixou de usar mocks e agora consome `GET /api/auditorias` com filtros reais por acao, alvo, ator e paginacao.
- `ModeracaoPage` do Admin App deixou de usar mocks e agora consome resumo real, sinalizacoes pendentes, marcacao como analisada e arquivamento de denuncia por moderacao.
- `VisaoGeralPage` deixou de usar numeros fixos e agora monta um resumo simples com usuarios, organizacoes, categorias, moderacao e auditoria reais.
- `OperacionalPage` do Admin App foi removida porque a rota ja redirecionava para a visao geral e metricas operacionais detalhadas nao fazem parte do escopo atual.

### Etapa 6 - Refinos e lacunas futuras

Checklist:

- [x] Criar endpoint/campo otimizado de foto de capa ou thumbnail da denuncia no feed para evitar N+1 de anexos.
- [x] Criar filtros server-side para usuarios, se necessario.
- [x] Criar endpoint de marcar todas notificacoes como lidas, se a UI mantiver essa acao.
- [x] Aplicar code-splitting inicial nas rotas do front para reduzir o bundle principal.
- [x] Remover `front/dist/` do versionamento e trata-lo como artefato de build.
- [ ] Avaliar no futuro analytics por periodo/comparativos, caso volte a ser prioridade.

## Arquitetura Recomendada no Front

Organizacao sugerida dentro de `front/src/app`:

```text
services/
  apiClient.ts
  authService.ts
  denunciaService.ts
  feedService.ts
  categoriaService.ts
  organizacaoService.ts
  operacionalService.ts
  moderacaoService.ts
  notificacaoService.ts
  auditoriaService.ts

types/
  api.ts
  auth.ts
  denuncia.ts
  organizacao.ts
  usuario.ts
  operacional.ts
  moderacao.ts

mappers/
  denunciaMapper.ts
  statusMapper.ts
  usuarioMapper.ts

contexts/
  AuthContext.tsx
```

Regras:

- Componentes nao devem chamar endpoints diretamente.
- Paginas chamam services ou hooks.
- Mappers convertem enum/campo tecnico para label/view model.
- `ProfileSwitcher` deve alternar apenas entre acessos reais da sessao, sem criar permissao visual que o usuario nao possui.
- Nunca salvar access token em `localStorage`; o backend ja usa cookie HttpOnly.

## Decisoes Resolvidas e Pendencias Remanescentes

| Tema | Status | Encaminhamento |
|---|---|---|
| Prefeitura criar denuncia | Resolvido | Nao cria. Remover do front. |
| Admin app com metricas operacionais detalhadas | Resolvido | Nao precisa agora. Simplificar/remover no front. |
| Analytics detalhado | Resolvido | Nao implementar agora. |
| Bairros controlados por prefeitura/cidade | Resolvido | Backend, cadastro, criacao de denuncia e tela de gestao da prefeitura ja usam bairros controlados. |
| Transferir usuario entre secretarias | Resolvido | Prefeitura move usuario institucional entre secretarias do proprio municipio alterando o vinculo existente. |
| Report de post | Resolvido | Implementado com motivo fixo por enum e mini comentario obrigatorio. |
| Foto de capa no feed/minhas denuncias | Resolvido | Backend fornece `imagemCapaUrl` e o front usa esse campo em feed, mapa e minhas denuncias, sem chamadas extras por card. |
| Motivos de report | Resolvido | Enum fixo com motivos comuns de moderacao. |
| Dados de bairro | Resolvido | Implementado com `nome`, `ativo` e centroide opcional (`centroideLatitude`/`centroideLongitude`). Geometria completa por poligono segue como melhoria futura dependente de dados oficiais. |
| Transferencia de usuario entre secretarias | Resolvido | O vinculo existente troca de secretaria; nao cria novo vinculo. |
| Validacao forte de prefeitura/bairro na denuncia | Resolvido | `DenunciaCreateRequestDTO` aceita `prefeituraId` e `bairroId`; criacao e busca de semelhantes validam cidade do morador, prefeitura e bairro ativo. |
| Concluidas no feed inicial | Resolvido | Feed sem filtro de status nao retorna `CONCLUIDO`; concluidas aparecem somente em filtro/aba propria. |
| Sinalizacao de comentario | Resolvido | Comentarios podem ser reportados por rota propria e aparecem para moderacao com `comentarioId` e conteudo. |
| Busca operacional server-side | Resolvido | `GET /api/operacional/organizacoes/{id}/denuncias` aceita `termo` e filtra no backend. |
| Categorias atendidas por secretaria | Resolvido | Prefeitura/Admin App atualizam categorias cobertas por secretaria via `PATCH /api/organizacoes/{id}/categorias`. |

Pendencias conscientes atuais:

1. Avaliar futuramente geometria completa dos bairros, caso o mapa precise inferir bairro automaticamente por area/poligono. Hoje o sistema guarda apenas centroide opcional e nao inventa limites geograficos.
2. Revisar visualmente, em navegador, os novos fluxos de sinalizacao/remocao de comentario, gestao de centroide e busca operacional com dados reais.

## Ordem Recomendada Para Comecar

1. Revisar manualmente os fluxos integrados no navegador com backend local rodando.
2. Corrigir eventuais ajustes visuais/UX encontrados nos perfis morador, prefeitura, secretaria, moderador e admin app.
3. Avaliar apenas as melhorias futuras conscientemente adiadas, como geometria completa de bairros.
4. Quando houver nova decisao de produto, atualizar contrato, Swagger e docs antes de integrar no front.
5. Preparar uma rodada final de testes ponta a ponta.

## Resumo Executivo

O front deixou de ser apenas um prototipo visual e ja esta majoritariamente conectado aos contratos reais do backend: autenticacao, feed, denuncias, anexos, comentarios, respostas oficiais, interacoes, status, transferencias, usuarios, organizacoes, categorias, notificacoes, moderacao, auditoria, bairros e paineis operacionais.

As lacunas restantes sao principalmente decisoes conscientes de regra de negocio ou refinamentos de experiencia:

- estudar geometria completa de bairros para usos futuros no mapa, sem inventar limites sem dados oficiais;
- revisar no navegador os fluxos novos com massa real.

Antes de novos contratos, a recomendacao e rodar os fluxos no navegador com dados reais e corrigir os ajustes visuais ou pequenos desalinhamentos que aparecerem.

## Ultra Resumo das Fases Implementadas

- Fase 1: Criada a base de conexao front-back com `apiClient`, tipos de auth, `authService`, `.env.example`, sessao real em `UserContext`, login real, logout real, guards por perfil/vinculo e limpeza inicial de rotas/menus nao priorizados.
- Fase 2: Implementada a Etapa 0 do backend com bairros por prefeitura, endpoints de gestao/listagem publica, reports com enum fixo + comentario, transferencia real do vinculo entre secretarias, auditoria desses eventos, migration `V5` e Swagger atualizado.
- Fase 3: Integradas telas publicas do front com cadastro real de morador, prefeituras e bairros reais, solicitacao/redefinicao de senha e confirmacao de e-mail por token.
- Fase 4: Integrado o feed real do morador com `GET /api/feed/denuncias`, ordenacao mista por padrao, abas de em alta/recentes/resolvidos, paginacao pelo backend e apoio/urgencia reversiveis.
- Fase 5: Integrado o detalhe real da denuncia com denuncia, anexos, comentarios, timeline, status de interacao, comentarios de morador, sinalizacao para moderacao e confirmacao/contestacao de conclusao.
- Fase 6: Melhorados os cards do feed com foto ou mockup visual, botoes de apoio/urgencia com contadores, denuncia funcional por modal, mapa interno horizontal do relato, destaque de comentario oficial e exibicao de secretaria junto da cidade.
- Fase 7: Integrada a tela `Minhas Denuncias` com `GET /api/denuncias/minhas`, removido uso de `mockReports`, adicionados estados de carregamento/erro/vazio, filtros sobre dados reais, agrupamento de relatos aguardando confirmacao e imagens reais por anexo quando disponiveis.
- Fase 8: Integrado o `MapPage` com `GET /api/feed/denuncias`, pinos calculados por latitude/longitude reais, filtros e estatisticas derivados do backend, card de detalhe do pino conectado ao relato real e remocao do arquivo `mockReports.ts`.
- Fase 9: Integrado `NewReportFlow` com categorias reais, geolocalizacao opcional, busca de semelhantes antes do envio, criacao real de denuncia, compressao de imagens no front e upload multipart dos anexos apos a criacao.
- Fase 10: Integrado o painel operacional de prefeitura/secretaria com vinculo real da sessao, resumo operacional, relatos filtrados, status, resposta oficial, transferencias, reatribuicao manual, CSV e remocao dos mocks dessas paginas.
- Fase 11: Integrada a area do moderador com resumo real, sinalizacoes pendentes, marcar como analisada, arquivamento de denuncia, remocao de comentario, acoes de usuario por ID e historico real de moderacao.
- Fase 12: Iniciada a integracao do Admin App com organizacoes e usuarios globais reais, incluindo hierarquia prefeitura/secretaria, criacao, edicao, ativacao e filtros locais sobre dados do backend.
- Fase 13: Integrados os vinculos institucionais do Admin App com listagem real, edicao de papel/status, transferencia entre secretarias e criacao de usuario institucional ja vinculado a uma organizacao.
- Fase 14: Integradas as categorias globais do Admin App com listagem, criacao, edicao, ativacao/desativacao e secretaria responsavel padrao usando contratos reais do backend.
- Fase 15: Resolvidas pendencias prioritarias de vinculos e categorias de secretaria, adicionando `POST /api/vinculos`, `PATCH /api/organizacoes/{id}/categorias`, Swagger atualizado e front conectado aos novos contratos.
- Fase 16: Resolvidas pendencias simples de notificacoes e usuarios, adicionando filtros server-side em `GET /api/usuarios`, endpoint `PATCH /api/notificacoes/leitura` e notificacoes reais no front.
- Fase 17: Resolvida a pendencia de performance das imagens de denuncias, adicionando `imagemCapaUrl` nas respostas do backend, busca textual `termo` em feed/listagens e removendo chamadas N+1 de anexos nos cards do feed, mapa e minhas denuncias.
- Fase 18: Integrada a auditoria do Admin App com `GET /api/auditorias`, filtros server-side disponiveis, paginacao real, modal de detalhes e exportacao CSV da pagina carregada.
- Fase 19: Integrada a moderacao geral do Admin App com resumo real, sinalizacoes pendentes, marcacao como analisada e arquivamento de denuncia com motivo obrigatorio.
- Fase 20: Removida a tela operacional global mockada do Admin App e reescrita a visao geral para usar apenas dados reais de usuarios, organizacoes, categorias, moderacao e auditoria.
- Fase 21: Integrada a criacao de denuncia com prefeituras ativas e bairros ativos, mantendo fallback manual e preservando o contrato atual do backend.
- Fase 22: Criada a gestao de bairros da prefeitura no front, com listagem, criacao, edicao e ativacao/desativacao usando os endpoints reais de bairros.
- Fase 23: Adicionada paginacao real no painel operacional de prefeitura/secretaria, usando `page`, `size`, totais e navegacao retornados pelo backend.
- Fase 24: Removidas categorias mockadas do filtro do feed; o modal agora carrega categorias reais e envia `categoriaId` para o backend.
- Fase 25: Removidos arquivos antigos de prototipo sem rota ativa (`AdminPage`, `AdminDashboard`, `MapView` e `AnalyticsPage`) para reduzir residuos de mocks no front.
- Fase 26: Reescrita a administracao da prefeitura com dados reais para secretarias, operadores institucionais, vinculos, ativacao/desativacao e transferencia entre secretarias.
- Fase 27: Integrado o drawer lateral de notificacoes com `/api/notificacoes/minhas`, leitura individual e marcar todas como lidas, removendo listas fixas do prototipo.
- Fase 28: Resolvidas as pendencias priorizadas de regra/contrato: criacao e semelhantes validam prefeitura/bairro da cidade do morador, bairros ganharam centroide opcional, feed inicial oculta concluidas, comentarios podem ser sinalizados/removidos pelo autor, painel operacional ganhou busca server-side e prefeitura pode manejar categorias atendidas por secretaria.
- Fase 29: Criado README geral de apresentacao para GitHub e aplicado code-splitting nas rotas do front com `React.lazy`/`Suspense`; o build passou e o chunk principal caiu de aproximadamente 664 kB para 308 kB, removendo o alerta de chunk acima de 500 kB.
- Fase 30: `front/dist/` foi removido do versionamento e adicionado ao `.gitignore`; o build continua gerando o artefato localmente, mas os arquivos com hash nao ficam mais como alteracoes pendentes no Git.
