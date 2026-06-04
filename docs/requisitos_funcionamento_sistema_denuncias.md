# Documento 1 â€” Requisitos e Funcionamento do Sistema

## 1. VisÃ£o geral do produto

O sistema serÃ¡ uma plataforma social local para registro, acompanhamento e priorizaÃ§Ã£o de problemas urbanos relatados pelos moradores.

A ideia principal Ã© permitir que qualquer morador da cidade possa registrar uma denÃºncia ou reclamaÃ§Ã£o pÃºblica sobre problemas coletivos, como buracos, lixo acumulado, iluminaÃ§Ã£o pÃºblica, transporte, saÃºde, educaÃ§Ã£o e infraestrutura urbana.

A plataforma funcionarÃ¡ como uma mistura de:

- rede social local;
- portal de denÃºncias;
- sistema de acompanhamento de ocorrÃªncias;
- canal de transparÃªncia entre moradores e prefeitura.

O objetivo nÃ£o Ã© ser uma rede social genÃ©rica, mas sim um ambiente organizado para transformar reclamaÃ§Ãµes soltas em problemas pÃºblicos rastreÃ¡veis, priorizados e acompanhados pela comunidade.

---

## 2. Problema que o sistema resolve

Atualmente, muitos problemas urbanos sÃ£o reclamados em grupos de WhatsApp, Instagram, Facebook ou conversas informais, mas essas reclamaÃ§Ãµes geralmente:

- ficam espalhadas;
- nÃ£o geram histÃ³rico;
- nÃ£o tÃªm acompanhamento;
- sÃ£o repetidas vÃ¡rias vezes por pessoas diferentes;
- nÃ£o chegam de forma organizada Ã  prefeitura;
- nÃ£o mostram quais problemas sÃ£o mais urgentes para a populaÃ§Ã£o.

O sistema centraliza essas informaÃ§Ãµes e cria um fluxo claro:

```txt
Morador identifica um problema
â†“
Registra uma denÃºncia com foto, descriÃ§Ã£o e localizaÃ§Ã£o
â†“
Outros moradores confirmam e comentam
â†“
O problema ganha relevÃ¢ncia
â†“
A prefeitura ou secretaria responsÃ¡vel acompanha
â†“
O status Ã© atualizado
â†“
A comunidade valida se o problema foi resolvido
```

---

## 3. UsuÃ¡rios do sistema

### 3.1 Morador

UsuÃ¡rio comum da plataforma.

Pode:

- criar conta;
- fazer login;
- editar perfil;
- cadastrar denÃºncias;
- publicar denÃºncias de forma anÃ´nima ou identificada;
- adicionar foto e localizaÃ§Ã£o;
- confirmar problemas de outros moradores;
- comentar;
- denunciar conteÃºdo imprÃ³prio;
- acompanhar status das denÃºncias;
- validar se uma denÃºncia marcada como resolvida realmente foi resolvida.

---

### 3.2 Administrador da aplicaÃ§Ã£o

UsuÃ¡rio responsÃ¡vel pela administraÃ§Ã£o geral do sistema.

Pode:

- criar perfis institucionais de prefeituras;
- verificar ou bloquear prefeituras;
- gerenciar permissÃµes globais;
- acessar logs administrativos;
- configurar categorias gerais;
- moderar conteÃºdos;
- revisar denÃºncias reportadas;
- remover conteÃºdos que violem as regras;
- acompanhar o funcionamento geral da plataforma.

---

### 3.3 Administrador da prefeitura

UsuÃ¡rio vinculado a uma prefeitura cadastrada pelo administrador da aplicaÃ§Ã£o.

Pode:

- editar dados da prefeitura;
- criar secretarias;
- convidar usuÃ¡rios institucionais;
- acompanhar todas as denÃºncias da cidade;
- visualizar mÃ©tricas gerais;
- supervisionar o trabalho das secretarias;
- responder oficialmente, caso necessÃ¡rio.

---

### 3.4 Administrador da secretaria

UsuÃ¡rio responsÃ¡vel por uma secretaria especÃ­fica.

Pode:

