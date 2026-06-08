# Cidade Ativa

Cidade Ativa e uma plataforma de participacao cidada e zeladoria urbana. A ideia central e aproximar moradores, prefeitura e secretarias em um fluxo publico, rastreavel e mais transparente para registrar, acompanhar e resolver problemas da cidade.

Em vez de tratar cada solicitacao como um protocolo isolado, o sistema organiza relatos urbanos em um feed civico: moradores conseguem ver problemas do bairro, apoiar demandas parecidas, marcar urgencia, comentar, anexar fotos e acompanhar a resposta oficial do poder publico. Do outro lado, prefeitura e secretarias recebem um painel operacional para atender, responder, transferir responsabilidade quando necessario e manter historico das acoes.

## O Que O Sistema Permite

### Para moradores

- Criar denuncias urbanas com categoria, endereco, bairro, cidade, fotos e localizacao no mapa.
- Consultar relatos semelhantes antes de enviar uma nova denuncia, evitando duplicidade.
- Acompanhar um feed misto de denuncias abertas, recentes e relevantes.
- Apoiar relatos de outros moradores e marcar problemas como urgentes.
- Comentar em relatos, remover o proprio comentario e sinalizar conteudos inadequados.
- Acompanhar suas proprias denuncias e confirmar ou contestar quando uma demanda for marcada como concluida.

### Para prefeitura

- Visualizar denuncias da cidade separadas por secretaria responsavel.
- Acompanhar indicadores operacionais basicos e exportar relatorios em CSV.
- Criar e gerenciar secretarias, operadores institucionais, bairros e categorias atendidas.
- Aprovar ou recusar solicitacoes de transferencia entre secretarias.
- Reatribuir manualmente uma denuncia quando a responsabilidade estiver incorreta.

### Para secretarias

- Atender os relatos atribuidos a sua organizacao.
- Atualizar status da denuncia durante o atendimento.
- Publicar respostas oficiais visiveis aos moradores.
- Solicitar transferencia para outra secretaria quando a demanda nao for de sua competencia.

### Para moderacao e administracao do sistema

- Moderadores podem revisar sinalizacoes, arquivar relatos indevidos e remover comentarios problematicos.
- O Admin App gerencia prefeituras, secretarias, usuarios globais, vinculos institucionais, categorias, auditoria e moderacao geral.
- Todas as acoes sensiveis passam por regras de permissao e registro de auditoria.

## Ideia De Produto

O Cidade Ativa foi pensado como uma ponte entre comunidade e gestao publica. O morador deixa de depender apenas de canais fechados de atendimento e passa a acompanhar o que acontece na cidade de forma mais clara.

A prefeitura, por sua vez, ganha uma fila organizada de demandas, com trilha de historico, engajamento da comunidade e controle de responsabilidades entre secretarias. Isso reduz retrabalho, evita o "jogo de empurra" e cria um ciclo em que a conclusao de um problema pode ser validada pelo proprio cidadao que abriu o relato.

## Fluxo Basico

1. O morador se cadastra e acessa o feed da sua cidade.
2. Ele cria uma denuncia informando categoria, bairro, localizacao e fotos.
3. O sistema valida se a denuncia pertence a cidade do morador e sugere relatos semelhantes quando existirem.
4. A denuncia entra no fluxo operacional da prefeitura ou secretaria responsavel.
5. A organizacao publica respostas oficiais e atualiza o status.
6. Se a demanda for concluida, o morador pode confirmar ou contestar a resolucao.
7. Comentarios e relatos inadequados podem ser sinalizados para moderacao.

## Stack Em Uma Visao Rapida

O projeto e dividido em backend e frontend.

No backend:

- Java 21.
- Spring Boot.
- Spring Security com autenticacao por JWT/cookies.
- Spring Data JPA e Hibernate.
- PostgreSQL.
- Flyway para migrations.
- OpenAPI/Swagger para documentacao da API.
- Testes com JUnit, Spring Boot Test e H2 em cenarios locais.

No frontend:

- React com Vite.
- TypeScript.
- React Router.
- Tailwind CSS e componentes de UI.
- Leaflet/OpenStreetMap para mapas.
- Services organizados por dominio para conversar com a API real.

## Organizacao Do Projeto

```text
src/main/java/com/mykael/prefeitura
  core/        regras principais do dominio
  infra/       autenticacao, seguranca, email, auditoria e configuracoes

src/main/resources/db/migration
  migrations Flyway do banco

front/
  aplicacao React integrada ao backend

docs/
  documentacao de produto, alteracoes e fechamento da integracao
```

## Documentacao

Alguns documentos importantes:

- `SISTEMA.md`: visao detalhada da ideia e das regras gerais do sistema.
- `docs/finalizacao/api-contract.md`: contrato da API usado para integrar frontend e backend.
- `docs/finalizacao/integracao_front_backend.md`: acompanhamento da integracao e pendencias conscientes.
- `docs/alterações/`: historico das grandes alteracoes implementadas.

Com a aplicacao backend rodando, a documentacao Swagger fica disponivel em:

```text
http://localhost:8080/swagger-ui.html
```

## Estado Atual

O backend ja cobre os fluxos principais de autenticacao, denuncias, feed, anexos, comentarios, interacoes, operacao institucional, transferencias, notificacoes, moderacao, usuarios, organizacoes, vinculos, categorias, bairros e auditoria.

O frontend em `front/` ja esta majoritariamente conectado aos contratos reais do backend. As pendencias atuais estao registradas em `docs/finalizacao/integracao_front_backend.md`, principalmente revisao manual em navegador, possivel code-splitting futuro e eventual uso de geometria oficial para bairros.
