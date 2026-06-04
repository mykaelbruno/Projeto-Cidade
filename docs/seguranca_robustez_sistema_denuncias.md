# Documento 3 â€” SeguranÃ§a, Robustez e Boas PrÃ¡ticas Globais

## 1. Objetivo do documento

Este documento define requisitos e cuidados de seguranÃ§a para o sistema de denÃºncias urbanas, considerando backend, frontend, autenticaÃ§Ã£o, banco de dados, uploads, moderaÃ§Ã£o, proteÃ§Ã£o contra abuso e robustez geral do cÃ³digo.

Como o sistema serÃ¡ aberto ao pÃºblico e tambÃ©m terÃ¡ perfis institucionais de prefeitura e secretarias, a seguranÃ§a precisa ser tratada desde o inÃ­cio do desenvolvimento.

A intenÃ§Ã£o Ã© reduzir brechas como:

- acesso indevido;
- manipulaÃ§Ã£o de denÃºncias;
- spam;
- abuso de anonimato;
- vazamento de dados;
- upload malicioso;
- ataques por excesso de requisiÃ§Ãµes;
- falhas de permissÃ£o;
- exposiÃ§Ã£o de tokens;
- alteraÃ§Ã£o indevida de status;
- exploraÃ§Ã£o de formulÃ¡rios;
- inconsistÃªncia de dados.

---

## 2. PrincÃ­pios gerais de seguranÃ§a

O sistema deve seguir alguns princÃ­pios bÃ¡sicos:

```txt
Nunca confiar nos dados enviados pelo frontend.
Validar tudo no backend.
Aplicar permissÃµes em todas as aÃ§Ãµes sensÃ­veis.
Registrar aÃ§Ãµes importantes em logs.
Guardar o mÃ­nimo possÃ­vel de dados sensÃ­veis.
NÃ£o expor detalhes internos em mensagens de erro.
NÃ£o permitir que a prefeitura modere conteÃºdo pÃºblico.
Usar HTTPS em produÃ§Ã£o.
Evitar tokens JWT em localStorage.
Proteger uploads.
Aplicar rate limit em endpoints sensÃ­veis.
```

---

## 3. SeguranÃ§a por perfil de usuÃ¡rio

O sistema terÃ¡ vÃ¡rios tipos de usuÃ¡rios, entÃ£o as permissÃµes precisam ser bem separadas.

### Perfis previstos

```txt
ADMIN_APP
MORADOR
ADMIN_PREFEITURA
ADMIN_SECRETARIA
ATENDENTE_SECRETARIA
MODERADOR
```

---

## 4. Regras de permissÃ£o

### ADMIN_APP

Pode:

- criar prefeitura;
- verificar prefeitura;
- bloquear prefeitura;
- gerenciar categorias globais;
- gerenciar moderadores;
- revisar logs administrativos;
- realizar aÃ§Ãµes globais de moderaÃ§Ã£o.

NÃ£o deve:

- alterar denÃºncias como se fosse prefeitura;
- manipular engajamento;
- editar comentÃ¡rios de usuÃ¡rios sem registro.

---

### MORADOR

Pode:

- criar denÃºncia;
- comentar;
- confirmar problema;
- marcar como urgente;
- reportar conteÃºdo;
- validar resoluÃ§Ã£o.

NÃ£o pode:

- alterar status oficial;
- criar prefeitura;
- criar secretaria;
- remover comentÃ¡rios de outros usuÃ¡rios;
- acessar painel institucional.

---

### ADMIN_PREFEITURA

Pode:

- editar dados da prefeitura;
- criar secretarias;
- convidar usuÃ¡rios institucionais;
- visualizar denÃºncias da cidade;
- visualizar relatÃ³rios gerais.

NÃ£o pode:

- excluir denÃºncias de moradores;
- ocultar crÃ­ticas;
- alterar conteÃºdo original da denÃºncia;
- agir como moderador da plataforma.

---

### ADMIN_SECRETARIA

Pode:

- visualizar denÃºncias atribuÃ­das Ã  secretaria;
- responder oficialmente;
- alterar status da denÃºncia;
- transferir denÃºncia;
- anexar evidÃªncias;
- gerenciar atendentes da secretaria.

NÃ£o pode:

- criar outra prefeitura;
- acessar dados de secretarias nÃ£o vinculadas;
- apagar denÃºncia pÃºblica;
- alterar texto original do morador.

---

### ATENDENTE_SECRETARIA

Pode:

- responder denÃºncias atribuÃ­das;
- atualizar status, se autorizado;
- anexar evidÃªncias.

NÃ£o pode:

- gerenciar usuÃ¡rios;
- criar secretarias;
- alterar permissÃµes;
- excluir conteÃºdos.

---

