# Alteracao 044 - Integracao da Criacao de Nova Denuncia

Data: 2026-06-03

## Objetivo

Conectar o fluxo `Novo relato` ao backend real, incluindo categorias reais, verificacao de denuncias semelhantes antes do envio, criacao da denuncia e upload de anexos.

## O que foi alterado

- Criado `categoriaService` para listar categorias em `GET /api/categorias`.
- Criado `types/categoria.ts` com `CategoriaResponseDTO`.
- Atualizados tipos de denuncia no front com:
  - `DenunciaCreateRequestDTO`;
  - `DenunciaSemelhanteResponseDTO`.
- Atualizado `denunciaService` com:
  - `criar(payload)` para `POST /api/denuncias`;
  - `buscarSemelhantes(payload)` para `POST /api/denuncias/semelhantes`;
  - `anexar(denunciaId, arquivo)` para `POST /api/denuncias/{id}/anexos` usando multipart no campo `arquivo`.
- Refeito `NewReportFlow` para:
  - carregar categorias ativas do backend;
  - preencher cidade e bairro a partir do usuario logado quando existir;
  - capturar geolocalizacao opcional do navegador;
  - validar campos minimos antes de avancar;
  - permitir anexar imagens;
  - revisar os dados antes do envio;
  - consultar semelhantes antes da criacao;
  - permitir abrir um relato semelhante existente;
  - permitir criar mesmo assim quando o usuario decidir;
  - criar a denuncia real;
  - enviar anexos apos a criacao;
  - navegar para o detalhe real do relato criado.
- Criada `utils/imageCompression.ts` para compactar imagens grandes no navegador antes do upload.

## Fluxo atual

1. O morador seleciona uma categoria real.
2. Informa cidade, bairro, rua e ponto de referencia.
3. Opcionalmente captura latitude/longitude pelo navegador.
4. Informa titulo, descricao, anonimato e fotos.
5. Na revisao, o front chama `POST /api/denuncias/semelhantes`.
6. Se houver semelhantes, o usuario pode abrir o relato existente ou criar mesmo assim.
7. O front cria a denuncia com `POST /api/denuncias`.
8. O front compacta as imagens selecionadas e envia os anexos com multipart.
9. O usuario e levado para `/relato/{id}`.

## Pendencias conscientes

- A validacao forte de bairro controlado por prefeitura ainda depende da decisao futura sobre enviar `prefeituraId`/identificador mais forte no DTO de criacao.
- O upload e feito depois da criacao. Se algum anexo falhar, a denuncia ja existira; o front mostra erro, mas ainda nao possui uma tela dedicada para tentar reenviar apenas anexos.
- O mapa da etapa de criacao captura coordenada pelo navegador, mas ainda nao permite escolher um ponto manualmente no mapa.
- A compressao preserva formatos comuns de imagem e ignora GIF para nao quebrar animacoes.

## Validacao

- Executado `npm.cmd run build` em `front/`.
- Resultado: build concluido com sucesso.
- Observacao: permaneceu apenas o aviso do Vite sobre chunk JavaScript acima de 500 kB.
