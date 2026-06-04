# Alteracao 024 - Revisao final do Swagger com exemplos

## Objetivo

Melhorar a documentacao OpenAPI/Swagger para servir como guia mais claro para o frontend, sem alterar comportamento da API, regras de negocio, DTOs, banco, services ou seguranca.

## O que foi padronizado

- `summary` mais direto nos contratos `*ControllerOpenApi`.
- `description` com regra principal e, quando aplicavel, permissao esperada.
- `@SecurityRequirement(name = "cookieAuth")` nas rotas protegidas.
- `@Parameter` em parametros de rota, filtros e consultas relevantes.
- `@ApiResponse` para respostas de sucesso (`200`, `201`, `204`) quando aplicavel.
- Respostas de erro comuns usando `ErroApiResponse` como schema documental.
- Exemplo padrao de erro para validacao/regra invalida.
- Classe central `OpenApiExemplos` para concentrar exemplos reutilizaveis e evitar duplicacao nos contratos.

## Como o frontend deve usar o Swagger

O Swagger passa a ser a referencia principal para:

- descobrir quais endpoints exigem cookie de autenticacao;
- entender quais perfis podem executar cada operacao;
- montar payloads de request com exemplos realistas;
- identificar erros comuns por categoria, sem depender de uma mensagem exata fixa;
- diferenciar endpoints publicos, autenticados, administrativos, operacionais e de moderacao.

As mensagens de erro documentadas representam categorias esperadas (`400`, `401`, `403`, `404`, `409`, `429`). O frontend deve tratar esses status de forma consistente, mas nao deve depender do texto exato da mensagem.

## Endpoints que receberam exemplos ou respostas revisadas

- Autenticacao:
  - cadastro de morador;
  - login por username ou e-mail;
  - refresh;
  - logout;
  - usuario autenticado.
- Conta:
  - solicitar verificacao de e-mail;
  - confirmar verificacao;
  - solicitar recuperacao de senha;
  - redefinir senha.
- Denuncias:
  - criar denuncia;
  - listar;
  - listar minhas denuncias;
  - buscar por id;
  - alterar status;
  - confirmar conclusao;
  - contestar conclusao.
- Comentarios:
  - comentario de morador;
  - resposta oficial institucional;
  - listagem de comentarios.
- Sinalizacao e moderacao:
  - sinalizar denuncia;
  - listar sinalizacoes;
  - marcar sinalizacao como analisada;
  - arquivar denuncia;
  - remover comentario.
- Fluxo operacional:
  - listar denuncias acessiveis por organizacao;
  - solicitar transferencia;
  - listar solicitacoes;
  - aprovar transferencia;
  - recusar transferencia;
  - alterar responsavel manualmente.
- Gestao administrativa:
  - usuarios;
  - prefeituras;
  - secretarias;
  - usuarios institucionais;
  - categorias;
  - vinculos usuario-organizacao.
- Recursos de apoio:
  - anexos;
  - feed;
  - interacoes;
  - notificacoes;
  - paineis;
  - timeline;
  - auditoria.

## Pendencias conscientes

- O Swagger continua publico no ambiente local/dev, seguindo o estado atual do projeto. Antes de producao, revisar se ele deve ficar protegido, desabilitado ou exposto apenas em perfil interno.
- Os exemplos sao realistas e focados nos fluxos principais, mas nao tentam cobrir todos os campos opcionais em todas as combinacoes possiveis.
- As respostas de erro documentam categorias e cenarios comuns, nao prometem texto exato para cada regra de negocio.

## Validacao

- A alteracao e exclusivamente documental/OpenAPI.
- Deve ser validada com `mvn test`.
- Conferencia manual recomendada em `/swagger-ui.html` apos subir a aplicacao localmente.
