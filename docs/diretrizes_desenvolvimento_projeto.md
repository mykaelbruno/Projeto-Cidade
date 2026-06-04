# Diretrizes de desenvolvimento do projeto

Este documento registra combinados importantes para manter o projeto no rumo definido pelo dono da ideia.

## Regras de conduÃ§Ã£o

- Seguir a documentaÃ§Ã£o existente em `/docs`.
- Nao inventar regra de negocio quando houver ambiguidade.
- Perguntar ao dono da ideia quando uma decisao nao estiver clara.
- Manter o Swagger/OpenAPI intuitivo e atualizado a cada novo endpoint.
- A cada alteracao grande, criar um `.md` em `/docs` explicando o funcionamento e o que foi alterado.
- Manter codigo, pacotes e nomes organizados para facilitar manutencao.
- Preferir nomes claros e, quando possivel, em portugues sem acentos no codigo.

## Organizacao de pacotes

Usar `core` para regras de negocio e modelos principais do sistema.

Usar `infra` para partes tecnicas que nao representam entidades centrais de negocio, como:

- autenticacao;
- seguranca;
- documentacao;
- tratamento de erros;
- integracoes externas;
- envio de email;
- armazenamento;
- configuracoes.

## Padrao por modulo

Dentro dos modulos principais, seguir o padrao:

```txt
Model
Service
Repository
Controller
ControllerOpenApi
dto
```

Exemplo:

```txt
core/denuncia
  dto/
  Denuncia.java
  DenunciaService.java
  DenunciaRepository.java
  DenunciaController.java
  DenunciaControllerOpenApi.java
```

## Regras de usuarios e papeis

- O morador se autocadastra.
- O morador nasce com perfil global `MORADOR`.
- O primeiro `ADMIN_APP` e gerado pelo sistema.
- O `ADMIN_APP` pode cadastrar outros usuarios administrativos.
- A prefeitura e cadastrada pelo `ADMIN_APP`.
- A prefeitura pode cadastrar `ADMIN_SECRETARIA` e `ATENDENTE_SECRETARIA`.
- O moderador so pode ser cadastrado pelo `ADMIN_APP`.
- Usuarios devem poder fazer login usando e-mail ou username.
- Evitar conta compartilhada para secretaria. A secretaria deve ser uma organizacao, e pessoas reais devem atuar vinculadas a ela para manter auditoria.
- `ATENDENTE_SECRETARIA` pode existir como papel opcional, mas o MVP pode operar apenas com `ADMIN_SECRETARIA` se a interface precisar ser mais simples.
- A relevancia no MVP deve comecar simples e explicita. Algoritmos com recencia, reincidencia, geografia e reabertura ficam para evolucao posterior.
- Distinguir timeline historica de denuncia e timeline/feed de postagens. A primeira deve ser auditavel e fiel aos eventos; a segunda deve ter ordenacao mista para evitar que apenas denuncias grandes fiquem sempre no topo.
- O feed geral deve usar `MISTO` como modo padrao. No MVP, ele combina relevancia limitada com bonus de recencia para reduzir vies: denuncias com muito engajamento continuam aparecendo, mas denuncias novas tambem recebem oportunidade.
- O sistema pode permitir pulos de status. A organizacao responsavel pode definir o status atual conforme sua avaliacao, sem fluxo obrigatorio rigido no MVP.
- Quando a organizacao marcar uma denuncia como `CONCLUIDO`, isso ainda nao representa validacao final do morador. O autor da denuncia deve poder confirmar ou contestar a conclusao.

## Cuidado com seguranca

- Nao salvar senha pura.
- Nao expor `senhaHash` em DTOs ou respostas.
- Nao versionar segredo real.
- Usar cookies `HttpOnly` para tokens.
- Validar permissoes no backend, nao apenas no frontend.

## Migrations

- Enquanto o projeto ainda nao tiver sido executado em ambiente real, o schema inicial pode ficar consolidado em `V1__create_core_tables.sql`.
- Depois que uma migration for aplicada em banco real, nao reescrever essa migration. Criar uma nova migration incremental para cada mudanca de schema.
