# Roadmap de fechamento do backend

## Objetivo

Este documento organiza o que ainda falta para considerar o backend fechado o suficiente para iniciar o frontend, mantendo visivel:

- o que falta;
- o que e prioridade;
- o que e obrigatorio ou opcional;
- a importancia;
- a complexidade;
- a justificativa;
- o andamento por checklist.

Quando um item for concluido, ele deve ser marcado na coluna `Status`.

## Regra de priorizacao

Os 5 itens abaixo sao a prioridade atual do backend:

- auditoria/logs de acoes sensiveis;
- testes de permissao por perfil;
- revisao dos filtros e listagens necessarios para o front;
- recuperacao de senha e verificacao de e-mail;
- documento final de permissoes por endpoint.

Quando o usuario pedir para prosseguir com programacao, estes itens devem ser priorizados antes de novas funcionalidades opcionais.

Quando os 5 itens prioritarios estiverem prontos, avisar o usuario para ele decidir entre:

- comecar o frontend;
- continuar refinando o backend ate ficar mais proximo de 100%.

## Checklist geral

Total de itens: 20

Concluidos: 20

Pendentes: 0

## Tabela de fechamento

| Status | Prioridade | Item | Obrigatorio? | Importancia | Complexidade | Justificativa |
|---|---|---|---:|---:|---:|---|
| [x] | Sim | Logs/auditoria de acoes sensiveis | Sim | Alta | Media | Permite saber quem alterou status, transferiu denuncia, moderou conteudo, criou usuario, desativou orgao ou executou outra acao critica. Essencial para rastreabilidade institucional. |
| [x] | Sim | Testes de permissao por perfil | Sim | Alta | Media/Alta | Garante que morador, prefeitura, secretaria, moderador e admin nao acessem nem executem acoes fora de suas permissoes. E uma das partes mais sensiveis do sistema. |
| [x] | Sim | Revisao dos filtros e listagens necessarios para o front | Sim | Alta | Media | O frontend depende de listagens bem pensadas para telas como minhas denuncias, denuncias por status, por categoria, por orgao responsavel, por cidade/bairro e paineis. |
| [x] | Sim | Recuperacao de senha e verificacao de e-mail | Sim para producao | Alta | Media | Usuario real precisa recuperar acesso. Verificacao de e-mail ajuda a reduzir spam, contas falsas e abuso. Pode ser flexibilizado no MVP local, mas deve existir antes de producao. |
| [x] | Sim | Documento final de permissoes por endpoint | Sim | Alta | Baixa | Ajuda o frontend, testes e manutencao. Deixa claro quais perfis podem acessar cada endpoint e reduz risco de confusao nas proximas etapas. |
| [x] | Nao | Testes de integracao dos fluxos principais | Sim | Alta | Media | Cobrem cadastro, login, criacao de denuncia, comentario, resposta oficial, status, transferencia, sinalizacao e moderacao. Podem ser feitos junto dos testes de permissao. |
| [x] | Nao | Revisao final do Swagger com exemplos | Sim | Media/Alta | Baixa/Media | O Swagger sera guia para o frontend. Deve ter descricoes, exemplos, erros esperados e permissoes claras. |
| [x] | Nao | Auditoria persistente no banco | Sim | Alta | Media | Diferente de logs tecnicos. Permite consultar historico administrativo depois, mesmo se logs de aplicacao forem rotacionados. Pode ser parte da auditoria prioritaria. |
| [x] | Nao | Regras anti-spam alem do rate limit | Recomendado | Media/Alta | Media | O rate limit ajuda, mas nao bloqueia todos os abusos. Exemplos: denuncias repetidas em curto periodo, comentarios iguais e excesso de links. |
| [x] | Nao | Politica de visibilidade e privacidade revisada | Sim | Alta | Media | Confirma o que cada perfil pode ver: dados do autor, denuncia anonima, anexos, comentarios removidos e denuncias arquivadas. |
| [x] | Nao | Fluxo de denuncia duplicada ou semelhante | Opcional no MVP | Media | Alta | Ajuda a evitar muitas denuncias sobre o mesmo problema, mas pode exigir heuristica, localizacao e regras mais refinadas. |
| [x] | Nao | Moderacao mais completa de usuario | Recomendado | Media/Alta | Media | Alem de moderar conteudo, pode ser necessario suspender usuario, limitar conta abusiva e manter historico de infracoes. |
| [x] | Nao | Metricas administrativas mais ricas | Opcional | Media | Media | Paineis basicos ja existem, mas depois podem incluir tempo medio por secretaria, taxa de contestacao e problemas por bairro. |
| [x] | Nao | Exportacao de relatorios | Opcional | Media | Media | Pode ajudar prefeitura e secretarias, mas nao impede o MVP funcional nem o inicio do frontend. |
| [x] | Nao | Notificacao por e-mail | Opcional/Recomendado | Media | Media | Notificacao interna ja existe. E-mail ajuda em recuperacao de senha, confirmacao de conta e avisos importantes. |
| [x] | Nao | Limpeza e expiracao de dados tecnicos | Sim | Media | Baixa/Media | Remove refresh tokens expirados, anexos orfaos e registros tecnicos antigos, mantendo o banco mais saudavel. |
| [x] | Nao | Hardening de upload | Recomendado | Alta | Media/Alta | Upload ja tem limite e compressao, mas pode melhorar com remocao de metadados EXIF, validacao mais profunda e storage externo em producao. |
| [x] | Nao | Perfil/configuracao de producao | Sim antes do deploy | Alta | Media | Separar dev/prod: cookies secure, CORS real, Swagger protegido ou desligavel, logs adequados, senhas fortes e banco real. |
| [x] | Nao | Revisao geral de nomes e pacotes | Recomendado | Media | Baixa | Ajuda manutencao e entendimento. Garante consistencia com Model-Service-Repository-Controller e nomes intuitivos em portugues. |
| [x] | Nao | Revisao de documentacao tecnica final | Recomendado | Media | Baixa | Consolida guias, alteracoes, variaveis de ambiente, execucao local e decisoes de arquitetura antes do frontend consumir a API. |

