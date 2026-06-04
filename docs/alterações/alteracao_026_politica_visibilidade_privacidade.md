# Alteracao 026 - Politica de visibilidade e privacidade

## Objetivo

Revisar e aplicar regras de visibilidade para reduzir vazamento de informacoes sensiveis sem alterar a proposta principal da API.

Esta alteracao cobre especialmente:

- dados do autor;
- denuncia anonima;
- anexos;
- comentarios removidos;
- denuncias arquivadas.

## Regras aplicadas

### Denuncia anonima

Quando uma denuncia e anonima:

- `autorId` fica `null` no DTO publico;
- `autorNomeExibido` fica `Morador anonimo`;
- comentarios do proprio autor da denuncia tambem ocultam `autorId` e exibem `Morador anonimo`;
- anexos enviados pelo autor tambem ocultam `autorId` e exibem `Morador anonimo`;
- eventos de timeline executados pelo autor anonimo tambem ocultam os dados do usuario.

A regra evita que o autor seja escondido na denuncia, mas revelado indiretamente em comentarios, anexos ou timeline.

### Comentarios removidos

Comentarios removidos por moderacao continuam fora da listagem publica de comentarios.

O backend ja filtrava `removidoEm is null`; esta regra foi mantida e documentada como parte da politica de privacidade.

### Denuncias arquivadas

Denuncias com status `ARQUIVADO` deixam de aparecer na listagem geral para moradores comuns, mesmo quando o filtro `status=ARQUIVADO` for enviado.

Uma denuncia arquivada pode ser visualizada por:

- autor da denuncia;
- `ADMIN_APP`;
- `MODERADOR`;
- usuario institucional com vinculo ativo na organizacao responsavel;
- usuario vinculado a prefeitura pai da secretaria responsavel.

Quando um usuario sem permissao tenta detalhar uma denuncia arquivada, o backend responde como se ela nao existisse (`404`), reduzindo exposicao desnecessaria.

### Anexos

Listagem e download de anexos agora respeitam a mesma regra de visibilidade da denuncia.

Isso evita que um usuario sem acesso a uma denuncia arquivada consiga contornar a regra baixando o arquivo diretamente pelo endpoint de anexo.

### Timeline

A timeline agora tambem respeita a visibilidade da denuncia.

Em denuncias anonimas, eventos gerados pelo autor anonimo nao expÃµem `usuarioId` nem nome real.

## Componentes alterados

- `UsuarioAutenticado`: centraliza leitura do usuario e papeis a partir do JWT/contexto de seguranca.
- `VisibilidadeDenunciaService`: concentra as regras de acesso a denuncias arquivadas e ocultacao de autor anonimo.
- `DenunciaService`: aplica visibilidade em listagem geral e detalhamento.
- `ComentarioService`: aplica visibilidade ao listar comentarios e oculta autor em comentario de denuncia anonima.
- `AnexoDenunciaService`: aplica visibilidade em listagem/download e oculta autor em anexo de denuncia anonima.
- `TimelineDenunciaService`: aplica visibilidade e oculta autor anonimo em eventos.

## Decisoes conscientes

- Denuncias anonimas continuam exibindo cidade, bairro, rua e ponto de referencia, porque esses dados sao parte do problema urbano reportado. Se no futuro houver risco de identificacao em casos sensiveis, isso deve virar uma regra especifica.
- A moderacao e o `ADMIN_APP` conseguem ver denuncias arquivadas para fins de auditoria e revisao.
- A API retorna `404` para denuncia arquivada sem permissao no detalhamento, evitando confirmar a existencia de conteudo moderado.
- A politica nao cria novos perfis nem muda regras de criacao, status ou moderacao.

## Validacao

- Foram adicionados testes de integracao para:
  - impedir morador comum de listar/detalhar denuncia arquivada;
  - permitir autor consultar propria denuncia arquivada;
  - ocultar denuncia arquivada do feed para morador comum;
  - ocultar autor de comentario do proprio autor em denuncia anonima.
- `mvn test`
- Resultado observado: 34 testes executados, 0 falhas, 0 erros, 1 ignorado.
- O teste ignorado continua sendo o fluxo com Testcontainers quando Docker nao esta disponivel.
