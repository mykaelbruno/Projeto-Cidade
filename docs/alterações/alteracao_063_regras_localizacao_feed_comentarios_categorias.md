# Alteracao 063 - Regras de localizacao, feed, comentarios e categorias

Data: 2026-06-05

## Objetivo

Resolver as pendencias priorizadas antes de voltar ao roadmap comum de integracao. A alteracao reforca regras de negocio no backend e alinha o front com os novos contratos, sem inventar dados geograficos nem relaxar validacoes.

## O que mudou

- A criacao de denuncia agora aceita `prefeituraId` e `bairroId` em `DenunciaCreateRequestDTO`.
- O backend valida que o morador so cria denuncia para a propria cidade.
- Quando `prefeituraId` e `bairroId` sao enviados, o backend valida se a prefeitura pertence a cidade do morador e se o bairro esta ativo nessa prefeitura.
- A busca de denuncias semelhantes aplica a mesma validacao de cidade, prefeitura e bairro da criacao.
- Denuncias com status `CONCLUIDO` nao aparecem no feed inicial quando o filtro `status` nao foi informado.
- Bairros ganharam `centroideLatitude` e `centroideLongitude` opcionais.
- O front de gestao de bairros permite cadastrar/editar o centroide opcional.
- Comentarios podem ser sinalizados por rota propria: `POST /api/denuncias/{denunciaId}/comentarios/{comentarioId}/sinalizacoes`.
- O autor pode remover logicamente o proprio comentario por `DELETE /api/denuncias/{denunciaId}/comentarios/{comentarioId}`.
- Sinalizacoes de comentario retornam `comentarioId` e `comentarioSinalizadoConteudo` para a moderacao.
- O painel operacional passou a aceitar `termo` server-side em `GET /api/operacional/organizacoes/{organizacaoId}/denuncias`.
- A tela operacional envia a busca textual para o backend, inclusive na exportacao CSV.
- A prefeitura pode manejar as categorias cobertas por uma secretaria pela tela de administracao.
- Swagger foi atualizado com descricoes e exemplos de denuncia/bairro coerentes com os novos campos.

## Sobre centroide e geometria

Centroide e um ponto aproximado no centro de uma area. No sistema, ele foi implementado como latitude/longitude opcional do bairro para ajudar o front a centralizar mapa ou sugerir foco visual.

Geometria seria o limite completo do bairro, normalmente um poligono com varios pontos. Isso nao foi implementado agora porque exigiria dados oficiais de geoprocessamento da prefeitura ou de outra fonte confiavel. O sistema nao deve inventar limites de bairro.

## Banco de dados

Foi criada a migration `V6__denuncia_bairro_comentarios_sinalizados.sql`, adicionando:

- `bairros.centroide_latitude`;
- `bairros.centroide_longitude`;
- `denuncias.prefeitura_id`;
- `denuncias.bairro_id`;
- `sinalizacoes_denuncia.comentario_id`;
- auditoria `COMENTARIO_REMOVIDO_AUTOR`.

## Frontend

Arquivos principais alterados:

- `front/src/app/components/NewReportFlow.tsx`;
- `front/src/app/pages/admin/BairrosPage.tsx`;
- `front/src/app/pages/admin/AdministracaoPage.tsx`;
- `front/src/app/pages/ReportDetailPage.tsx`;
- `front/src/app/components/operacional/OperationalReports.tsx`;
- `front/src/app/pages/moderador/ModeradorPage.tsx`;
- `front/src/app/pages/adminapp/ModeracaoPage.tsx`.

## Validacao

- `mvn test`: sucesso, 42 testes executados, 0 falhas, 1 ignorado.
- `npm.cmd run build`: sucesso.

Observacao do build front: o Vite ainda alerta que o chunk principal passou de 500 kB. Isso nao quebrou a compilacao, mas fica como refinamento futuro de performance com code-splitting.

## Pendencias conscientes

- Geometria completa de bairros continua pendente e depende de dados oficiais de area/poligono.
- Revisao manual em navegador ainda e recomendada para os fluxos novos de centroide, sinalizacao/remocao de comentario e busca operacional.