- gerenciar dados da secretaria;
- visualizar denÃºncias relacionadas Ã s categorias da secretaria;
- responder oficialmente;
- atualizar status;
- transferir denÃºncia para outra secretaria;
- convidar atendentes da secretaria;
- anexar evidÃªncias de andamento ou conclusÃ£o.

---

### 3.5 Atendente/servidor da secretaria

UsuÃ¡rio operacional vinculado a uma secretaria.

Pode:

- visualizar denÃºncias atribuÃ­das Ã  secretaria;
- responder oficialmente;
- alterar status conforme permissÃ£o;
- anexar fotos ou observaÃ§Ãµes;
- solicitar transferÃªncia para outra secretaria.

---

### 3.6 Moderador

UsuÃ¡rio responsÃ¡vel por manter a qualidade e seguranÃ§a do conteÃºdo.

Pode:

- revisar denÃºncias reportadas;
- ocultar denÃºncias inadequadas;
- remover comentÃ¡rios ofensivos;
- marcar denÃºncias duplicadas;
- fundir denÃºncias repetidas;
- aplicar advertÃªncias;
- bloquear usuÃ¡rios em casos graves.

Importante: a moderaÃ§Ã£o deve ser feita pela plataforma, e nÃ£o pela prefeitura, para evitar acusaÃ§Ãµes de censura ou manipulaÃ§Ã£o polÃ­tica.

---

## 4. Estrutura institucional

O sistema deve permitir uma estrutura hierÃ¡rquica entre prefeitura e secretarias.

```txt
AplicaÃ§Ã£o
â””â”€â”€ Prefeitura Municipal
    â”œâ”€â”€ Secretaria de Infraestrutura
    â”œâ”€â”€ Secretaria de SaÃºde
    â”œâ”€â”€ Secretaria de EducaÃ§Ã£o
    â”œâ”€â”€ Secretaria de Limpeza Urbana
    â””â”€â”€ Secretaria de Transporte
```

### Regra principal

O administrador da aplicaÃ§Ã£o cria a prefeitura.

Depois disso, a prÃ³pria prefeitura pode criar suas secretarias e vincular usuÃ¡rios a elas.

---

## 5. DenÃºncias

A denÃºncia Ã© o elemento central do sistema.

Ela funciona de forma parecida com uma postagem em rede social, mas com estrutura voltada para problemas urbanos.

### Campos principais da denÃºncia

- tÃ­tulo;
- descriÃ§Ã£o;
- categoria;
- foto ou vÃ­deo;
- cidade;
- bairro;
- rua ou referÃªncia;
- latitude;
- longitude;
- status;
- usuÃ¡rio criador;
- indicaÃ§Ã£o se serÃ¡ exibida como anÃ´nima;
- data de criaÃ§Ã£o;
- data da Ãºltima atualizaÃ§Ã£o;
- secretaria responsÃ¡vel;
- nÃ­vel de relevÃ¢ncia;
- quantidade de confirmaÃ§Ãµes;
- quantidade de urgÃªncias;
- quantidade de comentÃ¡rios.

---

## 6. PublicaÃ§Ã£o anÃ´nima

O morador poderÃ¡ escolher se deseja aparecer publicamente ou nÃ£o.

### Regra

Mesmo que a denÃºncia seja exibida como anÃ´nima para outros usuÃ¡rios, internamente ela sempre estarÃ¡ vinculada ao usuÃ¡rio real.

Isso Ã© importante para:

- evitar abuso;
- combater spam;
- permitir auditoria;
- aplicar penalidades em caso de mau uso.

Exemplo:

```txt
ExibiÃ§Ã£o pÃºblica:
Publicado por Morador AnÃ´nimo

Internamente:
denuncia.usuarioId = 25
```

---

## 7. Categorias de denÃºncia

As categorias devem ser prÃ©-definidas pelo sistema ou pela prefeitura.

Exemplos:

### Infraestrutura

- buraco;
- calÃ§amento;
- pavimentaÃ§Ã£o;
- drenagem;
- rua alagada.

### IluminaÃ§Ã£o pÃºblica

- poste apagado;
- poste quebrado;
- fiaÃ§Ã£o exposta.

### Limpeza urbana