### MODERADOR

Pode:

- revisar denÃºncias reportadas;
- ocultar conteÃºdo imprÃ³prio;
- marcar denÃºncia duplicada;
- remover comentÃ¡rio ofensivo;
- aplicar advertÃªncia.

NÃ£o pode:

- alterar status institucional;
- responder como prefeitura;
- editar conteÃºdo de uma secretaria;
- manipular relevÃ¢ncia manualmente sem registro.

---

## 5. Controle de autorizaÃ§Ã£o no backend

NÃ£o basta esconder botÃ£o no frontend.

Toda permissÃ£o precisa ser verificada no backend.

Exemplo:

```txt
Mesmo que o botÃ£o "Alterar status" nÃ£o apareÃ§a para o morador,
o backend tambÃ©m deve impedir que ele chame:
PATCH /api/reports/{id}/status
```

### Regra obrigatÃ³ria

Cada endpoint sensÃ­vel deve verificar:

```txt
UsuÃ¡rio estÃ¡ autenticado?
UsuÃ¡rio possui o papel necessÃ¡rio?
UsuÃ¡rio pertence Ã  organizaÃ§Ã£o correta?
UsuÃ¡rio tem permissÃ£o sobre esse recurso especÃ­fico?
```

Exemplo:

Um `ADMIN_SECRETARIA` da Secretaria de SaÃºde nÃ£o pode alterar uma denÃºncia atribuÃ­da Ã  Secretaria de Infraestrutura.

---

## 6. AutenticaÃ§Ã£o

O sistema usarÃ¡:

```txt
Spring Security + JWT
```

O login deve gerar um token de acesso para identificar o usuÃ¡rio nas prÃ³ximas requisiÃ§Ãµes.

---

## 7. Armazenamento seguro do token

Evitar armazenar JWT em:

```txt
localStorage
sessionStorage
```

Motivo:

Se acontecer um ataque XSS, scripts maliciosos podem acessar o token.

### RecomendaÃ§Ã£o

Usar cookies seguros:

```txt
HttpOnly
Secure
SameSite
```

### Cookie recomendado

```txt
HttpOnly: true
Secure: true em produÃ§Ã£o
SameSite: Lax ou Strict
Path: /
Max-Age controlado
```

### ExplicaÃ§Ã£o

- `HttpOnly`: impede acesso via JavaScript.
- `Secure`: cookie sÃ³ trafega via HTTPS.
- `SameSite`: reduz risco de CSRF.
- `Max-Age`: controla tempo de validade.

---

## 8. Access token e refresh token

Para mais seguranÃ§a, usar dois tokens:

### Access token

- duraÃ§Ã£o curta;
- usado para autenticar requisiÃ§Ãµes;
- exemplo: 15 minutos.

### Refresh token

- duraÃ§Ã£o maior;
- usado para renovar o access token;
- armazenado em cookie HttpOnly;
- exemplo: 7 dias.

Fluxo:

```txt
UsuÃ¡rio faz login
â†“
Backend gera access token e refresh token
â†“
Tokens sÃ£o enviados em cookies seguros
â†“
Frontend chama a API sem acessar diretamente o token
â†“
Quando access token expira, frontend chama endpoint de refresh
```

---

## 9. Logout seguro

No logout:

- invalidar refresh token no backend;
- limpar cookies;
- registrar evento de logout, se necessÃ¡rio.

NÃ£o basta apenas apagar o token no frontend.

---

## 10. Senhas

Senhas nunca devem ser salvas em texto puro.

Usar:

```txt
BCrypt
```

### Requisitos mÃ­nimos de senha

SugestÃ£o:

```txt
mÃ­nimo de 8 caracteres
mÃ¡ximo de 72 caracteres
pelo menos 1 letra
pelo menos 1 nÃºmero
```

Evitar exigir regras absurdas demais no MVP, mas impedir senhas muito fracas.

### Importante

Nunca retornar senha ou hash em nenhuma resposta da API.

---

## 11. ValidaÃ§Ã£o de formulÃ¡rios

Toda validaÃ§Ã£o deve existir em dois lugares:

```txt
Frontend: melhora experiÃªncia do usuÃ¡rio
Backend: garante seguranÃ§a real
```

O frontend ajuda, mas quem decide se o dado Ã© vÃ¡lido Ã© o backend.

---

## 12. Limites de caracteres

Definir limites evita abuso, textos gigantes, spam e problemas no banco.

### UsuÃ¡rio

```txt
Nome: mÃ­nimo 2, mÃ¡ximo 100 caracteres
Email: mÃ¡ximo 150 caracteres
Senha: mÃ­nimo 8, mÃ¡ximo 72 caracteres
Telefone: mÃ¡ximo 20 caracteres
Bairro: mÃ¡ximo 100 caracteres
Cidade: mÃ¡ximo 100 caracteres
```

