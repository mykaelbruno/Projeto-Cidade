# Permissoes por endpoint do backend

## Objetivo

Este documento consolida as permissoes atuais dos endpoints do backend para orientar:

- desenvolvimento do frontend;
- manutencao de seguranca;
- criacao de testes;
- revisao de regras por perfil.

As permissoes abaixo foram mapeadas a partir dos controllers, `@PreAuthorize` e configuracao de seguranca atual.

## Perfis e papeis usados

### Perfis globais

- `ADMIN_APP`: administrador principal do sistema.
- `MODERADOR`: moderacao global de conteudo.
- `MORADOR`: usuario comum que cria denuncias, comenta, interage e acompanha suas denuncias.

### Papeis institucionais

- `ADMIN_PREFEITURA`: administrador vinculado a uma prefeitura.
- `ADMIN_SECRETARIA`: administrador vinculado a uma secretaria.
- `ATENDENTE_SECRETARIA`: atendente vinculado a uma secretaria.

## Regras gerais

- Rotas nao listadas como publicas exigem autenticacao.
- Tokens sao lidos por cookie `access_token`.
- Rotas com `isAuthenticated()` aceitam qualquer usuario autenticado, desde que outras regras de negocio do service sejam cumpridas.
- Rotas institucionais geralmente validam o papel no token e tambem o vinculo ativo com a organizacao no service.
- Rotas de moderacao aceitam `ADMIN_APP` ou `MODERADOR`.
- Rotas de auditoria sao restritas a `ADMIN_APP`.
- Usuarios inativos ou suspensos recebem `401 USUARIO_INATIVO` em rotas autenticadas, mesmo com access token ainda valido. Logout continua permitido para limpeza de sessao.
- Denuncias anonimas ocultam dados do autor na denuncia, nos comentarios do proprio autor, nos anexos do proprio autor e na timeline.
- Denuncias arquivadas nao aparecem na listagem geral para moradores comuns. Podem ser vistas pelo autor, moderacao, `ADMIN_APP` e instituicoes responsaveis.
- Anexos, comentarios e timeline respeitam a visibilidade da denuncia.

## Endpoints publicos

| Metodo | Endpoint | Permissao | Observacao |
|---|---|---|---|
| POST | `/api/auth/cadastro-morador` | Publico | Cadastro de morador. Protegido por rate limit. |
| POST | `/api/auth/login` | Publico | Login com e-mail ou username. Protegido por rate limit. |
| POST | `/api/auth/refresh` | Publico | Usa cookie `refresh_token`. Protegido por rate limit. |
| POST | `/api/conta/verificacao-email/solicitacao` | Publico | Resposta neutra para nao revelar se e-mail existe. |
| POST | `/api/conta/verificacao-email/confirmacao` | Publico | Confirma e-mail com token valido. |
| POST | `/api/conta/recuperacao-senha/solicitacao` | Publico | Resposta neutra para nao revelar se e-mail existe. |
| POST | `/api/conta/recuperacao-senha/redefinicao` | Publico | Redefine senha com token valido. |
| GET | `/api-docs/**` | Publico local/dev | Documentacao OpenAPI. Rever antes de producao. |
| GET | `/v3/api-docs/**` | Publico local/dev | Documentacao OpenAPI. Rever antes de producao. |
| GET | `/swagger-ui.html` | Publico local/dev | Interface Swagger. Rever antes de producao. |
| GET | `/swagger-ui/**` | Publico local/dev | Assets do Swagger. Rever antes de producao. |
| GET | `/actuator/health` | Publico | Health check. |

## Autenticacao e conta

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| POST | `/api/auth/logout` | Autenticado | Revoga o refresh token atual e limpa cookies. |
| GET | `/api/auth/me` | Autenticado | Retorna dados seguros do usuario logado. |

## Usuarios

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/usuarios` | `ADMIN_APP` | Lista usuarios. |
| POST | `/api/usuarios` | `ADMIN_APP` | Cria usuarios globais, incluindo moderador e outros admins conforme regra definida. |
| PUT | `/api/usuarios/{usuarioId}` | `ADMIN_APP` | Atualiza usuario. |
| PATCH | `/api/usuarios/{usuarioId}/ativacao` | `ADMIN_APP` | Ativa ou desativa usuario. |

## Organizacoes

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/organizacoes` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | Service limita acesso conforme perfil/vinculo quando aplicavel. |
| POST | `/api/organizacoes/prefeituras` | `ADMIN_APP` | Cria prefeitura. |
| POST | `/api/organizacoes/prefeituras/{prefeituraId}/secretarias` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | `ADMIN_PREFEITURA` precisa ter vinculo com a prefeitura. |
| POST | `/api/organizacoes/{organizacaoId}/usuarios-institucionais` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | Prefeitura pode cadastrar usuarios institucionais permitidos em seu escopo. |
| PUT | `/api/organizacoes/{organizacaoId}` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | Prefeitura so pode alterar organizacao dentro do proprio escopo. |
| PATCH | `/api/organizacoes/{organizacaoId}/ativacao` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | Prefeitura so pode alterar ativacao dentro do proprio escopo. |

