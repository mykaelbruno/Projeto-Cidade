# Alteracao 052 - Resolucao de Pendencias de Feed, Imagem de Capa e Busca

Data: 2026-06-04

## Objetivo

Resolver pendencias conscientes de integracao entre backend e frontend relacionadas a performance dos cards de denuncia e busca textual nas listagens principais.

Antes desta alteracao, telas como feed, mapa e minhas denuncias precisavam buscar anexos individualmente para descobrir a primeira imagem de cada relato. Isso funcionava, mas criava chamadas N+1 e poderia deixar a interface mais lenta conforme a quantidade de denuncias aumentasse.

## Backend

### Imagem de capa da denuncia

`DenunciaResponseDTO` passou a expor o campo:

```json
{
  "imagemCapaUrl": "/api/denuncias/10/anexos/22/arquivo"
}
```

O valor representa a primeira imagem anexada a denuncia, quando existir. Se a denuncia nao tiver anexo de imagem, o campo retorna `null`.

A busca das capas foi centralizada em `AnexoDenunciaRepository.buscarCapasPorDenunciasIds`, carregando as capas da pagina atual em lote. Assim, listagens paginadas conseguem montar os cards sem consultar anexos um por um.

### Busca textual

As listagens de denuncias passaram a aceitar o filtro `termo`.

O termo busca nos campos:

- titulo;
- descricao;
- cidade;
- bairro;
- rua;
- ponto de referencia;
- nome da categoria.

Endpoints impactados:

- `GET /api/feed/denuncias?termo=...`
- `GET /api/denuncias?termo=...`
- `GET /api/denuncias/minhas?termo=...`

## Frontend

O mapper `denunciaMapper.ts` agora converte `imagemCapaUrl` para URL absoluta via `getApiUrl`.

Telas ajustadas:

- `HomePage`: usa `imagemCapaUrl` do feed e envia `termo` para busca textual server-side.
- `MapPage`: usa a imagem de capa ja presente no item do feed.
- `MyReportsPage`: usa `imagemCapaUrl` de `GET /api/denuncias/minhas`.

Com isso, as telas deixaram de buscar anexos de cada relato apenas para montar card. O detalhe da denuncia continua buscando anexos completos, pois ali a galeria precisa de todos os arquivos.

## Swagger

As interfaces OpenAPI de denuncias e feed foram atualizadas para documentar:

- filtro `termo`;
- presenca de `imagemCapaUrl` nas respostas de denuncia;
- uso do filtro textual no feed.

## Validacao

- `mvn test`: passou com 42 testes concluídos e 1 teste pulado por indisponibilidade de Docker/Testcontainers.
- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- A categoria do modal de filtros do feed ainda filtra localmente por nome na pagina carregada. Para tornar isso totalmente server-side, o front precisa trocar o nome selecionado pelo `categoriaId`.
- O backend ainda nao gera thumbnail fisica/comprimida dedicada; `imagemCapaUrl` aponta para o arquivo de imagem original ja servido pelo endpoint de anexos.