### DenÃºncia

```txt
TÃ­tulo: mÃ­nimo 5, mÃ¡ximo 120 caracteres
DescriÃ§Ã£o: mÃ­nimo 20, mÃ¡ximo 2000 caracteres
Rua: mÃ¡ximo 150 caracteres
Ponto de referÃªncia: mÃ¡ximo 200 caracteres
Categoria: obrigatÃ³ria
Latitude/Longitude: obrigatÃ³rias quando houver localizaÃ§Ã£o
```

### ComentÃ¡rio

```txt
ComentÃ¡rio: mÃ­nimo 1, mÃ¡ximo 1000 caracteres
```

### Resposta oficial

```txt
Resposta: mÃ­nimo 5, mÃ¡ximo 2000 caracteres
```

### Justificativa de transferÃªncia

```txt
Justificativa: mÃ­nimo 10, mÃ¡ximo 1000 caracteres
```

### Motivo de moderaÃ§Ã£o

```txt
Motivo: mÃ­nimo 10, mÃ¡ximo 1000 caracteres
```

---

## 13. SanitizaÃ§Ã£o de dados

O sistema nÃ£o deve permitir HTML livre em campos de texto.

Campos como:

- tÃ­tulo;
- descriÃ§Ã£o;
- comentÃ¡rio;
- resposta oficial;

devem ser tratados como texto puro.

### Regra

NÃ£o renderizar HTML enviado pelo usuÃ¡rio.

No frontend, evitar uso de:

```txt
dangerouslySetInnerHTML
```

Caso seja necessÃ¡rio renderizar HTML futuramente, usar sanitizaÃ§Ã£o com biblioteca confiÃ¡vel.

---

## 14. ProteÃ§Ã£o contra XSS

XSS Ã© quando alguÃ©m injeta cÃ³digo malicioso que roda no navegador de outros usuÃ¡rios.

Cuidados:

- nÃ£o renderizar HTML vindo do usuÃ¡rio;
- escapar conteÃºdo no frontend;
- evitar `dangerouslySetInnerHTML`;
- usar cookies HttpOnly para tokens;
- validar e sanitizar textos no backend;
- configurar Content Security Policy em produÃ§Ã£o.

---

## 15. ProteÃ§Ã£o contra CSRF

Se usar cookies para autenticaÃ§Ã£o, Ã© importante pensar em CSRF.

Medidas:

- usar cookie `SameSite=Lax` ou `Strict`;
- exigir mÃ©todos corretos para alteraÃ§Ãµes;
- considerar CSRF token em operaÃ§Ãµes sensÃ­veis;
- nÃ£o aceitar alteraÃ§Ã£o de dados via GET.

Endpoints que alteram dados devem usar:

```txt
POST
PUT
PATCH
DELETE
```

Nunca:

```txt
GET
```

---

## 16. Rate limit

Como o sistema serÃ¡ pÃºblico, Ã© obrigatÃ³rio limitar requisiÃ§Ãµes para evitar spam e abuso.

### Endpoints sensÃ­veis

Aplicar rate limit em:

```txt
POST /api/auth/login
POST /api/auth/register
POST /api/reports
POST /api/reports/{id}/comments
POST /api/reports/{id}/confirm
POST /api/reports/{id}/urgent
POST /api/moderation/reports
POST /api/uploads
POST /api/auth/refresh
```

---

## 17. SugestÃ£o de limites iniciais

### Login

```txt
5 tentativas por minuto por IP
10 tentativas por 15 minutos por email
```

### Cadastro

```txt
3 contas por hora por IP
```

### Criar denÃºncia

```txt
5 denÃºncias por hora por usuÃ¡rio
20 denÃºncias por dia por usuÃ¡rio
```

### ComentÃ¡rios

```txt
10 comentÃ¡rios por minuto por usuÃ¡rio
100 comentÃ¡rios por dia por usuÃ¡rio
```

### ConfirmaÃ§Ãµes/urgÃªncias

```txt
60 interaÃ§Ãµes por minuto por usuÃ¡rio
```

### Upload

```txt
10 uploads por hora por usuÃ¡rio
```

### Reportar conteÃºdo

```txt
20 reportes por dia por usuÃ¡rio
```

Esses nÃºmeros podem ser ajustados conforme uso real.

---

## 18. Anti-spam

AlÃ©m do rate limit, implementar regras simples:

- impedir denÃºncias iguais em curto perÃ­odo;
- impedir comentÃ¡rios repetidos;
- bloquear links excessivos;
- limitar quantidade de imagens;
- exigir conta verificada por e-mail para aÃ§Ãµes sensÃ­veis;
- criar sistema de reputaÃ§Ã£o interna.