- lixo acumulado;
- entulho;
- terreno abandonado;
- esgoto a cÃ©u aberto.

### SaÃºde pÃºblica

- problema em posto de saÃºde;
- falta de medicamento;
- estrutura precÃ¡ria.

### EducaÃ§Ã£o

- problema em escola pÃºblica;
- transporte escolar;
- estrutura escolar.

### Transporte e mobilidade

- ponto de Ã´nibus danificado;
- falta de sinalizaÃ§Ã£o;
- rua sem acessibilidade.

---

## 8. Feed inicial

O feed serÃ¡ a tela principal dos moradores.

Ele deve exibir denÃºncias em formato de post, com foto, tÃ­tulo, localizaÃ§Ã£o, status e interaÃ§Ãµes.

### Abas sugeridas

#### Recentes

Mostra as denÃºncias mais novas.

#### Em alta

Mostra denÃºncias com maior engajamento.

#### PrÃ³ximas de mim

Mostra denÃºncias prÃ³ximas da localizaÃ§Ã£o do usuÃ¡rio.

#### Meu bairro

Mostra denÃºncias do bairro do usuÃ¡rio.

#### Resolvidas

Mostra problemas que foram marcados como resolvidos.

---

## 9. InteraÃ§Ãµes

Em vez de usar apenas â€œcurtidaâ€, o sistema deve ter interaÃ§Ãµes mais adequadas ao contexto.

### Confirmar problema

O usuÃ¡rio confirma que aquele problema realmente existe.

Exemplo:

```txt
Eu tambÃ©m vi esse problema.
```

### Marcar como urgente

O usuÃ¡rio indica que o problema precisa de prioridade.

Exemplo:

```txt
Esse problema oferece risco ou precisa ser resolvido logo.
```

### ComentÃ¡rios

UsuÃ¡rios podem comentar na denÃºncia para adicionar contexto, informaÃ§Ãµes ou atualizaÃ§Ãµes.

### Compartilhamento

Opcional. Pode ser implementado depois para divulgar denÃºncias fora da plataforma.

---

## 10. RelevÃ¢ncia da denÃºncia

Cada denÃºncia deve ter um nÃ­vel de relevÃ¢ncia calculado a partir do engajamento.

Exemplo simples:

```txt
relevancia = confirmaÃ§Ãµes * 2 + urgÃªncias * 3 + comentÃ¡rios
```

Depois, esse cÃ¡lculo pode evoluir considerando:

- recÃªncia;
- quantidade de moradores afetados;
- tempo sem resposta;
- reincidÃªncia;
- proximidade geogrÃ¡fica;
- nÃºmero de reaberturas.

A relevÃ¢ncia serÃ¡ usada para ordenar denÃºncias em abas como â€œEm altaâ€ e â€œMais reclamadasâ€.

---

## 11. Evitar denÃºncias duplicadas

Ao criar uma nova denÃºncia, o sistema deve verificar se jÃ¡ existe uma denÃºncia parecida prÃ³xima ao local informado.

Exemplo:

```txt
JÃ¡ existe uma denÃºncia de buraco prÃ³xima a esse local.
Deseja apoiar a denÃºncia existente?
```

Isso evita que o feed fique poluÃ­do com vÃ¡rias denÃºncias sobre o mesmo problema.

### CritÃ©rios simples para detectar duplicidade

- mesma categoria;
- distÃ¢ncia geogrÃ¡fica prÃ³xima;
- tÃ­tulo/descriÃ§Ã£o parecidos;
- denÃºncia ainda aberta ou em andamento.

No MVP, isso pode comeÃ§ar de forma simples usando categoria + raio de distÃ¢ncia.

---

## 12. Status da denÃºncia

A denÃºncia deve possuir status pÃºblicos simples, fÃ¡ceis de entender.

### Status sugeridos

```txt
ABERTO
EM_ANALISE
ENCAMINHADO
EM_ANDAMENTO
PROGRAMADO
CONCLUIDO
REABERTO
ARQUIVADO
```

### ExplicaÃ§Ã£o

#### Aberto

DenÃºncia criada, mas ainda nÃ£o analisada.

#### Em anÃ¡lise

A secretaria ou prefeitura comeÃ§ou a verificar.

