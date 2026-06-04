import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contextos/AuthContext';
import Layout from '../componentes/Layout';

// Páginas Públicas
import Login from '../paginas/publicas/Login';
import Cadastro from '../paginas/publicas/Cadastro';
import RecuperarSenha from '../paginas/publicas/RecuperarSenha';
import ConfirmarEmail from '../paginas/publicas/ConfirmarEmail';

// Páginas Protegidas
import FeedDenuncias from '../paginas/morador/FeedDenuncias';
import NovaDenuncia from '../paginas/morador/NovaDenuncia';
import MinhasDenuncias from '../paginas/morador/MinhasDenuncias';
import DetalheDenuncia from '../paginas/morador/DetalheDenuncia';
import Notificacoes from '../paginas/morador/Notificacoes';

// Páginas Institucionais e Moderadoras
import Operacional from '../paginas/institucional/Operacional';
import Moderacao from '../paginas/admin/Moderacao';
import DashboardAdmin from '../paginas/admin/DashboardAdmin';

const RotaPrivada = ({ children, papeisPermitidos }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (papeisPermitidos) {
    const papelGlobalValido = papeisPermitidos.includes(usuario.perfilGlobal);
    if (!papelGlobalValido) {
      // Nota: Para usuários institucionais que não tem ADMIN_APP ou MODERADOR global mas atuam por vinculos
      // O backend valida o vinculo ativo nas rotas institucionais. Aqui no front permitiremos acesso
      // a rota /operacional se perfilGlobal for MORADOR mas tiver papeis permitidos ou se validarmos no componente.
      // Daremos um bypass básico se for rota operacional
      const isInstitucionalRoute = papeisPermitidos.includes('INSTITUCIONAL');
      if (isInstitucionalRoute && usuario.perfilGlobal === 'MORADOR') {
        // Se o morador não tiver nenhum vinculo, o backend vai barrar as chamadas, mas permitimos carregar o painel operacional para mostrar a mensagem
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

const RotaPublica = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRotas = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<RotaPublica><Login /></RotaPublica>} />
      <Route path="/cadastro" element={<RotaPublica><Cadastro /></RotaPublica>} />
      <Route path="/recuperar-senha" element={<RotaPublica><RecuperarSenha /></RotaPublica>} />
      <Route path="/confirmar-email" element={<RotaPublica><ConfirmarEmail /></RotaPublica>} />

      {/* Rotas Protegidas (Dentro do Layout Comum) */}
      <Route path="/" element={<RotaPrivada><Layout /></RotaPrivada>}>
        <Route index element={<FeedDenuncias />} />
        <Route path="denuncias/nova" element={<RotaPrivada><NovaDenuncia /></RotaPrivada>} />
        <Route path="denuncias/minhas" element={<RotaPrivada><MinhasDenuncias /></RotaPrivada>} />
        <Route path="denuncias/:id" element={<RotaPrivada><DetalheDenuncia /></RotaPrivada>} />
        <Route path="notificacoes" element={<RotaPrivada><Notificacoes /></RotaPrivada>} />
        
        {/* Rota Institucional (Prefeitura/Secretarias) */}
        <Route path="operacional" element={
          <RotaPrivada papeisPermitidos={['INSTITUCIONAL', 'ADMIN_PREFEITURA', 'ADMIN_SECRETARIA', 'ATENDENTE_SECRETARIA', 'ADMIN_APP']}>
            <Operacional />
          </RotaPrivada>
        } />

        {/* Rota de Moderação */}
        <Route path="moderacao" element={
          <RotaPrivada papeisPermitidos={['ADMIN_APP', 'MODERADOR']}>
            <Moderacao />
          </RotaPrivada>
        } />

        {/* Rota de Administração Geral */}
        <Route path="admin" element={
          <RotaPrivada papeisPermitidos={['ADMIN_APP', 'ADMIN_PREFEITURA']}>
            <DashboardAdmin />
          </RotaPrivada>
        } />
      </Route>

      {/* Rota Padrão (Fallback) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRotas;