---

## 19. PrevenÃ§Ã£o de denÃºncias duplicadas

Ao criar denÃºncia, verificar:

```txt
mesma categoria
localizaÃ§Ã£o prÃ³xima
denÃºncia ainda aberta
texto parecido
```

Se possÃ­vel, sugerir apoiar a denÃºncia jÃ¡ existente.

No MVP, pode ser:

```txt
mesma categoria + distÃ¢ncia menor que X metros + status nÃ£o concluÃ­do
```

---

## 20. Upload seguro de imagens

Uploads sÃ£o uma Ã¡rea crÃ­tica.

### Regras

- aceitar apenas tipos permitidos;
- limitar tamanho;
- renomear arquivo no backend;
- nÃ£o confiar no nome original;
- nÃ£o salvar na pasta pÃºblica do backend;
- salvar em MinIO/S3;
- verificar MIME type;
- gerar nome Ãºnico;
- remover metadados sensÃ­veis, se possÃ­vel;
- nÃ£o permitir execuÃ§Ã£o de arquivos;
- bloquear SVG no MVP.

---

## 21. Tipos de arquivos permitidos

Para o MVP:

```txt
image/jpeg
image/png
image/webp
```

Evitar inicialmente:

```txt
image/svg+xml
application/pdf
video/*
```

Motivo:

- SVG pode carregar scripts;
- PDF pode ter conteÃºdo sensÃ­vel ou complexo;
- vÃ­deo aumenta custo e complexidade.

---

## 22. Limites de upload

SugestÃ£o:

```txt
MÃ¡ximo por imagem: 5 MB
MÃ¡ximo de imagens por denÃºncia: 5
MÃ¡ximo total por denÃºncia: 25 MB
```

Se for permitir vÃ­deo futuramente:

```txt
MÃ¡ximo por vÃ­deo: 50 MB ou mais, conforme infraestrutura
```

Mas vÃ­deo deve ficar fora do MVP.

---

## 23. NomeaÃ§Ã£o segura de arquivos

Nunca usar o nome original como nome final.

Errado:

```txt
buraco-na-rua.jpg
```

Certo:

```txt
uuid-gerado-pelo-backend.jpg
```

Salvar no banco:

```txt
url
bucket
objectKey
contentType
size
uploadedBy
createdAt
```

---

## 24. Privacidade de imagens

Imagens podem conter dados sensÃ­veis sem querer, como:

- placa de carro;
- rosto de pessoas;
- endereÃ§o residencial;
- crianÃ§as;
- documentos.

Regras recomendadas:

- orientar o usuÃ¡rio antes do upload;
- permitir denÃºncia de imagem inadequada;
- permitir moderaÃ§Ã£o remover imagem;
- evitar mostrar metadados EXIF;
- remover EXIF quando possÃ­vel.

---

## 25. LocalizaÃ§Ã£o

A localizaÃ§Ã£o Ã© sensÃ­vel.

### Cuidados

- nÃ£o coletar localizaÃ§Ã£o em tempo real sem necessidade;
- pedir permissÃ£o clara;
- permitir inserir endereÃ§o manualmente;
- nÃ£o exibir localizaÃ§Ã£o exata do usuÃ¡rio, apenas da denÃºncia;
- nÃ£o salvar histÃ³rico de localizaÃ§Ã£o do usuÃ¡rio;
- permitir ajuste aproximado do ponto no mapa.

---

## 26. Anonimato controlado

O anonimato Ã© apenas visual.

A denÃºncia pode aparecer como:

```txt
Morador anÃ´nimo
```

Mas o backend deve manter:

```txt
authorId
```

Isso permite responsabilizaÃ§Ã£o em caso de abuso.

### Regras

- anonimato nÃ£o oculta o usuÃ¡rio para administradores autorizados;
- prefeitura nÃ£o deve ver dados pessoais do autor anÃ´nimo por padrÃ£o;
- apenas a plataforma/moderaÃ§Ã£o deve ter acesso em casos necessÃ¡rios;
- registrar acesso a dados sensÃ­veis.

---

## 27. Dados pessoais

Coletar apenas o necessÃ¡rio.

### Dados mÃ­nimos recomendados

```txt
nome
email
senha
cidade
bairro
```

Telefone deve ser opcional.

Evitar pedir:

```txt
CPF
RG
endereÃ§o completo
data de nascimento
```

A menos que exista uma necessidade real.

---

## 28. LGPD e privacidade

Como o sistema lida com dados pessoais, precisa considerar a LGPD.

Requisitos importantes:

