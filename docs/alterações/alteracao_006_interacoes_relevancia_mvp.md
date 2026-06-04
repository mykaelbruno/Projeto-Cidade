# Alteracao 006 - Interacoes e relevancia MVP

## Objetivo

Esta alteracao adiciona as primeiras interacoes de engajamento das denuncias:

- confirmar problema;
- marcar como urgente;
- remover confirmacao;
- remover urgencia.

Tambem implementa uma pontuacao simples de relevancia para o MVP.

## Decisao sobre algoritmo de relevancia

Foi decidido implementar agora apenas uma formula simples, conforme sugerido na documentacao:

```txt
relevancia = confirmacoes * 2 + urgencias * 3 + comentarios
```

Motivo:

- e facil de entender;
- atende o MVP;
- permite ordenar denuncias por engajamento;
- evita complexidade prematura.

Ficam para depois:

- recencia;
- reincidencia;
- proximidade geografica;
- tempo sem resposta;
- numero de reaberturas;
- peso por reputacao do usuario.

## Alteracoes em denuncia

A denuncia passou a guardar contadores:

- `quantidadeConfirmacoes`;
- `quantidadeUrgencias`;
- `quantidadeComentarios`;
- `pontuacaoRelevancia`.

Esses campos permitem ordenar o feed sem precisar recalcular tudo em consultas pesadas.

## Comentarios e relevancia

Ao criar comentario comum ou resposta oficial, a denuncia incrementa:

```txt
quantidadeComentarios
```

Depois recalcula:

```txt
pontuacaoRelevancia
```

## Modulo criado

```txt
core/interacao
```

Estrutura:

```txt
InteracaoDenuncia.java
InteracaoDenunciaService.java
InteracaoDenunciaRepository.java
InteracaoDenunciaController.java
InteracaoDenunciaControllerOpenApi.java
TipoInteracaoDenuncia.java
dto/
```

## Banco de dados

Foi criada a tabela:

```txt
interacoes_denuncia
```

Tipos permitidos:

```txt
CONFIRMACAO
URGENCIA
```

Regra de integridade:

```txt
um usuario so pode ter uma interacao de cada tipo por denuncia
```

Isso e garantido por constraint unica:

```txt
denuncia_id + usuario_id + tipo
```

## Endpoints

### Confirmar problema

```txt
POST /api/denuncias/{denunciaId}/confirmacoes
```

Permissao:

```txt
MORADOR
```

### Remover confirmacao

```txt
DELETE /api/denuncias/{denunciaId}/confirmacoes
```

Permissao:

```txt
MORADOR
```

### Marcar como urgente

```txt
POST /api/denuncias/{denunciaId}/urgencias
```

Permissao:

```txt
MORADOR
```

### Remover urgencia

```txt
DELETE /api/denuncias/{denunciaId}/urgencias
```

Permissao:

```txt
MORADOR
```

## Idempotencia

As interacoes foram implementadas para evitar duplicidade:

- confirmar duas vezes nao duplica contagem;
- marcar urgencia duas vezes nao duplica contagem;
- remover uma interacao inexistente nao gera erro.

Isso deixa a API mais robusta para cliques repetidos ou reenvios acidentais.

## Feed em alta

Com `pontuacaoRelevancia`, o endpoint de listagem de denuncias ja pode ser usado com ordenacao por relevancia via paginacao/sort do Spring:

```txt
GET /api/denuncias?sort=pontuacaoRelevancia,desc
```

## Swagger/OpenAPI

As operacoes foram documentadas em:

```txt
InteracaoDenunciaControllerOpenApi
```

Todas usam `cookieAuth`.