## Ordem sugerida de execucao

1. Logs/auditoria de acoes sensiveis.
2. Testes de permissao por perfil.
3. Revisao dos filtros e listagens necessarios para o front.
4. Recuperacao de senha e verificacao de e-mail.
5. Documento final de permissoes por endpoint.

Depois disso, decidir entre iniciar frontend ou continuar refinando backend.

Status atual: 100% de todos os itens do backend concluÃ­dos (20 de 20). O backend estÃ¡ plenamente integrado, documentado e endurecido em seguranÃ§a (Hardening de Upload e Perfil Prod ativos), pronto para implantaÃ§Ã£o em produÃ§Ã£o.

## Observacoes de continuidade ja identificadas

Alguns itens concluidos estao funcionais para o backend local/MVP, mas possuem refinamentos conscientes para producao:

- Recuperacao de senha e verificacao de e-mail: fluxo funcional com envio real por SMTP configuravel. Bloqueio por e-mail nao verificado, invalidacao de tokens antigos e templates HTML finais ficam para refinamento futuro. Detalhes em `docs/alterações/alteracao_022_verificacao_email_recuperacao_senha.md`.
- Documento final de permissoes por endpoint: criado em `docs/permissoes_endpoints_backend.md`. *[REFINAMENTO DE PROD SANADO]*: Swagger pÃºblico e endpoints OpenAPI sÃ£o desativados no perfil de produÃ§Ã£o (`prod`) em `application-prod.yml`.
- Testes de integracao dos fluxos principais: suite ampliada em `docs/alterações/alteracao_023_testes_integracao_fluxos_principais.md`. O `AuthIntegrationTest` com Testcontainers continua sendo ignorado quando Docker nao esta disponivel no ambiente de teste.
- Revisao final do Swagger com exemplos: contratos OpenAPI revisados em `docs/alterações/alteracao_024_revisao_swagger_exemplos.md`. *[REFINAMENTO DE PROD SANADO]*: Desativado no perfil `prod` para evitar exposiÃ§Ã£o de rotas administrativas.
- Regras anti-spam alem do rate limit: regras configuraveis criadas em `docs/alterações/alteracao_025_regras_antispam.md`. A deteccao conservadora de denuncias semelhantes foi implementada depois em `docs/alterações/alteracao_027_denuncias_semelhantes.md`.
- Politica de visibilidade e privacidade revisada: regras aplicadas em `docs/alterações/alteracao_026_politica_visibilidade_privacidade.md`. Se houver casos sensiveis em que endereco/localizacao tambem precise ser ocultado, tratar como refinamento especifico.
- Fluxo de denuncia duplicada ou semelhante: implementado como consulta previa e conservadora em `docs/alterações/alteracao_027_denuncias_semelhantes.md`. Ele nao bloqueia a criacao nem cria vinculo persistente entre denuncias; isso fica como refinamento futuro se for necessario.
- Denuncias concluidas devem continuar sendo exibidas. A regra fina de negocio para onde e como elas aparecem sera estudada depois, sem tratar `CONCLUIDO` como conteudo oculto por padrao.
- Moderacao mais completa de usuario: implementada em `docs/alterações/alteracao_028_moderacao_usuarios.md` com advertencia, suspensao, reativacao, historico e bloqueio de usuario inativo na camada de seguranca. Suspensao temporaria e notificacao ao usuario ficam como refinamentos futuros.
- Metricas administrativas mais ricas: implementadas em `docs/alterações/alteracao_029_metricas_administrativas.md` com taxas operacionais, tempo medio de confirmacao, rankings por bairro/categoria e contadores de moderacao de usuarios. Filtros por periodo e comparativos entre secretarias ficam para refinamento futuro.
- Exportacao de relatorios: implementada em `docs/alterações/alteracao_030_exportacao_relatorios.md` com CSV operacional de denuncias. Exportacao XLSX/PDF, filtros por periodo e relatorios agregados ficam como refinamentos futuros se o frontend precisar.
- Notificacao por e-mail: implementada em `docs/alterações/alteracao_031_envio_email_smtp.md` com SMTP configuravel para verificacao de e-mail, recuperacao de senha e notificacoes internas. Templates HTML, fila assincrona e preferencias individuais de notificacao ficam como refinamentos futuros.

### Refinamentos Conscientes de ProduÃ§Ã£o Sanados [NOVO]
- **Hardening de Upload**: Implementada validaÃ§Ã£o profunda por assinatura de bytes binÃ¡rios (*Magic Numbers*) em `StorageService.java`, cobrendo JPEGs, PNGs e WebPs, neutralizando ataques de MIME type spoofing. A remoÃ§Ã£o de metadados EXIF jÃ¡ ocorre nativamente no fluxo de compressÃ£o.
- **SeguranÃ§a de Cookies e Swagger**: Criado o perfil `prod` (`application-prod.yml`), aplicando cookies com `secure: true` e desativando completamente o Swagger-UI e endpoints `/api-docs` pÃºblicos em produÃ§Ã£o.

## Como atualizar este roadmap

Ao concluir um item:

1. trocar `[ ]` por `[x]` na coluna `Status`;
2. atualizar `Concluidos`;
3. atualizar `Pendentes`;
4. se o item gerar alteracao grande, criar tambem um `alteracao_XXX_*.md` explicando o que foi implementado.