- informar quais dados sÃ£o coletados;
- explicar finalidade do uso;
- permitir ediÃ§Ã£o de perfil;
- permitir solicitaÃ§Ã£o de exclusÃ£o de conta;
- nÃ£o expor email publicamente;
- nÃ£o compartilhar dados pessoais com prefeitura sem base clara;
- manter polÃ­tica de privacidade;
- manter termos de uso.

---

## 29. Logs e auditoria

AÃ§Ãµes importantes devem gerar logs.

### Registrar

```txt
login bem-sucedido
tentativa de login falha
criaÃ§Ã£o de denÃºncia
alteraÃ§Ã£o de status
transferÃªncia de secretaria
resposta oficial
remoÃ§Ã£o por moderaÃ§Ã£o
criaÃ§Ã£o de prefeitura
criaÃ§Ã£o de secretaria
alteraÃ§Ã£o de permissÃ£o
upload de imagem
validaÃ§Ã£o de resoluÃ§Ã£o
reabertura de denÃºncia
```

### Dados do log

```txt
id do usuÃ¡rio
aÃ§Ã£o
recurso afetado
data/hora
IP
user agent
organizaÃ§Ã£o, se houver
detalhes resumidos
```

---

## 30. O que nÃ£o registrar em logs

Nunca registrar:

```txt
senha
token JWT completo
refresh token
dados sensÃ­veis desnecessÃ¡rios
conteÃºdo completo de arquivos
```

Logs devem ajudar auditoria, mas nÃ£o podem virar fonte de vazamento.

---

## 31. Tratamento de erros

NÃ£o expor detalhes internos.

Errado:

```txt
Erro SQL na tabela users linha X
NullPointerException no mÃ©todo Y
```

Certo:

```txt
NÃ£o foi possÃ­vel processar a solicitaÃ§Ã£o.
```

No backend, o erro completo pode ir para log interno, mas a resposta da API deve ser segura.

---

## 32. Respostas padronizadas de erro

Usar um formato padrÃ£o.

Exemplo:

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Dados invÃ¡lidos.",
  "fields": {
    "title": "O tÃ­tulo deve ter no mÃ¡ximo 120 caracteres."
  }
}
```

---

## 33. Robustez nas regras de negÃ³cio

O sistema nÃ£o deve depender apenas do frontend para regras.

### Exemplos

O backend deve impedir:

- morador alterar status;
- usuÃ¡rio confirmar a mesma denÃºncia duas vezes;
- usuÃ¡rio votar vÃ¡rias vezes na validaÃ§Ã£o de resoluÃ§Ã£o;
- secretaria alterar denÃºncia de outra secretaria;
- prefeitura apagar denÃºncia pÃºblica;
- denÃºncia sem categoria;
- upload acima do limite;
- comentÃ¡rio vazio;
- status invÃ¡lido;
- transiÃ§Ã£o de status invÃ¡lida.

---

## 34. MÃ¡quina de estados da denÃºncia

Evitar que qualquer status vÃ¡ para qualquer status.

Exemplo de transiÃ§Ãµes permitidas:

```txt
ABERTO -> EM_ANALISE
ABERTO -> ENCAMINHADO
EM_ANALISE -> ENCAMINHADO
ENCAMINHADO -> EM_ANDAMENTO
EM_ANDAMENTO -> PROGRAMADO
PROGRAMADO -> CONCLUIDO
CONCLUIDO -> REABERTO
REABERTO -> EM_ANALISE
ABERTO -> ARQUIVADO
```

Evitar:

```txt
CONCLUIDO -> ABERTO
ARQUIVADO -> CONCLUIDO
MORADOR -> qualquer alteraÃ§Ã£o oficial
```

---

## 35. ValidaÃ§Ã£o de resoluÃ§Ã£o

Quando uma denÃºncia for marcada como concluÃ­da, moradores podem votar.

Regras:

- cada usuÃ¡rio vota apenas uma vez por ciclo de conclusÃ£o;
- autor da denÃºncia pode votar;
- votos devem ter prazo, por exemplo 7 dias;
- se atingir limite de votos negativos, pode reabrir;
- reabertura deve gerar timeline.

Exemplo:

```txt
Se 5 ou mais usuÃ¡rios votarem "nÃ£o resolvido"
e mais de 50% dos votos forem negativos,
status muda para REABERTO.
```

Esses nÃºmeros podem ser ajustados.

---

## 36. ProteÃ§Ã£o contra manipulaÃ§Ã£o de engajamento

Como relevÃ¢ncia depende de interaÃ§Ãµes, Ã© necessÃ¡rio evitar abuso.

Regras:

- um usuÃ¡rio sÃ³ pode confirmar uma vez;
- um usuÃ¡rio sÃ³ pode marcar urgÃªncia uma vez;
- impedir mÃºltiplas contas por mesmo IP em curto perÃ­odo;
- detectar comportamento suspeito;
- limitar interaÃ§Ãµes por minuto;
- nÃ£o permitir que prefeitura aumente relevÃ¢ncia artificialmente;
- manter logs de interaÃ§Ãµes.

---

## 37. Banco de dados

Cuidados:

- usar constraints no banco;
- usar Ã­ndices nos campos pesquisados;
- usar migrations com Flyway;
- nÃ£o usar `ddl-auto: update` em produÃ§Ã£o;
- usar transaÃ§Ãµes em operaÃ§Ãµes crÃ­ticas;
- manter backups.

### Constraints Ãºteis

```txt
email Ãºnico
uma confirmaÃ§Ã£o por usuÃ¡rio por denÃºncia
uma urgÃªncia por usuÃ¡rio por denÃºncia
uma votaÃ§Ã£o de resoluÃ§Ã£o por usuÃ¡rio por ciclo
organizaÃ§Ã£o filha deve apontar para prefeitura existente
denÃºncia deve ter usuÃ¡rio autor
denÃºncia deve ter categoria
```

---

## 38. PaginaÃ§Ã£o obrigatÃ³ria

Nunca retornar listas gigantes sem paginaÃ§Ã£o.

Endpoints como:

```txt
GET /api/reports
GET /api/comments
GET /api/notifications
GET /api/moderation/reports
```

devem usar:

```txt
page
size
sort
```

Definir limite mÃ¡ximo de `size`.

SugestÃ£o:

```txt
size padrÃ£o: 20
size mÃ¡ximo: 100
```

---

## 39. Filtros seguros

Filtros devem ser controlados.

Evitar permitir que o usuÃ¡rio envie qualquer nome de coluna para ordenaÃ§Ã£o.

Exemplo seguro:

```txt
sort=createdAt
sort=relevanceScore
sort=status
```

Exemplo perigoso:

```txt
sort=qualquer_campo_do_banco
```

Criar whitelist de campos permitidos.

---

## 40. CORS

Em produÃ§Ã£o, nÃ£o permitir qualquer origem.

Errado:

```txt
Access-Control-Allow-Origin: *
```

Certo:

```txt
Access-Control-Allow-Origin: https://seudominio.com.br
```

No desenvolvimento, pode permitir:

```txt
http://localhost:5173
```

---

## 41. Headers de seguranÃ§a

Configurar no backend ou no Nginx:

```txt
Content-Security-Policy
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