## Vinculos institucionais

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/vinculos` | `ADMIN_APP` | Lista geral de vinculos. |
| GET | `/api/vinculos/organizacoes/{organizacaoId}` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | Prefeitura precisa ter acesso a organizacao. |
| PUT | `/api/vinculos/{vinculoId}` | `ADMIN_APP` ou `ADMIN_PREFEITURA` | Prefeitura so altera vinculos dentro do proprio escopo. |

## Categorias

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/categorias` | Autenticado | Lista categorias. |
| POST | `/api/categorias` | `ADMIN_APP` | Cria categoria. |
| PUT | `/api/categorias/{categoriaId}` | `ADMIN_APP` | Atualiza categoria. |
| PATCH | `/api/categorias/{categoriaId}/ativacao` | `ADMIN_APP` | Ativa ou desativa categoria. |

## Denuncias

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| POST | `/api/denuncias` | `MORADOR` | Cria denuncia para o morador autenticado. Protegido por rate limit. |
| POST | `/api/denuncias/semelhantes` | `MORADOR` | Consulta possiveis denuncias parecidas antes da criacao. Nao bloqueia o envio; serve para o frontend sugerir apoio a uma denuncia ativa existente. |
| GET | `/api/denuncias` | Autenticado | Lista denuncias com filtros. Para moradores comuns, denuncias arquivadas ficam ocultas mesmo com filtro `status=ARQUIVADO`. |
| GET | `/api/denuncias/minhas` | `MORADOR` | Lista apenas denuncias cujo autor e o morador autenticado. |
| GET | `/api/denuncias/{id}` | Autenticado | Detalha denuncia. Denuncia arquivada so fica visivel para autor, moderacao, `ADMIN_APP` ou instituicao responsavel. |
| PATCH | `/api/denuncias/{id}/status` | `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Usuario deve ter vinculo ativo com a organizacao informada e ela deve ser responsavel pela denuncia. |
| POST | `/api/denuncias/{id}/conclusao/confirmacao` | `MORADOR` | Apenas autor da denuncia pode confirmar conclusao. |
| POST | `/api/denuncias/{id}/conclusao/contestacao` | `MORADOR` | Apenas autor da denuncia pode contestar conclusao. |

## Anexos de denuncia

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| POST | `/api/denuncias/{denunciaId}/anexos` | `MORADOR` | Upload com validacao e compressao de imagem. Protegido por rate limit. |
| GET | `/api/denuncias/{denunciaId}/anexos` | Autenticado | Lista anexos da denuncia respeitando a visibilidade da denuncia. |
| GET | `/api/denuncias/{denunciaId}/anexos/{anexoId}/arquivo` | Autenticado | Baixa arquivo do anexo respeitando a visibilidade da denuncia. |

## Comentarios e respostas oficiais

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| POST | `/api/denuncias/{denunciaId}/comentarios` | `MORADOR` | Cria comentario como morador. Protegido por rate limit. |
| POST | `/api/denuncias/{denunciaId}/respostas-oficiais` | `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Usuario institucional deve respeitar regras de organizacao no service. |
| GET | `/api/denuncias/{denunciaId}/comentarios` | Autenticado | Lista comentarios visiveis. Comentarios removidos nao aparecem, e autor de comentario do proprio autor anonimo e ocultado. |

## Interacoes de moradores

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| POST | `/api/denuncias/{denunciaId}/confirmacoes` | `MORADOR` | Registra confirmacao do problema. Protegido por rate limit. |
| DELETE | `/api/denuncias/{denunciaId}/confirmacoes` | `MORADOR` | Remove confirmacao do usuario. Protegido por rate limit. |
| POST | `/api/denuncias/{denunciaId}/urgencias` | `MORADOR` | Marca urgencia. Protegido por rate limit. |
| DELETE | `/api/denuncias/{denunciaId}/urgencias` | `MORADOR` | Remove urgencia. Protegido por rate limit. |

