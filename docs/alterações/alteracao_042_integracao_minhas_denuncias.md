# Alteracao 042 - Integracao de Minhas Denuncias

Data: 2026-06-02

## Objetivo

Conectar a tela `Minhas Denuncias` ao backend real para evitar a sensacao de dados repetidos ou falsos causada pelo uso de `mockReports`.

## O que foi alterado

- Atualizada `MyReportsPage` para:
  - buscar os relatos do morador em `GET /api/denuncias/minhas`;
  - tratar estados de carregamento, erro e tentativa novamente;
  - mapear `DenunciaResponseDTO` para o view model `Report`;
  - abrir o detalhe real do relato em `/relato/{id}`;
  - buscar a primeira imagem dos anexos de cada denuncia carregada.
- Atualizado `denunciaService` com o metodo `listarMinhas(page, size)`.
- Atualizado `denunciaMapper` com `mapMinhaDenunciaToReport`, destacando como `Aguardando confirmacao` as denuncias `CONCLUIDO` sem `conclusaoConfirmadaEm`.
- Reorganizado `MyReports` para:
  - receber dados reais por props;
  - remover o card fake de relato aguardando confirmacao;
  - aplicar filtros locais sobre os relatos reais;
  - mostrar nome real do usuario logado no menu;
  - usar logout real pelo contexto de sessao;
  - exibir mockup visual quando uma denuncia nao tiver foto.
- Limpos labels/status em `ReportCard` e `MyReports` para evitar textos corrompidos na interface.

## Pendencias conscientes

- A busca de foto ainda usa uma chamada de anexos por denuncia carregada, como no feed. Funciona para a experiencia atual, mas a solucao ideal futura e o backend retornar uma foto de capa/thumbnail no proprio DTO de listagem.
- A pagina `MapPage` ainda usa `mockReports` e deve ser a proxima candidata a integracao para eliminar o ultimo uso forte de relatos mockados no fluxo do morador.
- A criacao de nova denuncia e o upload de anexos ainda seguem pendentes na Etapa 2 do documento de integracao.

## Validacao

- Executado `npm.cmd run build` em `front/`.
- Resultado: build concluido com sucesso.
- Observacao: permaneceu apenas o aviso do Vite sobre chunk JavaScript acima de 500 kB.