Em produÃ§Ã£o, usar HTTPS obrigatÃ³rio.

---

## 42. Frontend seguro

Cuidados no React:

- nÃ£o armazenar token em localStorage;
- nÃ£o renderizar HTML vindo do usuÃ¡rio;
- validar formulÃ¡rios;
- limitar tamanho dos inputs;
- exibir erros sem mostrar detalhes internos;
- nÃ£o confiar em permissÃµes apenas por tela;
- esconder botÃµes conforme papel do usuÃ¡rio, mas sempre depender do backend;
- tratar sessÃ£o expirada;
- impedir mÃºltiplos submits;
- mostrar loading em aÃ§Ãµes sensÃ­veis;
- confirmar aÃ§Ãµes destrutivas.

---

## 43. ValidaÃ§Ã£o no frontend

Usar:

```txt
React Hook Form
Zod
```

Exemplo de validaÃ§Ãµes:

```txt
TÃ­tulo obrigatÃ³rio, mÃ¡ximo 120 caracteres.
DescriÃ§Ã£o obrigatÃ³ria, mÃ¡ximo 2000 caracteres.
Imagem obrigatÃ³ria ou opcional conforme regra.
Categoria obrigatÃ³ria.
ComentÃ¡rio mÃ¡ximo 1000 caracteres.
```

O objetivo Ã© melhorar UX, mas a validaÃ§Ã£o real continua no backend.

---

## 44. ProteÃ§Ã£o contra mÃºltiplos submits

O frontend deve evitar que o usuÃ¡rio clique vÃ¡rias vezes no mesmo botÃ£o.

Exemplo:

- desabilitar botÃ£o enquanto envia;
- mostrar loading;
- impedir reenvio duplicado;
- usar idempotÃªncia em operaÃ§Ãµes crÃ­ticas quando necessÃ¡rio.

No backend, tambÃ©m validar duplicidade.

---

## 45. IdempotÃªncia

Algumas aÃ§Ãµes devem ser idempotentes.

Exemplo:

```txt
confirmar denÃºncia
marcar como urgente
votar resoluÃ§Ã£o
```

Se o usuÃ¡rio enviar a mesma requisiÃ§Ã£o duas vezes, o sistema nÃ£o deve duplicar o registro.

---

## 46. ModeraÃ§Ã£o segura

