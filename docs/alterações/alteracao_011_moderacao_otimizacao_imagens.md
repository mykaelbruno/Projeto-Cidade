# Alteracao 011 - Moderacao basica e otimizacao de imagens

## Objetivo

Adicionar uma camada inicial de moderacao e melhorar o upload de imagens para reduzir o tamanho final dos arquivos sem limitar demais o usuario.

## Moderacao basica

Foi criado o modulo `core/moderacao`.

Perfis permitidos:

- `ADMIN_APP`
- `MODERADOR`

### Arquivar denuncia

Endpoint:

`POST /api/moderacoes/denuncias/{denunciaId}/arquivamento`

Corpo:

```json
{
  "motivo": "Conteudo duplicado ou inadequado."
}
```

Comportamento:

- exige motivo obrigatorio;
- altera o status da denuncia para `ARQUIVADO`;
- registra uma moderacao auditavel na tabela `moderacoes`;
- cria evento destacado na timeline da denuncia;
- se a denuncia ja estiver arquivada, retorna conflito.

Evento de timeline:

`DENUNCIA_ARQUIVADA_MODERACAO`

### Remover comentario

Endpoint:

`POST /api/moderacoes/comentarios/{comentarioId}/remocao`

Corpo:

```json
{
  "motivo": "Comentario ofensivo."
}
```

Comportamento:

- exige motivo obrigatorio;
- remove o comentario logicamente usando `removido_em`;
- mantem o registro no banco para auditoria;
- reduz o contador de comentarios da denuncia;
- recalcula a pontuacao de relevancia;
- registra uma moderacao auditavel na tabela `moderacoes`;
- cria evento destacado na timeline da denuncia;
- se o comentario ja tiver sido removido, retorna conflito.

Evento de timeline:

`COMENTARIO_REMOVIDO_MODERACAO`

## Feed geral

O feed geral de denuncias foi ajustado para nao exibir denuncias arquivadas quando nenhum status especifico for informado.

Se algum endpoint chamar o feed com `status=ARQUIVADO`, as denuncias arquivadas podem ser consultadas explicitamente.

## Otimizacao de imagens

O upload de anexos foi melhorado para reduzir o peso final das imagens.

Regras no MVP:

- `image/jpeg` e `image/png` sao processados pelo backend;
- imagens maiores sao redimensionadas para caber em ate `1600x1600`;
- o arquivo final e salvo como `image/jpeg`;
- qualidade padrao: `0.82`;
- `image/webp` continua aceito, mas fica sem recompressao por enquanto porque o Java padrao nao inclui codec WEBP.

Novas configuracoes:

```yaml
app:
  storage:
    denuncia-anexos-max-bytes: ${DENUNCIA_ANEXOS_MAX_BYTES:10485760}
    denuncia-imagem-max-largura: ${DENUNCIA_IMAGEM_MAX_LARGURA:1600}
    denuncia-imagem-max-altura: ${DENUNCIA_IMAGEM_MAX_ALTURA:1600}
    denuncia-imagem-qualidade: ${DENUNCIA_IMAGEM_QUALIDADE:0.82}
```

Limites multipart:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: ${DENUNCIA_ANEXOS_MAX_FILE_SIZE:10MB}
      max-request-size: ${DENUNCIA_ANEXOS_MAX_REQUEST_SIZE:12MB}
```

## Banco de dados

Foi criada a tabela `moderacoes`, com:

- tipo do alvo (`DENUNCIA` ou `COMENTARIO`);
- denuncia vinculada;
- comentario vinculado quando aplicavel;
- moderador;
- motivo;
- data de criacao.

Tambem foi atualizado o check da `timeline_denuncia` para aceitar:

- `DENUNCIA_ARQUIVADA_MODERACAO`
- `COMENTARIO_REMOVIDO_MODERACAO`

## Swagger/OpenAPI

Foi criado o grupo `Moderacao`, com documentacao dos endpoints de arquivamento de denuncia e remocao logica de comentario.

## Alteracoes tecnicas

Arquivos criados:

- `core/moderacao/Moderacao.java`
- `core/moderacao/ModeracaoRepository.java`
- `core/moderacao/ModeracaoService.java`
- `core/moderacao/ModeracaoController.java`
- `core/moderacao/ModeracaoControllerOpenApi.java`
- `core/moderacao/TipoAlvoModeracao.java`
- `core/moderacao/dto/ModeracaoRequestDTO.java`
- `core/moderacao/dto/ModeracaoResponseDTO.java`
- Tabela de moderacoes incorporada em `db/migration/V1__create_core_tables.sql` na alteracao 014.

Arquivos alterados:

- `application.yml`
- `core/comentario/Comentario.java`
- `core/denuncia/Denuncia.java`
- `core/feed/FeedDenunciaRepository.java`
- `core/feed/FeedDenunciaService.java`
- `core/timeline/TipoEventoTimeline.java`
- `core/timeline/TimelineDenunciaService.java`
- `infra/storage/StorageProperties.java`
- `infra/storage/StorageService.java`

## Decisoes conscientes

- A moderacao nao apaga fisicamente denuncia nem comentario.
- Denuncia moderada usa status `ARQUIVADO`, que ja existia no dominio.
- Comentario removido continua no banco com `removido_em` preenchido.
- Motivo de moderacao e obrigatorio para manter auditoria minima.
- WEBP nao foi recomprimido para evitar adicionar dependencia nova sem validar o impacto no projeto.
