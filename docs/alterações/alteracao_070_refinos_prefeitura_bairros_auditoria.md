# Alteracao 070 - Refino de prefeitura, bairros e auditoria

## O que foi feito

Esta etapa concentrou os ajustes levantados no QA do perfil de prefeitura e em fluxos administrativos ligados a bairros e auditoria.

### Prefeitura e painel operacional

- Removidos elementos de prototipo da navegacao institucional:
  - botao `Ver como morador`;
  - alternancia de area no topo.
- Ajustada a busca da aba de relatos para aplicar filtros apenas quando o usuario confirmar, evitando recarga a cada tecla digitada.
- Bloqueada a atualizacao de status para `ARQUIVADO` no fluxo operacional da prefeitura, mantendo o arquivamento como acao exclusiva da moderacao.
- Corrigida a assinatura das acoes operacionais para considerar primeiro o vinculo institucional ativo da sessao, evitando que uma resposta feita pela prefeitura apareca assinada como secretaria responsavel.

### Pagina de relato no contexto institucional

- Corrigido o comportamento de scroll para manter a pagina em um unico fluxo de rolagem.
- Adicionado card horizontal de acoes da prefeitura, logo abaixo do botao de voltar, com atalhos para:
  - atualizar status;
  - publicar resposta oficial;
  - reatribuir secretaria responsavel.
- Adicionado composer de resposta oficial para perfis operacionais diretamente na pagina do relato.
- Melhorada a exibicao do acompanhamento de status:
  - enums crus deixaram de ser exibidos;
  - status agora aparecem formatados com labels amigaveis;
  - cores seguem o mesmo padrao visual dos badges de status do sistema.

### Administracao da prefeitura

- Corrigida a listagem de operadores institucionais para usar os vinculos reais retornados pelo backend, evitando o falso estado de `Nenhum operador vinculado`.
- Reforcada a legibilidade visual dos formularios com outlines, fundo e contraste mais claros.
- Tornado o estado `ativado/desativado` de secretarias e vinculos mais evidente com badges coloridos.

### Gestao de bairros

- Reescrita a tela de bairros para ficar alinhada ao fluxo real da prefeitura.
- Adicionados:
  - selecao por mapa;
  - uso de localizacao atual;
  - busca de endereco para preencher latitude/longitude;
  - preenchimento assistido do nome do bairro quando a geocodificacao retornar essa informacao.
- Tornado explicito que latitude e longitude sao opcionais.
- Adicionada verificacao local contra duplicidade de bairros antes do envio, sem substituir a validacao definitiva do backend.

### Auditoria da prefeitura

- Criada aba de auditoria especifica da prefeitura.
- Adicionado endpoint para listar eventos auditaveis relacionados a operadores da prefeitura e de suas secretarias.
- Incluida exibicao do nome do ator da acao no retorno da auditoria.

## Arquivos principais impactados

- `front/src/app/layouts/AdminLayout.tsx`
- `front/src/app/components/operacional/OperationalReports.tsx`
- `front/src/app/pages/ReportDetailPage.tsx`
- `front/src/app/pages/admin/AdministracaoPage.tsx`
- `front/src/app/pages/admin/BairrosPage.tsx`
- `front/src/app/pages/admin/AuditoriaPrefeituraPage.tsx`
- `front/src/app/services/auditoriaService.ts`
- `front/src/app/types/auditoria.ts`
- `src/main/java/com/mykael/prefeitura/core/denuncia/DenunciaService.java`
- `src/main/java/com/mykael/prefeitura/infra/auditoria/AuditoriaController.java`
- `src/main/java/com/mykael/prefeitura/infra/auditoria/AuditoriaService.java`
- `src/main/java/com/mykael/prefeitura/infra/auditoria/dto/AuditoriaResponseDTO.java`

## Validacao

- `npm.cmd run build`
- `./mvnw.cmd test`

## Pendencias conscientes

1. A auditoria da prefeitura foi escopada aos operadores vinculados a ela e as suas secretarias. Se no futuro for necessario incluir eventos administrativos externos que afetem a prefeitura sem vinculo institucional direto do ator, essa regra precisara ser expandida.
2. O nome do ator exibido na auditoria e resolvido no momento da consulta. Se houver necessidade de preservar o nome historico exato da epoca da acao, sera melhor persistir esse snapshot no registro de auditoria.
