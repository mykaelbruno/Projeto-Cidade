# Alteracao 010 - Anexos e fotos da denuncia

## Objetivo

Permitir que o morador autor da denuncia envie fotos como evidencias do problema urbano relatado.

Os anexos foram implementados como arquivos de imagem armazenados em disco local configuravel, com metadados salvos no banco. Essa escolha mantem o MVP simples e evita depender agora de servicos externos como S3, Cloudinary ou outro storage.

## Endpoints criados

Base:

`/api/denuncias/{denunciaId}/anexos`

### Enviar anexo

`POST /api/denuncias/{denunciaId}/anexos`

Formato:

`multipart/form-data`

Campo:

- `arquivo`: imagem da denuncia.

Permissao:

- Apenas `MORADOR`.
- Apenas o autor real da denuncia pode anexar fotos.

Formatos aceitos no MVP:

- `image/jpeg`
- `image/png`
- `image/webp`

Limite padrao apos a otimizacao adicionada posteriormente:

- 10 MB por arquivo enviado.
- JPEG e PNG sao redimensionados e recomprimidos antes de salvar.
- WEBP continua aceito, mas e armazenado sem recompressao no MVP.

### Listar anexos

`GET /api/denuncias/{denunciaId}/anexos`

Retorna os metadados dos anexos da denuncia, incluindo `urlDownload`.

### Baixar arquivo

`GET /api/denuncias/{denunciaId}/anexos/{anexoId}/arquivo`

Retorna a imagem do anexo. O endpoint exige autenticacao.

## Timeline historica

Foi adicionado o evento:

`ANEXO_ADICIONADO`

Quando o autor adiciona uma foto, a timeline recebe um evento nao destacado:

```txt
Anexo adicionado pelo morador.
```

O evento nao e destacado para evitar poluir visualmente a timeline quando houver varias fotos.

## Configuracoes

Novas propriedades:

```yaml
app:
  storage:
    denuncia-anexos-dir: ${DENUNCIA_ANEXOS_DIR:uploads/denuncias}
    denuncia-anexos-max-bytes: ${DENUNCIA_ANEXOS_MAX_BYTES:5242880}
```

Tambem foram configurados limites do multipart:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: ${DENUNCIA_ANEXOS_MAX_FILE_SIZE:10MB}
      max-request-size: ${DENUNCIA_ANEXOS_MAX_REQUEST_SIZE:12MB}
```

## Banco de dados

Foi criada a tabela `anexos_denuncia` com:

- denuncia vinculada;
- autor do anexo;
- nome original;
- nome armazenado;
- caminho do arquivo;
- content type;
- tamanho em bytes;
- data de criacao.

Tambem foi atualizado o check de tipos da `timeline_denuncia` para aceitar `ANEXO_ADICIONADO`.

## Swagger/OpenAPI

Foi criado o grupo `Anexos da Denuncia`, com documentacao para:

- upload multipart;
- listagem de anexos;
- download do arquivo.

## Tratamento de erro

Quando o arquivo ultrapassa o limite de upload configurado, a API retorna erro `400` com o codigo `ARQUIVO_MUITO_GRANDE`.

## Alteracoes tecnicas

Arquivos criados:

- `core/anexo/AnexoDenuncia.java`
- `core/anexo/AnexoDenunciaRepository.java`
- `core/anexo/AnexoDenunciaService.java`
- `core/anexo/AnexoDenunciaController.java`
- `core/anexo/AnexoDenunciaControllerOpenApi.java`
- `core/anexo/ArquivoDenunciaDTO.java`
- `core/anexo/dto/AnexoDenunciaResponseDTO.java`
- `core/anexo/dto/AnexoDenunciaUploadRequestOpenApi.java`
- `infra/storage/StorageConfig.java`
- `infra/storage/StorageProperties.java`
- `infra/storage/StorageService.java`
- `infra/storage/ArquivoArmazenado.java`
- Tabela de anexos incorporada em `db/migration/V1__create_core_tables.sql` na alteracao 014.

Arquivos alterados:

- `.gitignore`
- `application.yml`
- `infra/error/GlobalExceptionHandler.java`
- `core/timeline/TipoEventoTimeline.java`
- `core/timeline/TimelineDenunciaService.java`

## Decisoes conscientes

- No MVP, apenas o autor da denuncia pode anexar fotos.
- Anexos oficiais de prefeitura ou secretaria podem ser adicionados depois, provavelmente vinculados a respostas oficiais ou atualizacoes de status.
- O armazenamento local e suficiente para desenvolvimento e MVP inicial, mas pode ser trocado por storage externo mantendo a mesma camada `infra/storage`.
