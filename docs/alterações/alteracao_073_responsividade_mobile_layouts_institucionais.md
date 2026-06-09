# Alteracao 073 - Responsividade mobile dos layouts institucionais

## O que foi ajustado

- Reestruturados os layouts de:
  - `admin_app`
  - `prefeitura`
  - `secretaria`
  - `moderador`
- O menu lateral agora funciona como gaveta no mobile, com:
  - botao de abrir no topo
  - overlay escurecido
  - botao de fechar
  - fechamento automatico ao navegar
- O conteudo principal deixou de nascer deslocado para a direita em telas pequenas.
- Os headers ficaram mais compactos no mobile, com menos elementos visiveis ao mesmo tempo.
- O botao de recolher sidebar ficou restrito ao desktop.

## Ajustes complementares

- Padroes de padding dos wrappers principais foram suavizados em telas pequenas nas paginas:
  - administracao da prefeitura
  - bairros
  - auditoria da prefeitura
  - visao geral do admin app
  - categorias do admin app
  - moderacao do admin app
  - auditoria do admin app
  - perfil da secretaria
  - carregamento do painel do moderador

## Objetivo da alteracao

Resolver o problema em que as areas institucionais estavam sendo renderizadas com estrutura de desktop em largura de celular, causando:

- sidebar fixa esmagando o conteudo
- textos e cards cortados
- excesso de margem lateral
- baixa usabilidade em navegacao touch

## Validacao

- `npm.cmd run build`

## Observacoes

- Esta etapa atacou primeiro o shell de navegacao e os wrappers principais, que eram a causa mais estrutural da quebra.
- Ainda vale uma nova rodada de QA visual em celular nas paginas mais densas, principalmente:
  - vinculos
  - organizacoes
  - administracao
  - bairros
  - auditoria
