import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import cliente from '../api/cliente';
import { useAuth } from '../contextos/AuthContext';

const Layout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Buscar contagem de notificações não lidas
  const { data: notificacoesContador = 0 } = useQuery({
    queryKey: ['notificacoes-contador'],
    queryFn: async () => {
      try {
        const response = await cliente.get('/api/notificacoes/minhas', {
          params: { somenteNaoLidas: true }
        });
        return response.data.totalElements || 0;
      } catch {
        return 0;
      }
    },
    enabled: !!usuario,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAtivo = (path) => location.pathname === path;

  // Verificamos se o usuário tem privilégios institucionais globais ou se é morador.
  // Como o morador pode ter vínculos institucionais no banco, daremos a opção de ir para o operacional
  // se o perfil for adequado ou se tiver vínculos de prefeitura/secretaria.
  const mostrarOperacional = usuario && (
    usuario.perfilGlobal === 'ADMIN_PREFEITURA' || 
    usuario.perfilGlobal === 'ADMIN_SECRETARIA' || 
    usuario.perfilGlobal === 'ATENDENTE_SECRETARIA' ||
    usuario.perfilGlobal === 'ADMIN_APP' // Admins gerais também podem acessar ou supervisionar
  );

  const mostrarModeracao = usuario && (
    usuario.perfilGlobal === 'ADMIN_APP' || 
    usuario.perfilGlobal === 'MODERADOR'
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header / Barra de Navegação */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link to="/" className="text-2xl font-bold tracking-tight text-blue-600 flex items-center gap-1.5">
                <span>Cidade Ativa</span>
              </Link>
            </div>

            {/* Menu de Links */}
            <nav className="hidden md:flex space-x-4 items-center">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isAtivo('/') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                Feed de Denúncias
              </Link>

              {usuario?.perfilGlobal === 'MORADOR' && (
                <>
                  <Link 
                    to="/denuncias/nova" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isAtivo('/denuncias/nova') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    Nova Denúncia
                  </Link>
                  <Link 
                    to="/denuncias/minhas" 
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isAtivo('/denuncias/minhas') ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    Minhas Denúncias
                  </Link>
                </>
              )}

              {mostrarOperacional && (
                <Link 
                  to="/operacional" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isAtivo('/operacional') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Painel Operacional
                </Link>
              )}

              {mostrarModeracao && (
                <Link 
                  to="/moderacao" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isAtivo('/moderacao') ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Moderação
                </Link>
              )}

              {(usuario?.perfilGlobal === 'ADMIN_APP' || usuario?.perfilGlobal === 'ADMIN_PREFEITURA') && (
                <Link 
                  to="/admin" 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isAtivo('/admin') ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  Administração
                </Link>
              )}
            </nav>

            {/* Usuário e Logout */}
            <div className="flex items-center space-x-4">
              {/* Central de Notificações Bell Icon */}
              {usuario && (
                <Link
                  to="/notificacoes"
                  className={`relative p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                    isAtivo('/notificacoes') ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Notificações"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notificacoesContador > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-[8px] font-bold h-4 w-4 flex items-center justify-center border-2 border-white animate-pulse">
                      {notificacoesContador}
                    </span>
                  )}
                </Link>
              )}

              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{usuario?.nome}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {usuario?.perfilGlobal?.toLowerCase().replace('_', ' ')}
                </p>
              </div>

              {usuario?.fotoPerfilUrl ? (
                <img 
                  className="h-9 w-9 rounded-full object-cover border border-gray-200" 
                  src={usuario.fotoPerfilUrl} 
                  alt="Perfil" 
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {usuario?.nome?.charAt(0).toUpperCase()}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Sair
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Menu Mobile Rápido */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex justify-around text-xs font-semibold text-gray-600">
        <Link to="/" className="hover:text-blue-600">Feed</Link>
        {usuario && (
          <Link to="/notificacoes" className="hover:text-blue-600 relative">
            Alertas
            {notificacoesContador > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center border border-white">
                {notificacoesContador}
              </span>
            )}
          </Link>
        )}
        {usuario?.perfilGlobal === 'MORADOR' && (
          <>
            <Link to="/denuncias/nova" className="hover:text-blue-600">+ Denúncia</Link>
            <Link to="/denuncias/minhas" className="hover:text-blue-600">Minhas</Link>
          </>
        )}
        {mostrarOperacional && <Link to="/operacional" className="hover:text-indigo-600">Painel</Link>}
        {mostrarModeracao && <Link to="/moderacao" className="hover:text-purple-600">Moderador</Link>}
        {(usuario?.perfilGlobal === 'ADMIN_APP' || usuario?.perfilGlobal === 'ADMIN_PREFEITURA') && <Link to="/admin" className="hover:text-indigo-600">Admin</Link>}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Cidade Ativa — Gestão Colaborativa de Denúncias Urbanas</p>
      </footer>
    </div>
  );
};

export default Layout;
