# Alteracao 004 - Fluxo inicial de denuncias

## Objetivo

Esta alteracao inicia o fluxo principal do produto: registro e consulta de denuncias urbanas.

O foco foi criar uma base segura e simples para:

- morador autenticado criar denuncia;
- listar denuncias com paginacao;
- filtrar denuncias por dados principais;
- consultar detalhe de uma denuncia;
- preservar a regra de anonimato visual.

## Endpoints criados ou ajustados

Modulo:

```txt
core/denuncia
```

### Criar denuncia

```txt
POST /api/denuncias
```

Permissao:

```txt
MORADOR
```

Campos aceitos:

- titulo;
- descricao;
- categoriaId;
- anonima;
- cidade;
- bairro;
- rua;
- pontoReferencia;
- latitude;
- longitude.

Regras:

- a denuncia nasce com status `ABERTO`;
- a denuncia sempre guarda o usuario real como autor;
- se `anonima=true`, o retorno publico nao expoe o `autorId`;
- se a categoria tiver organizacao responsavel padrao, ela e atribuida como responsavel inicial;
- a pontuacao de relevancia inicia em `0`.

### Listar denuncias

```txt
GET /api/denuncias
```

Permissao:

```txt
Usuario autenticado
```

Filtros opcionais:

- `cidade`;
- `bairro`;
- `status`;
- `categoriaId`.

Paginacao:

- tamanho padrao: `20`;
- tamanho maximo: `100`.

### Detalhar denuncia

```txt
GET /api/denuncias/{id}
```

Permissao:

```txt
Usuario autenticado
```

## Anonimato visual

O anonimato segue a regra definida na documentacao:

- internamente a denuncia sempre fica ligada ao usuario real;
- publicamente, quando anonima, o retorno usa:

```txt
autorId = null
autorNomeExibido = "Morador anonimo"
```

Quando nao anonima:

```txt
autorId = id real do usuario
autorNomeExibido = nome do usuario
```

## Categorias iniciais

Foram adicionadas categorias iniciais na migration, com base na documentacao:

- Infraestrutura;
- Iluminacao publica;
- Limpeza urbana;
- Saude publica;
- Educacao;
- Transporte e mobilidade.

Essas categorias permitem criar denuncias sem depender de cadastro manual inicial.

## Fora do escopo desta alteracao

Ficaram para etapas futuras:

- upload de imagens;
- comentarios;
- confirmacoes;
- urgencias;
- timeline;
- alteracao de status;
- deteccao automatica de duplicidade.

Essa separacao segue a ordem planejada nos documentos existentes, evitando implementar varias regras grandes de uma vez.

## Swagger/OpenAPI

Os endpoints foram documentados em:

```txt
DenunciaControllerOpenApi
```

As rotas protegidas usam `cookieAuth`.