A moderaÃ§Ã£o precisa ser registrada e justificÃ¡vel.

Toda aÃ§Ã£o de moderaÃ§Ã£o deve ter:

```txt
moderador
aÃ§Ã£o
motivo
data/hora
conteÃºdo afetado
```

A remoÃ§Ã£o deve preferencialmente ser lÃ³gica, nÃ£o fÃ­sica.

Exemplo:

```txt
deletedAt
deletedBy
deleteReason
```

Assim Ã© possÃ­vel auditar depois.

---

## 47. RemoÃ§Ã£o lÃ³gica

Evitar deletar dados importantes fisicamente.

Usar:

```txt
deletedAt
deletedBy
deleteReason
```

AplicÃ¡vel a:

- denÃºncias;
- comentÃ¡rios;
- imagens;
- organizaÃ§Ãµes;
- usuÃ¡rios.

Isso preserva histÃ³rico e auditoria.

---

## 48. SeguranÃ§a em respostas oficiais

Respostas oficiais da prefeitura/secretaria devem ser protegidas.

Regras:

- apenas usuÃ¡rios vinculados Ã  organizaÃ§Ã£o podem responder;
- resposta oficial deve indicar organizaÃ§Ã£o;
- resposta oficial nÃ£o pode ser editada sem histÃ³rico;
- ediÃ§Ã£o deve registrar versÃ£o anterior ou gerar log;
- exclusÃ£o deve ser moderada/auditada.

---

## 49. SeguranÃ§a na criaÃ§Ã£o de prefeitura e secretaria

Fluxo recomendado:

```txt
ADMIN_APP cria prefeitura
ADMIN_APP define primeiro ADMIN_PREFEITURA
ADMIN_PREFEITURA cria secretarias
ADMIN_PREFEITURA convida usuÃ¡rios
ADMIN_SECRETARIA gerencia sua equipe
```

Regras:

- uma secretaria sempre pertence a uma prefeitura;
- prefeitura nÃ£o cria outra prefeitura;
- secretaria nÃ£o cria prefeitura;
- secretaria nÃ£o cria secretaria irmÃ£;
- usuÃ¡rio institucional precisa estar vinculado Ã  organizaÃ§Ã£o correta.

---

## 50. Convites institucionais

Para adicionar usuÃ¡rios Ã  prefeitura/secretaria, usar convite por email.

Regras:

- convite com token Ãºnico;
- token com expiraÃ§Ã£o;
- token nÃ£o reutilizÃ¡vel;
- registrar quem convidou;
- permitir cancelar convite.

Evitar criar usuÃ¡rios institucionais sem confirmaÃ§Ã£o do email.

---

## 51. NotificaÃ§Ãµes

NotificaÃ§Ãµes nÃ£o devem expor informaÃ§Ãµes sensÃ­veis.

Exemplo correto:

```txt
Sua denÃºncia recebeu uma resposta oficial.
```

Evitar:

```txt
O usuÃ¡rio JoÃ£o da Secretaria X acessou seus dados pessoais.
```

---

## 52. Backup e recuperaÃ§Ã£o

Para produÃ§Ã£o, definir rotina de backup.

### Banco de dados

- backup diÃ¡rio;
- retenÃ§Ã£o mÃ­nima;
- teste periÃ³dico de restauraÃ§Ã£o.

### Arquivos

- backup do bucket de imagens;
- versionamento ou retenÃ§Ã£o, se possÃ­vel.

---

## 53. Docker e variÃ¡veis de ambiente

Nunca colocar segredos no cÃ³digo.

Usar variÃ¡veis de ambiente para:

```txt
senha do banco
JWT_SECRET
credenciais do MinIO
chaves de API
configuraÃ§Ãµes de email
```

NÃ£o subir `.env` real para o GitHub.

Criar apenas:

```txt
.env.example
```

---

## 54. JWT Secret

O segredo do JWT deve ser:

- grande;
- aleatÃ³rio;
- diferente por ambiente;
- nunca versionado no Git.

Evitar:

```txt
JWT_SECRET=123456
JWT_SECRET=secret
```

---

## 55. Ambientes separados

Ter configuraÃ§Ãµes separadas para:

```txt
development
staging
production
```

ProduÃ§Ã£o deve ter:

- HTTPS;
- logs controlados;
- CORS restrito;
- cookies Secure;
- banco com senha forte;
- `show-sql=false`;
- Swagger protegido ou desativado publicamente.

---

## 56. Swagger/OpenAPI

Swagger Ã© Ã³timo para desenvolvimento, mas cuidado em produÃ§Ã£o.

Regras:

- proteger com autenticaÃ§Ã£o; ou
- liberar apenas em ambiente de desenvolvimento; ou
- restringir por IP/rede.

