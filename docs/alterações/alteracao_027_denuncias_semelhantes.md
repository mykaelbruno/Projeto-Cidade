# Alteracao 027 - Fluxo de denuncias semelhantes

## Objetivo

Implementar uma primeira versao conservadora para detectar possiveis denuncias duplicadas ou semelhantes, sem bloquear automaticamente a criacao de novas denuncias.

A ideia e ajudar o frontend a avisar o morador antes do envio final:

```txt
Ja existe uma denuncia parecida perto desse local.
Deseja apoiar a denuncia existente ou continuar criando uma nova?
```

## O que foi implementado

- Novo endpoint:
  - `POST /api/denuncias/semelhantes`
- Permissao:
  - apenas `MORADOR`.
- Request:
  - usa o mesmo formato de criacao de denuncia (`DenunciaCreateRequestDTO`), para o frontend reaproveitar os dados do formulario.
- Response:
  - lista de possiveis denuncias semelhantes, limitada a 5 itens.
  - nao retorna dados do autor.
  - retorna motivos objetivos da sugestao, como mesma categoria, mesmo bairro, localizacao proxima, mesma rua e texto parecido.

## Criterios atuais

A consulta procura candidatas com:

- mesma categoria;
- mesma cidade;
- mesmo bairro;
- status ativo:
  - `ABERTO`;
  - `EM_ANALISE`;
  - `ENCAMINHADO`;
  - `EM_ANDAMENTO`;
  - `PROGRAMADO`;
  - `REABERTO`.

Denuncias `CONCLUIDO` e `ARQUIVADO` nao sao sugeridas como destino de apoio.

Quando a nova denuncia e a candidata possuem latitude e longitude, a distancia precisa ficar dentro do raio conservador de 500 metros.

Quando alguma das denuncias nao possui coordenadas, o sistema usa criterios mais seguros:

- mesma rua; ou
- texto minimamente parecido.

## Como o frontend deve usar

Fluxo recomendado:

1. Morador preenche o formulario de denuncia.
2. Antes de criar, o frontend chama `POST /api/denuncias/semelhantes`.
3. Se a resposta vier vazia, o frontend segue para criar normalmente.
4. Se vierem sugestoes, o frontend exibe as denuncias parecidas.
5. O morador escolhe entre:
   - apoiar/interagir com a denuncia existente;
   - continuar criando uma nova denuncia.

Importante: esta etapa nao substitui a criacao. Ela e uma ajuda de UX e organizacao do feed.

## Arquivos alterados

- `src/main/java/com/mykael/prefeitura/core/denuncia/DenunciaSemelhanteService.java`
- `src/main/java/com/mykael/prefeitura/core/denuncia/DenunciaController.java`
- `src/main/java/com/mykael/prefeitura/core/denuncia/DenunciaControllerOpenApi.java`
- `src/main/java/com/mykael/prefeitura/core/denuncia/DenunciaRepository.java`
- `src/main/java/com/mykael/prefeitura/core/denuncia/dto/DenunciaSemelhanteResponseDTO.java`
- `src/main/java/com/mykael/prefeitura/infra/doc/OpenApiExemplos.java`
- `src/test/java/com/mykael/prefeitura/core/denuncia/DenunciaListagemIntegrationTest.java`
- `docs/permissoes_endpoints_backend.md`

## Decisoes conscientes

- A criacao de denuncia nao foi bloqueada automaticamente.
- Nao foi criada migration, pois o fluxo usa dados ja existentes em `denuncias`.
- Nao foi implementada comparacao por imagem.
- Nao foi implementado vinculo persistente entre denuncia original e denuncia duplicada.
- A pontuacao de semelhanca e heuristica simples, feita para orientar o usuario, nao para tomar decisao final.

## Validacao

- Foram adicionados testes de integracao para:
  - sugerir denuncia ativa e proxima;
  - nao sugerir denuncia arquivada ou concluida.
- `mvn test`
- Resultado observado: 36 testes executados, 0 falhas, 0 erros, 1 ignorado.
- O teste ignorado continua sendo o fluxo com Testcontainers quando Docker nao esta disponivel.

## Proximos refinamentos possiveis

- Permitir que moderacao ou prefeitura marque uma denuncia como duplicada de outra de forma persistente.
- Criar metrica administrativa de denuncias semelhantes por bairro/categoria.
- Ajustar raio por categoria, caso algumas demandas precisem de raio maior ou menor.
- Usar geolocalizacao mais precisa em banco com extensao geografica no futuro, se o projeto precisar escalar.