#### Encaminhado

Foi enviada para a secretaria responsÃ¡vel.

#### Em andamento

Existe alguma aÃ§Ã£o sendo realizada.

#### Programado

A soluÃ§Ã£o foi planejada ou agendada.

#### ConcluÃ­do

A prefeitura/secretaria marcou como resolvido.

#### Reaberto

A comunidade indicou que o problema nÃ£o foi resolvido corretamente.

#### Arquivado

DenÃºncia encerrada por duplicidade, conteÃºdo invÃ¡lido ou outro motivo justificado.

---

## 13. Timeline da denÃºncia

Cada denÃºncia deve ter uma linha do tempo com o histÃ³rico das aÃ§Ãµes.

Exemplo:

```txt
26/05/2026 - DenÃºncia criada pelo morador
26/05/2026 - 15 moradores confirmaram o problema
27/05/2026 - Encaminhada para Secretaria de Infraestrutura
28/05/2026 - Secretaria informou que estÃ¡ em anÃ¡lise
30/05/2026 - ServiÃ§o programado para 03/06/2026
03/06/2026 - Secretaria marcou como concluÃ­do
04/06/2026 - Moradores validaram a conclusÃ£o
```

A timeline aumenta a transparÃªncia e evita que mudanÃ§as de status fiquem sem explicaÃ§Ã£o.

---

## 14. Respostas oficiais

Prefeituras e secretarias podem responder oficialmente nas denÃºncias.

Exemplo:

```txt
Secretaria de Infraestrutura:
Equipe tÃ©cnica farÃ¡ vistoria no local atÃ© sexta-feira.
```

Essas respostas devem aparecer destacadas como respostas institucionais.

---

## 15. ValidaÃ§Ã£o da conclusÃ£o pela comunidade

Quando uma denÃºncia for marcada como concluÃ­da pela prefeitura ou secretaria, os moradores poderÃ£o validar se ela realmente foi resolvida.

Pergunta:

```txt
O problema foi realmente resolvido?
[Sim] [NÃ£o]
```

Se muitos usuÃ¡rios responderem â€œnÃ£oâ€, a denÃºncia pode ser reaberta.

Essa regra evita que a prefeitura marque problemas como resolvidos sem que a comunidade concorde.

---

## 16. ModeraÃ§Ã£o

A moderaÃ§Ã£o deve equilibrar liberdade de reclamaÃ§Ã£o com organizaÃ§Ã£o e seguranÃ§a.

### ConteÃºdos permitidos

- problemas urbanos;
- demandas coletivas;
- falhas em serviÃ§os pÃºblicos;
- relatos com foto, localizaÃ§Ã£o e contexto.

### ConteÃºdos proibidos

- ataques pessoais;
- exposiÃ§Ã£o indevida de pessoas;
- acusaÃ§Ãµes criminais sem prova;
- conteÃºdo ofensivo;
- spam;
- propaganda eleitoral;
- fake news;
- conteÃºdo fora do tema urbano/coletivo.

---

## 17. Sistema de denÃºncia de conteÃºdo

UsuÃ¡rios podem reportar conteÃºdos problemÃ¡ticos.

Motivos possÃ­veis:

```txt
CONTEUDO_OFENSIVO
INFORMACAO_FALSA
DUPLICADO
NAO_E_PROBLEMA_URBANO
EXPOSICAO_DE_PESSOA
SPAM
OUTRO
```

Quando uma denÃºncia ou comentÃ¡rio receber muitos reportes, ela pode entrar em revisÃ£o.

---

## 18. ReputaÃ§Ã£o do usuÃ¡rio

O sistema pode ter um mecanismo simples de reputaÃ§Ã£o.

UsuÃ¡rios confiÃ¡veis tÃªm mais peso em validaÃ§Ãµes e reportes.

### CritÃ©rios positivos

- denÃºncias confirmadas por outros moradores;
- denÃºncias resolvidas;
- comentÃ¡rios Ãºteis;
- baixa taxa de denÃºncias removidas.

### CritÃ©rios negativos

- spam;
- denÃºncias falsas;
- comentÃ¡rios ofensivos;
- uso abusivo do anonimato.

