# Alteracao 055 - Limpeza do Admin App e Visao Geral Real

Data: 2026-06-04

## Objetivo

Resolver as pendencias restantes do Admin App relacionadas a dados mockados e metricas operacionais que nao fazem parte do escopo atual definido para o projeto.

## Alteracoes

### Remocao da tela operacional global mockada

O arquivo `front/src/app/pages/adminapp/OperacionalPage.tsx` foi removido.

Motivo:

- a rota `/admin-app/operacional` ja redirecionava para `/admin-app/visao-geral`;
- a tela nao aparecia no menu do Admin App;
- o conteudo era inteiramente mockado;
- o produto definiu que o Admin App nao precisa de metricas operacionais detalhadas por agora.

### Visao geral com dados reais

A pagina `front/src/app/pages/adminapp/VisaoGeralPage.tsx` foi reescrita para usar apenas dados reais dos endpoints ja integrados:

- `GET /api/usuarios`
- `GET /api/organizacoes`
- `GET /api/categorias`
- `GET /api/paineis/moderacao/resumo`
- `GET /api/auditorias?page=0&size=5`

A tela agora exibe:

- total de usuarios;
- usuarios ativos;
- total de prefeituras;
- total de secretarias;
- categorias ativas;
- resumo simples de moderacao;
- ultimos eventos auditados;
- atalhos para as areas reais de gestao.

## Decisao de Produto Mantida

Nao foram adicionados analytics detalhados, comparativos por periodo, taxa de resolucao global inventada nem satisfacao media.

A tela foi mantida como painel administrativo simples, alinhado ao escopo atual:

- contas;
- organizacoes;
- vinculos;
- categorias;
- moderacao;
- auditoria.

## Validacao

- `npm.cmd run build`: passou. O Vite manteve apenas o aviso conhecido de chunk acima de 500 kB.

## Pendencias Conscientes

- A visao geral usa `GET /api/usuarios` sem paginacao porque esse e o contrato atual do backend.
- Se o volume crescer muito, o proximo refinamento recomendado e paginar/agregar esses totais no backend.
