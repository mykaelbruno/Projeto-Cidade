# Alteracao 025 - Regras anti-spam alem do rate limit

## Objetivo

Adicionar uma camada simples e configuravel de anti-spam para reduzir abuso em denuncias e comentarios, sem substituir o rate limit existente.

O rate limit continua cuidando de volume de requisicoes por janela. Esta alteracao cuida de conteudo suspeito e repeticao exata normalizada em intervalo curto.

## O que foi implementado

- Novo pacote `infra.antispam`.
- Nova configuracao `app.antispam`.
- Validacao de quantidade maxima de links:
  - denuncias;
  - comentarios comuns;
  - respostas oficiais.
- Validacao de sequencias repetitivas suspeitas, como caracteres repetidos artificialmente.
- Bloqueio de denuncia repetida em janela curta quando o mesmo usuario tenta criar uma denuncia com:
  - mesmo titulo e descricao normalizados;
  - mesma categoria;
  - mesma cidade;
  - mesmo bairro.
- Bloqueio de comentario repetido em janela curta quando o mesmo usuario repete o mesmo conteudo normalizado na mesma denuncia.
- Documentacao Swagger ajustada para indicar `409` em conflitos de repeticao para denuncias e comentarios.
- Testes unitarios para a regra central de anti-spam.

## Configuracoes adicionadas

As configuracoes foram adicionadas em `application.yml`, `.env` e `.env.example`:

```properties
ANTISPAM_ENABLED=true
ANTISPAM_MAX_LINKS_DENUNCIA=2
ANTISPAM_MAX_LINKS_COMENTARIO=1
ANTISPAM_MAX_CARACTERES_REPETIDOS_SEQUENCIA=12
ANTISPAM_JANELA_DENUNCIA_REPETIDA=30m
ANTISPAM_JANELA_COMENTARIO_REPETIDO=10m
```

## Regras atuais

### Denuncia

Uma denuncia pode ser bloqueada quando:

- possui mais links do que o limite configurado;
- possui sequencia muito longa do mesmo caractere;
- repete exatamente, apos normalizacao, titulo e descricao de outra denuncia recente do mesmo autor, na mesma categoria, cidade e bairro.

### Comentario e resposta oficial

Um comentario ou resposta oficial pode ser bloqueado quando:

- possui mais links do que o limite configurado;
- possui sequencia muito longa do mesmo caractere;
- repete exatamente, apos normalizacao, o mesmo conteudo recente do mesmo autor na mesma denuncia.

## Decisoes conscientes

- Nao foi implementada heuristica pesada de denuncia semelhante por localizacao, titulo parecido ou descricao parecida. Esse tema continua separado no roadmap como `Fluxo de denuncia duplicada ou semelhante`, porque pode exigir regras mais cuidadosas para nao bloquear relato legitimo.
- A regra atual usa repeticao exata normalizada. Ela remove acentos, pontuacao e espacos duplicados, mas nao tenta adivinhar intencao.
- As regras sao configuraveis e podem ser desativadas com `ANTISPAM_ENABLED=false` em ambiente local se necessario.

## Validacao

- `mvn test`
- Resultado observado: 30 testes executados, 0 falhas, 0 erros, 1 ignorado.
- O teste ignorado continua sendo o fluxo com Testcontainers quando Docker nao esta disponivel.