## Timeline e feed

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/denuncias/{denunciaId}/timeline` | Autenticado | Lista historico da denuncia respeitando visibilidade e ocultacao de autor anonimo. |
| GET | `/api/feed/denuncias` | Autenticado | Retorna timeline mista para evitar vies cronologico ou apenas por engajamento. Denuncias arquivadas ficam ocultas para moradores comuns. |

## Sinalizacoes e moderacao

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| POST | `/api/denuncias/{denunciaId}/sinalizacoes` | Autenticado | Qualquer usuario autenticado pode denunciar/reportar uma denuncia. Protegido por rate limit. |
| GET | `/api/moderacoes/sinalizacoes-denuncia` | `ADMIN_APP` ou `MODERADOR` | Lista sinalizacoes para moderacao. |
| POST | `/api/moderacoes/sinalizacoes-denuncia/{sinalizacaoId}/analise` | `ADMIN_APP` ou `MODERADOR` | Analisa uma sinalizacao. |
| POST | `/api/moderacoes/denuncias/{denunciaId}/arquivamento` | `ADMIN_APP` ou `MODERADOR` | Arquiva denuncia por moderacao. |
| POST | `/api/moderacoes/comentarios/{comentarioId}/remocao` | `ADMIN_APP` ou `MODERADOR` | Remove comentario por moderacao. |
| POST | `/api/moderacoes/usuarios/{usuarioId}/advertencia` | `ADMIN_APP` ou `MODERADOR` | Registra advertencia no historico do usuario. `MODERADOR` so pode advertir `MORADOR`. |
| POST | `/api/moderacoes/usuarios/{usuarioId}/suspensao` | `ADMIN_APP` ou `MODERADOR` | Suspende usuario marcando a conta como inativa. `MODERADOR` so pode suspender `MORADOR`; ultimo `ADMIN_APP` ativo nao pode ser suspenso. |
| POST | `/api/moderacoes/usuarios/{usuarioId}/reativacao` | `ADMIN_APP` ou `MODERADOR` | Reativa usuario suspenso. `MODERADOR` so pode reativar `MORADOR`. |
| GET | `/api/moderacoes/usuarios/{usuarioId}/historico` | `ADMIN_APP` ou `MODERADOR` | Lista advertencias, suspensoes e reativacoes registradas para o usuario. |

## Operacional

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/operacional/organizacoes/{organizacaoId}/denuncias` | `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Prefeitura ve denuncias da prefeitura e secretarias filhas; secretaria ve apenas suas denuncias. |
| POST | `/api/operacional/denuncias/{denunciaId}/solicitacoes-transferencia` | `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Secretaria vinculada solicita transferencia para prefeitura. |
| GET | `/api/operacional/prefeituras/{prefeituraId}/solicitacoes-transferencia` | `ADMIN_PREFEITURA` | Lista solicitacoes da prefeitura. |
| POST | `/api/operacional/solicitacoes-transferencia/{solicitacaoId}/aprovacao` | `ADMIN_PREFEITURA` | Prefeitura aprova e define destino final. |
| POST | `/api/operacional/solicitacoes-transferencia/{solicitacaoId}/recusa` | `ADMIN_PREFEITURA` | Prefeitura recusa solicitacao. |
| PATCH | `/api/operacional/denuncias/{denunciaId}/responsavel` | `ADMIN_PREFEITURA` | Prefeitura altera responsavel manualmente dentro do proprio escopo. |

## Relatorios

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/relatorios/operacional/organizacoes/{organizacaoId}/denuncias.csv` | `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Exporta CSV com filtros opcionais por cidade, bairro, status e categoria. Prefeitura exporta denuncias da prefeitura e secretarias filhas; secretaria exporta apenas denuncias atribuidas a ela. Nao inclui dados pessoais do autor. |

## Paineis

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/paineis/operacional/organizacoes/{organizacaoId}/resumo` | `ADMIN_PREFEITURA`, `ADMIN_SECRETARIA` ou `ATENDENTE_SECRETARIA` | Service valida acesso institucional a organizacao. Retorna contadores, taxas, tempo medio de confirmacao e rankings por bairro/categoria. |
| GET | `/api/paineis/moderacao/resumo` | `ADMIN_APP` ou `MODERADOR` | Resumo de moderacao com sinalizacoes, conteudos moderados e acoes de moderacao de usuarios. |

## Notificacoes

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/notificacoes/minhas` | Autenticado | Lista notificacoes do usuario autenticado. |
| PATCH | `/api/notificacoes/{notificacaoId}/leitura` | Autenticado | Marca notificacao como lida apenas para o usuario relacionado. |

## Auditoria

| Metodo | Endpoint | Permissao | Regra adicional |
|---|---|---|---|
| GET | `/api/auditorias` | `ADMIN_APP` | Consulta eventos auditados com filtros. |

## Observacoes para o frontend

- Usar o Swagger como referencia de contrato, mas considerar este documento como referencia de permissao.
- Exibir ou esconder acoes conforme perfil global e papeis institucionais do usuario logado.
- Mesmo quando o frontend esconde botoes, o backend continua validando permissao.
- Para telas de prefeitura/secretaria, sempre enviar o `organizacaoId` correspondente ao vinculo ativo selecionado.
- Para rotas publicas de conta, nao exibir mensagens diferentes para e-mail existente ou inexistente.

## Pendencias conscientes

- Antes de producao, decidir se Swagger continua publico.
- Antes de producao, decidir quais endpoints exigem e-mail verificado.
- Politica de visibilidade e privacidade revisada em `docs/alterações/alteracao_026_politica_visibilidade_privacidade.md`.