NÃ£o deixar documentaÃ§Ã£o sensÃ­vel aberta sem necessidade.

---

## 57. Monitoramento

O sistema deve ter monitoramento bÃ¡sico.

Usar:

```txt
Spring Boot Actuator
logs estruturados
health check
```

Endpoints Ãºteis:

```txt
/actuator/health
```

Em produÃ§Ã£o, nÃ£o expor todos os endpoints do Actuator publicamente.

---

## 58. Testes importantes

Criar testes para regras crÃ­ticas.

### Testes de seguranÃ§a

- morador nÃ£o altera status;
- secretaria nÃ£o acessa denÃºncia de outra secretaria;
- prefeitura nÃ£o modera conteÃºdo;
- usuÃ¡rio nÃ£o confirma duas vezes;
- usuÃ¡rio nÃ£o vota duas vezes;
- usuÃ¡rio anÃ´nimo continua vinculado internamente;
- upload invÃ¡lido Ã© recusado;
- login com senha errada falha;
- token expirado nÃ£o acessa rota protegida.

### Testes de regra de negÃ³cio

- denÃºncia muda status corretamente;
- timeline Ã© criada a cada alteraÃ§Ã£o;
- denÃºncia concluÃ­da permite votaÃ§Ã£o;
- denÃºncia pode ser reaberta;
- secretaria pode transferir denÃºncia;
- duplicidade Ã© detectada.

---

## 59. Checklist de seguranÃ§a para o MVP

Antes de considerar o MVP pronto, verificar:

```txt
[ ] Senhas com BCrypt
[ ] JWT configurado corretamente
[ ] Tokens em cookies HttpOnly
[ ] Refresh token com invalidaÃ§Ã£o
[ ] CORS restrito
[ ] HTTPS planejado para produÃ§Ã£o
[ ] Rate limit em login
[ ] Rate limit em cadastro
[ ] Rate limit em denÃºncias
[ ] ValidaÃ§Ã£o de DTOs no backend
[ ] ValidaÃ§Ã£o de formulÃ¡rios no frontend
[ ] Limite de caracteres nos campos
[ ] Upload com limite de tamanho
[ ] Upload com tipos permitidos
[ ] Imagens salvas fora do banco
[ ] PermissÃµes por papel
[ ] PermissÃµes por organizaÃ§Ã£o
[ ] Logs de aÃ§Ãµes sensÃ­veis
[ ] Timeline de status
[ ] ModeraÃ§Ã£o com justificativa
[ ] RemoÃ§Ã£o lÃ³gica
[ ] PaginaÃ§Ã£o em listas
[ ] NÃ£o usar localStorage para token
[ ] NÃ£o expor stack trace na API
[ ] NÃ£o usar ddl-auto update em produÃ§Ã£o
[ ] VariÃ¡veis sensÃ­veis fora do Git
[ ] Swagger protegido em produÃ§Ã£o
[ ] Backup planejado
```

---

## 60. Ordem prÃ¡tica de implementaÃ§Ã£o da seguranÃ§a

SugestÃ£o de ordem:

```txt
1. Configurar autenticaÃ§Ã£o com Spring Security
2. Implementar BCrypt nas senhas
3. Implementar JWT com cookies HttpOnly
4. Criar roles e permissÃµes bÃ¡sicas
5. Criar verificaÃ§Ã£o de organizaÃ§Ã£o nos endpoints
6. Criar DTOs com validaÃ§Ã£o
7. Padronizar erros da API
8. Configurar CORS
9. Criar logs de aÃ§Ãµes sensÃ­veis
10. Configurar rate limit
11. Implementar upload seguro
12. Criar moderaÃ§Ã£o com justificativa
13. Criar remoÃ§Ã£o lÃ³gica
14. Criar testes de permissÃ£o
15. Revisar endpoints antes do deploy
```

---

## 61. ConclusÃ£o

A seguranÃ§a desse sistema nÃ£o depende apenas de login e senha.

Como ele envolve moradores, prefeitura, secretarias, denÃºncias pÃºblicas, anonimato visual, imagens e engajamento, Ã© necessÃ¡rio proteger vÃ¡rias camadas:

```txt
autenticaÃ§Ã£o
autorizaÃ§Ã£o
validaÃ§Ã£o
uploads
rate limit
logs
moderaÃ§Ã£o
privacidade
infraestrutura
frontend
backend
banco de dados
```

A regra principal Ã©:

```txt
O frontend ajuda na experiÃªncia.
O backend garante a seguranÃ§a.
O banco reforÃ§a a integridade.
Os logs garantem rastreabilidade.
```

Se essas regras forem seguidas desde o inÃ­cio, o sistema terÃ¡ uma base muito mais segura, robusta e confiÃ¡vel.