No MVP, isso pode ser implementado apenas como campo interno, sem exibir ranking pÃºblico.

---

## 19. Painel da prefeitura

A prefeitura deve ter uma Ã¡rea administrativa para acompanhar a situaÃ§Ã£o da cidade.

### Funcionalidades

- visualizar denÃºncias por status;
- visualizar denÃºncias por secretaria;
- visualizar denÃºncias por bairro;
- visualizar denÃºncias mais apoiadas;
- acompanhar denÃºncias sem resposta;
- ver tempo mÃ©dio de resposta;
- criar secretarias;
- convidar usuÃ¡rios;
- acompanhar relatÃ³rio geral da cidade.

---

## 20. Painel da secretaria

Cada secretaria deve ter uma fila prÃ³pria de denÃºncias.

### Funcionalidades

- listar denÃºncias atribuÃ­das;
- filtrar por status;
- responder oficialmente;
- atualizar status;
- transferir para outra secretaria;
- anexar evidÃªncias;
- consultar histÃ³rico.

---

## 21. TransferÃªncia entre secretarias

Uma secretaria pode transferir uma denÃºncia para outra quando nÃ£o for responsÃ¡vel pelo problema.

Exemplo:

```txt
Secretaria de Infraestrutura transferiu para Secretaria de Saneamento.
Motivo: problema relacionado Ã  rede de esgoto.
```

Essa transferÃªncia deve ficar registrada na timeline da denÃºncia.

---

## 22. NotificaÃ§Ãµes

O sistema deve notificar usuÃ¡rios quando houver mudanÃ§as importantes.

### Exemplos

- denÃºncia recebeu resposta oficial;
- status foi alterado;
- denÃºncia foi marcada como concluÃ­da;
- denÃºncia foi reaberta;
- alguÃ©m comentou em uma denÃºncia acompanhada;
- denÃºncia foi removida pela moderaÃ§Ã£o.

No MVP, as notificaÃ§Ãµes podem existir apenas dentro do sistema. Depois, podem evoluir para e-mail ou push.

---

## 23. RelatÃ³rios e mÃ©tricas

O sistema deve gerar informaÃ§Ãµes Ãºteis para a prefeitura e para a plataforma.

### MÃ©tricas possÃ­veis

- total de denÃºncias abertas;
- total de denÃºncias resolvidas;
- denÃºncias por bairro;
- denÃºncias por categoria;
- tempo mÃ©dio de resposta;
- tempo mÃ©dio de resoluÃ§Ã£o;
- denÃºncias mais confirmadas;
- secretarias com mais demandas;
- denÃºncias reabertas.

---

## 24. MVP recomendado

Para a primeira versÃ£o, priorizar:

### Morador

- cadastro;
- login;
- perfil bÃ¡sico;
- criaÃ§Ã£o de denÃºncia;
- feed;
- confirmaÃ§Ã£o de problema;
- comentÃ¡rio;
- visualizaÃ§Ã£o de status;
- validaÃ§Ã£o de resoluÃ§Ã£o.

### Prefeitura

- perfil institucional;
- criaÃ§Ã£o de secretarias;
- painel bÃ¡sico;
- resposta oficial;
- atualizaÃ§Ã£o de status.

### Secretaria

- fila de denÃºncias;
- resposta oficial;
- alteraÃ§Ã£o de status;
- transferÃªncia de denÃºncia.

### ModeraÃ§Ã£o

- reportar conteÃºdo;
- painel simples para moderador;
- remover/ocultar denÃºncia;
- marcar duplicada.

---

## 25. Funcionalidades para versÃµes futuras

- aplicativo mobile;
- notificaÃ§Ãµes push;
- integraÃ§Ã£o com WhatsApp;
- mapa com heatmap;
- inteligÃªncia artificial para sugerir categoria;
- detecÃ§Ã£o automÃ¡tica de duplicidade por imagem/texto;
- exportaÃ§Ã£o de relatÃ³rios em PDF;
- ranking pÃºblico de bairros com mais problemas;
- integraÃ§Ã£o com sistemas oficiais da prefeitura;
- painel pÃºblico de transparÃªncia.
