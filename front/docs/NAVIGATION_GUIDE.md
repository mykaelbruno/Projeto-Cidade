# Guia de Navegação - Conecta Cidadão

Este guia explica como implementar navegação no Conecta Cidadão usando React Router v7.

## 📚 Índice

1. [Navegação Básica](#navegação-básica)
2. [Links vs Navegação Programática](#links-vs-navegação-programática)
3. [Rotas Dinâmicas](#rotas-dinâmicas)
4. [Voltar e Avançar](#voltar-e-avançar)
5. [Passando Estado](#passando-estado)
6. [Boas Práticas](#boas-práticas)

## Navegação Básica

### Usando useNavigate (recomendado para botões)

```tsx
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/feed')}>
      Ir para o Feed
    </button>
  );
}
```

### Usando Link (recomendado para texto)

```tsx
import { Link } from 'react-router';

function MyComponent() {
  return (
    <Link to="/feed" className="text-primary hover:underline">
      Ver Feed
    </Link>
  );
}
```

## Links vs Navegação Programática

### Quando usar `navigate()`
- ✅ Botões e ações
- ✅ Após completar um formulário
- ✅ Após uma ação bem-sucedida
- ✅ Navegação condicional

```tsx
// Exemplo: após criar relato
const handleSubmit = async () => {
  await createReport(data);
  navigate('/minhas'); // redireciona após sucesso
};
```

### Quando usar `<Link>`
- ✅ Links de texto
- ✅ Cards clicáveis que funcionam como links
- ✅ Menu de navegação
- ✅ Quando precisa de comportamento nativo de link (ctrl+click, etc)

```tsx
<Link to="/perfil" className="nav-item">
  Meu Perfil
</Link>
```

## Rotas Dinâmicas

### Definindo a rota (no App.tsx)

```tsx
<Route path="/relato/:id" element={<ReportDetailPage />} />
```

### Acessando parâmetros

```tsx
import { useParams } from 'react-router';

function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Use o id para buscar dados
  const report = mockReports.find(r => r.id === id);
  
  return <div>Relato #{id}</div>;
}
```

### Navegando para rota dinâmica

```tsx
// String template
navigate(`/relato/${report.id}`);

// Ou use Link
<Link to={`/relato/${report.id}`}>Ver detalhes</Link>
```

## Voltar e Avançar

### Voltar uma página

```tsx
navigate(-1); // volta uma página no histórico
```

### Avançar ou voltar N páginas

```tsx
navigate(-2); // volta 2 páginas
navigate(1);  // avança 1 página
```

### Exemplo completo

```tsx
function ReportDetail() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)}>
      ← Voltar
    </button>
  );
}
```

## Passando Estado

### Enviar estado na navegação

```tsx
navigate('/novo-relato', {
  state: { category: 'mobilidade', urgent: true }
});
```

### Receber estado

```tsx
import { useLocation } from 'react-router';

function NewReportPage() {
  const location = useLocation();
  const state = location.state as { category?: string; urgent?: boolean };
  
  console.log(state.category); // 'mobilidade'
}
```

⚠️ **Importante:** Estado é perdido ao recarregar a página!

## Boas Práticas

### ✅ Fazer

```tsx
// 1. Importar apenas o que precisa
import { useNavigate } from 'react-router';

// 2. Usar navigate para ações
const handleDelete = () => {
  deleteReport(id);
  navigate('/minhas');
};

// 3. Usar Link para navegação de interface
<Link to="/feed">Voltar ao Feed</Link>

// 4. Tratar rotas não encontradas
if (!report) {
  return <NotFound />;
}

// 5. Usar paths relativos quando apropriado
navigate('../'); // vai para o pai
```

### ❌ Evitar

```tsx
// 1. Não misturar window.location com React Router
window.location.href = '/feed'; // ❌ recarrega a página

// 2. Não usar a tag <a> para navegação interna
<a href="/feed">Feed</a> // ❌ recarrega a página

// 3. Não criar rotas duplicadas
<Route path="/feed" />
<Route path="/home" /> // ❌ use uma só

// 4. Não navegar em useEffect sem dependências claras
useEffect(() => {
  navigate('/feed'); // ❌ pode causar loops
}, []);
```

## Exemplos Práticos

### Card Clicável que Navega

```tsx
function ReportCard({ report }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/relato/${report.id}`)}
      className="cursor-pointer hover:shadow-lg transition-shadow"
    >
      <h3>{report.title}</h3>
      <p>{report.description}</p>
    </div>
  );
}
```

### Formulário com Redirecionamento

```tsx
function NewReportForm() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      await createReport(data);
      navigate('/minhas', {
        state: { message: 'Relato criado com sucesso!' }
      });
    } catch (error) {
      // Tratar erro, não redirecionar
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Navegação Condicional

```tsx
function ProtectedPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return <div>Conteúdo protegido</div>;
}
```

### Modal que Preserva URL

```tsx
// Ao invés de modal, use rota
<Route path="/relato/:id" element={<ReportModal />} />

// Assim o usuário pode compartilhar o link
// E o modal aparece na URL correta
```

## Debugging

### Ver a rota atual

```tsx
import { useLocation } from 'react-router';

function Debug() {
  const location = useLocation();
  
  console.log('Path:', location.pathname);
  console.log('Search:', location.search);
  console.log('Hash:', location.hash);
  console.log('State:', location.state);
}
```

### Interceptar navegação (não implementado ainda)

```tsx
// Para avisos de "tem certeza?" ao sair de formulários
// Requer implementação adicional no futuro
```

## Recursos Adicionais

- [React Router Docs](https://reactrouter.com/)
- [ROUTES.md](../ROUTES.md) - Mapa completo de rotas do projeto
- Exemplos no código: veja `src/app/pages/` para implementações
