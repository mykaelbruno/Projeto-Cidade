# Alteracao 037 - Bairros, Reports e Transferencia de Vinculo

Data: 2026-06-02

## Objetivo

Implementar as regras destravadas para a integracao front-back:

- bairros controlados pela prefeitura;
- report de denuncia com motivo fixo e comentario curto;
- troca real de usuario institucional entre secretarias sem criar novo login ou novo vinculo.

## Bairros por prefeitura

Foi criado o dominio `core/bairro`, seguindo a organizacao Model - Service - Repository - Controller:

- `Bairro`;
- `BairroRepository`;
- `BairroService`;
- `BairroController`;
- `BairroControllerOpenApi`;
- DTOs em `core/bairro/dto`.

Campos do bairro:

- `id`;
- `prefeitura`;
- `nome`;
- `ativo`;
- `criadoEm`;
- `atualizadoEm`.

Endpoints:

- `GET /api/prefeituras/{prefeituraId}/bairros/ativos`
  - publico;
  - retorna apenas bairros ativos;
  - pensado para cadastro, filtros e nova denuncia.
- `GET /api/prefeituras/{prefeituraId}/bairros`
  - `ADMIN_APP` ou `ADMIN_PREFEITURA`;
  - retorna ativos e inativos para gestao.
- `POST /api/prefeituras/{prefeituraId}/bairros`
  - cria bairro da prefeitura.
- `PUT /api/prefeituras/{prefeituraId}/bairros/{bairroId}`
  - atualiza nome do bairro.
- `PATCH /api/prefeituras/{prefeituraId}/bairros/{bairroId}/ativacao`
  - ativa/desativa bairro.

## Reports de denuncia

O report deixou de receber apenas texto livre em `motivo`.

Novo payload:

```json
{
  "motivo": "FAKE_NEWS",
  "comentario": "A denuncia parece conter informacoes falsas ou manipuladas."
}
```

Motivos fixos:

- `IMAGEM_INADEQUADA`;
- `SPAM`;
- `FAKE_NEWS`;
- `CONTEUDO_OFENSIVO`;
- `DADOS_PESSOAIS_EXPOSTOS`;
- `DENUNCIA_DUPLICADA`;
- `LOCALIZACAO_INCORRETA`;
- `CATEGORIA_INCORRETA`;
- `OUTRO`.

O response de sinalizacao agora tambem retorna `motivo` e `comentario`.

## Transferencia de usuario entre secretarias

Foi criado o endpoint:

- `PATCH /api/vinculos/{vinculoId}/secretaria`

Payload:

```json
{
  "secretariaDestinoId": 3
}
```

Regra aplicada:

- o vinculo existente troca a organizacao para a secretaria de destino;
- nao cria novo login;
- nao cria novo vinculo ativo;
- origem e destino precisam ser secretarias;
- origem e destino precisam pertencer a mesma prefeitura;
- destino precisa estar ativo;
- `ADMIN_PREFEITURA` so pode transferir dentro do proprio municipio;
- `ADMIN_APP` pode executar globalmente.

## Auditoria

Foram adicionadas acoes/alvos de auditoria para:

- criacao, atualizacao e ativacao de bairro;
- transferencia de vinculo para outra secretaria.

## Banco de dados

Foi adicionada a migration `V5__bairros_reports_vinculos.sql`, que:

- cria a tabela `bairros`;
- altera `sinalizacoes_denuncia` para separar `motivo` e `comentario`;
- adiciona constraint dos motivos fixos de report;
- atualiza constraints de auditoria para novos eventos.

## Swagger

Foram adicionados exemplos e documentacao OpenAPI para:

- endpoints de bairros;
- novo formato de sinalizacao/report;
- transferencia de vinculo entre secretarias.

## Validacao

Executado:

```bash
mvn test
```

Resultado:

- 42 testes executados;
- 0 falhas;
- 1 teste ignorado por depender de Docker/Testcontainers.

## Pendencias conscientes

- A validacao obrigatoria de bairro em cadastro de morador e criacao de denuncia ainda nao foi aplicada, porque os DTOs atuais recebem apenas `cidade` e `bairro`.
- Para validar bairro de forma forte, o backend provavelmente precisa receber `prefeituraId` nesses fluxos ou algum identificador inequivoco de cidade/UF.
- Integracao geografica do bairro com mapa nao foi implementada. Apenas o nome nao e confiavel para geolocalizacao precisa; se isso virar necessidade, o ideal e adicionar centroide ou limites geograficos.
