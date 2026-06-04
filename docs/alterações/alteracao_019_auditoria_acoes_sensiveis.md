# Alteracao 019 - Auditoria de acoes sensiveis

## Objetivo

Implementar auditoria persistente para acoes sensiveis do backend, seguindo o primeiro item prioritario do roadmap de fechamento.

A auditoria registra quem executou a acao, qual alvo foi afetado, quando aconteceu e de qual rota a acao partiu.

## Estrutura criada

Pacote:

```txt
infra/auditoria
```

Arquivos principais:

- `Auditoria`
- `AuditoriaRepository`
- `AuditoriaService`
- `AuditoriaController`
- `AuditoriaControllerOpenApi`
- `TipoAcaoAuditoria`
- `TipoAlvoAuditoria`
- `AuditoriaContext`
- `AuditoriaContextFilter`
- `AuditoriaResponseDTO`

## Banco de dados

Foi criada a migration:

```txt
V2__create_auditoria_table.sql
```

Tabela criada:

```txt
auditorias
```

Campos principais:

- `acao`;
- `alvo_tipo`;
- `alvo_id`;
- `ator_id`;
- `perfil_ator`;
- `descricao`;
- `detalhes`;
- `metodo_http`;
- `caminho`;
- `ip`;
- `criado_em`.

## Acoes auditadas

Foram adicionados registros de auditoria para:

- criacao de usuario pelo `ADMIN_APP`;
- atualizacao de usuario;
- ativacao/desativacao de usuario;
- criacao de prefeitura;
- criacao de secretaria;
- atualizacao de organizacao;
- ativacao/desativacao de organizacao;
- criacao de usuario institucional;
- criacao de categoria;
- atualizacao de categoria;
- ativacao/desativacao de categoria;
- atualizacao de vinculo institucional;
- alteracao de status de denuncia;
- confirmacao de conclusao pelo morador;
- contestacao de conclusao pelo morador;
- arquivamento de denuncia pela moderacao;
- remocao de comentario pela moderacao;
- criacao de sinalizacao;
- analise de sinalizacao;
- solicitacao de transferencia;
- aprovacao de transferencia;
- recusa de transferencia;
- alteracao manual de responsavel pela prefeitura.

## Consulta da auditoria

Endpoint criado:

```txt
GET /api/auditorias
```

Permissao:

```txt
ADMIN_APP
```

Filtros disponiveis:

- `acao`;
- `alvoTipo`;
- `alvoId`;
- `atorId`;
- paginacao e ordenacao.

Ordenacao padrao:

```txt
criadoEm desc
```

## Seguranca e privacidade

A auditoria nao salva senhas nem tokens.

O campo `detalhes` registra apenas informacoes operacionais, como ids relacionados, status anterior/novo, papel ou situacao ativa.

## Swagger

Foi criado `AuditoriaControllerOpenApi`, com tag propria:

```txt
Auditoria
```

A documentacao deixa claro que a consulta e restrita ao `ADMIN_APP`.

## Testes

Foi criado teste unitario para `AuditoriaService`.

Validacoes cobertas:

- acao registrada;
- alvo registrado;
- ator extraido do JWT;
- perfil extraido das roles;
- metodo HTTP registrado;
- caminho registrado;
- IP registrado;
- detalhes preservados.

## Roadmap

Itens marcados como concluidos no roadmap:

- `Logs/auditoria de acoes sensiveis`;
- `Auditoria persistente no banco`.

O proximo item prioritario passa a ser:

```txt
Testes de permissao por perfil
```
