# Alteracao 005 - Comentarios e respostas oficiais

## Objetivo

Esta alteracao adiciona comentarios em denuncias e respostas oficiais de prefeitura/secretaria.

O foco foi permitir conversa publica dentro da denuncia, mantendo diferenca clara entre:

- comentario comum de usuario;
- resposta oficial institucional.

## Modulo criado

```txt
core/comentario
```

Estrutura:

```txt
Comentario.java
ComentarioService.java
ComentarioRepository.java
ComentarioController.java
ComentarioControllerOpenApi.java
dto/
```

## Banco de dados

Foi criada a tabela:

```txt
comentarios
```

Campos principais:

- denuncia;
- autor;
- conteudo;
- oficial;
- organizacao;
- criado_em;
- atualizado_em;
- removido_em.

O campo `removido_em` prepara a base para remocao logica futura pela moderacao.

## Endpoints

### Comentar denuncia

```txt
POST /api/denuncias/{denunciaId}/comentarios
```

Permissao:

```txt
MORADOR
```

Regra:

- cria comentario comum;
- `oficial=false`;
- nao possui organizacao vinculada.

### Responder oficialmente

```txt
POST /api/denuncias/{denunciaId}/respostas-oficiais
```

Permissoes:

```txt
ADMIN_PREFEITURA
ADMIN_SECRETARIA
ATENDENTE_SECRETARIA
```

Regra:

- cria comentario oficial;
- `oficial=true`;
- exige `organizacaoId`;
- o usuario precisa ter vinculo ativo com a organizacao informada.

O `ADMIN_APP` nao responde oficialmente como prefeitura ou secretaria, pois ele administra a plataforma, nao representa uma instituicao municipal.

### Listar comentarios

```txt
GET /api/denuncias/{denunciaId}/comentarios
```

Permissao:

```txt
Usuario autenticado
```

Retorna comentarios comuns e respostas oficiais paginadas.

## Decisao sobre secretaria

Foi mantida a decisao de nao usar conta compartilhada para secretaria.

A secretaria continua sendo uma organizacao, e usuarios reais atuam vinculados a ela.

Isso preserva auditoria:

- quem comentou;
- quem respondeu oficialmente;
- por qual organizacao respondeu;
- quando respondeu.

## Fora do escopo desta alteracao

Ficaram para etapas futuras:

- edicao de comentarios;
- remocao/moderacao de comentarios;
- timeline automatica de resposta oficial;
- notificacoes para seguidores/autores da denuncia;
- regras avancadas de qual secretaria pode responder conforme atribuicao da denuncia.

Nesta etapa, a regra aplicada e simples: para responder oficialmente, o usuario precisa representar a organizacao informada.

## Swagger/OpenAPI

As operacoes foram documentadas em:

```txt
ComentarioControllerOpenApi
```

Todas as rotas usam `cookieAuth` no Swagger.
