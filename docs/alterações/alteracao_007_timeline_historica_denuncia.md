# Alteracao 007 - Timeline historica da denuncia

## Objetivo

Esta alteracao adiciona uma timeline historica por denuncia.

Importante: aqui a palavra timeline significa historico auditavel da denuncia, nao o feed geral de postagens.

O feed geral sera tratado separadamente, com uma ordenacao mista para equilibrar relevancia e recencia.

## Decisao de produto

Foram separados dois conceitos:

### Timeline da denuncia

Historico de eventos da denuncia.

Deve ser:

- fiel aos acontecimentos;
- auditavel;
- organizada por tempo;
- sem ranqueamento por popularidade.

### Timeline/feed de postagens

Lista geral de denuncias para o morador navegar.

Deve ser:

- dinamica;
- equilibrada;
- misturar relevancia e recencia;
- evitar que denuncias com muitas interacoes fiquem sempre no topo;
- evitar que denuncias pequenas nunca aparecam.

Essa segunda parte fica como proximo passo logico.

## Modulo criado

```txt
core/timeline
```

Estrutura:

```txt
TimelineDenuncia.java
TimelineDenunciaService.java
TimelineDenunciaRepository.java
TimelineDenunciaController.java
TimelineDenunciaControllerOpenApi.java
TipoEventoTimeline.java
dto/
```

## Banco de dados

Foi criada a tabela:

```txt
timeline_denuncia
```

Campos principais:

- denuncia;
- tipo;
- descricao;
- usuario;
- organizacao;
- destaque;
- criado_em.

## Eventos registrados automaticamente

### Denuncia criada

Tipo:

```txt
DENUNCIA_CRIADA
```

Registrado quando o morador cria uma denuncia.

### Comentario adicionado

Tipo:

```txt
COMENTARIO_ADICIONADO
```

Registrado quando um usuario adiciona comentario comum.

### Resposta oficial publicada

Tipo:

```txt
RESPOSTA_OFICIAL_PUBLICADA
```

Registrado quando uma prefeitura ou secretaria publica resposta oficial.

## Eventos que nao entram na timeline historica agora

Confirmacoes e urgencias nao foram adicionadas como eventos individuais da timeline.

Motivo:

- poderiam gerar muito ruido;
- poderiam enviesar a percepcao visual do historico;
- ja sao representadas por contadores e relevancia;
- o foco da timeline historica e mostrar fatos importantes, nao cada interacao de engajamento.

## Endpoint criado

```txt
GET /api/denuncias/{denunciaId}/timeline
```

Permissao:

```txt
Usuario autenticado
```

Retorno:

- pagina de eventos;
- ordenacao padrao por `criadoEm DESC`;
- eventos com campo `destaque` para a interface poder enfatizar acontecimentos importantes sem alterar a fidelidade historica.

## Proxima etapa recomendada

Implementar o feed/timeline geral de postagens com ordenacao mista.

Uma proposta segura para MVP:

- recentes;
- em alta;
- misto.

O modo misto deve combinar:

- alguma relevancia;
- alguma recencia;
- limite de dominancia para denuncias muito grandes;
- oportunidade para denuncias novas aparecerem.

Essa regra deve ser definida com cuidado antes da implementacao para nao criar um feed enviesado.
