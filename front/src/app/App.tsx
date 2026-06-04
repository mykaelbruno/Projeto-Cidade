import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { UserProvider } from './contexts/UserContext';
import { RouteGuard } from './components/RouteGuard';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SecretariaLayout } from './layouts/SecretariaLayout';
import { AdminAppLayout } from './layouts/AdminAppLayout';
import { ModeradorLayout } from './layouts/ModeradorLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { NewReportPage } from './pages/NewReportPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { RelatosPage } from './pages/admin/RelatosPage';
import { AdministracaoPage } from './pages/admin/AdministracaoPage';
import { BairrosPage } from './pages/admin/BairrosPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { DashboardSecretariaPage } from './pages/secretaria/DashboardSecretariaPage';
import { RelatosSecretariaPage } from './pages/secretaria/RelatosSecretariaPage';
import { PerfilSecretariaPage } from './pages/secretaria/PerfilSecretariaPage';
import { UsuariosSecretariaPage } from './pages/secretaria/UsuariosSecretariaPage';
import { VisaoGeralPage } from './pages/adminapp/VisaoGeralPage';
import { OrganizacoesPage } from './pages/adminapp/OrganizacoesPage';
import { UsuariosPage } from './pages/adminapp/UsuariosPage';
import { VinculosPage } from './pages/adminapp/VinculosPage';
import { CategoriasPage } from './pages/adminapp/CategoriasPage';
import { ModeracaoPage } from './pages/adminapp/ModeracaoPage';
import { AuditoriaPage } from './pages/adminapp/AuditoriaPage';
import { ModeradorPage } from './pages/moderador/ModeradorPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
      <Routes>
        {/* Auth pages - standalone */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
        <Route path="/verificar-email" element={<VerifyEmailPage />} />

        {/* Main app routes with layout - Morador only */}
        <Route element={<MainLayout />}>
          <Route path="/feed" element={
            <RouteGuard allowedRoles={['morador']}>
              <HomePage />
            </RouteGuard>
          } />
          <Route path="/mapa" element={
            <RouteGuard allowedRoles={['morador']}>
              <MapPage />
            </RouteGuard>
          } />
          <Route path="/minhas" element={
            <RouteGuard allowedRoles={['morador']}>
              <MyReportsPage />
            </RouteGuard>
          } />
          <Route path="/perfil" element={
            <RouteGuard allowedRoles={['morador']}>
              <ProfilePage />
            </RouteGuard>
          } />
          <Route path="/relato/:id" element={
            <RouteGuard allowedRoles={['morador']}>
              <ReportDetailPage />
            </RouteGuard>
          } />
        </Route>

        {/* New report - full screen, no layout - Morador only */}
        <Route path="/novo-relato" element={
          <RouteGuard allowedRoles={['morador']}>
            <NewReportPage />
          </RouteGuard>
        } />

        {/* Admin routes with admin layout - Prefeitura only */}
        <Route element={<AdminLayout />}>
          <Route path="/prefeitura" element={<Navigate to="/prefeitura/dashboard" replace />} />
          <Route path="/prefeitura/dashboard" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <DashboardPage />
            </RouteGuard>
          } />
          <Route path="/prefeitura/relatos" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <RelatosPage />
            </RouteGuard>
          } />
          <Route path="/prefeitura/relato/:id" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <ReportDetailPage />
            </RouteGuard>
          } />
          <Route path="/prefeitura/administracao" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <AdministracaoPage />
            </RouteGuard>
          } />
          <Route path="/prefeitura/bairros" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <BairrosPage />
            </RouteGuard>
          } />
          <Route path="/prefeitura/prefeituraistracao" element={<Navigate to="/prefeitura/administracao" replace />} />
          <Route path="/prefeitura/analytics" element={<Navigate to="/prefeitura/dashboard" replace />} />
          <Route path="/prefeitura/perfil" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <AdminProfilePage />
            </RouteGuard>
          } />
        </Route>

        {/* Secretaria routes with secretaria layout - Secretaria only */}
        <Route element={<SecretariaLayout />}>
          <Route path="/secretaria" element={<Navigate to="/secretaria/dashboard" replace />} />
          <Route path="/secretaria/dashboard" element={
            <RouteGuard allowedRoles={['secretaria']}>
              <DashboardSecretariaPage />
            </RouteGuard>
          } />
          <Route path="/secretaria/relatos" element={
            <RouteGuard allowedRoles={['secretaria']}>
              <RelatosSecretariaPage />
            </RouteGuard>
          } />
          <Route path="/secretaria/relato/:id" element={
            <RouteGuard allowedRoles={['secretaria']}>
              <ReportDetailPage />
            </RouteGuard>
          } />
          <Route path="/secretaria/perfil" element={
            <RouteGuard allowedRoles={['secretaria']}>
              <PerfilSecretariaPage />
            </RouteGuard>
          } />
          <Route path="/secretaria/usuarios" element={
            <RouteGuard allowedRoles={['secretaria']}>
              <UsuariosSecretariaPage />
            </RouteGuard>
          } />
        </Route>

        {/* Moderador routes with moderador layout - Moderador only */}
        <Route element={<ModeradorLayout />}>
          <Route path="/moderador" element={<Navigate to="/moderador/painel" replace />} />
          <Route path="/moderador/painel" element={
            <RouteGuard allowedRoles={['moderador']}>
              <ModeradorPage />
            </RouteGuard>
          } />
          <Route path="/moderador/relato/:id" element={
            <RouteGuard allowedRoles={['moderador']}>
              <ReportDetailPage />
            </RouteGuard>
          } />
        </Route>

        {/* Admin App routes with admin app layout - Admin App only */}
        <Route element={<AdminAppLayout />}>
          <Route path="/admin-app" element={<Navigate to="/admin-app/visao-geral" replace />} />
          <Route path="/admin-app/visao-geral" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <VisaoGeralPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/organizacoes" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <OrganizacoesPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/usuarios" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <UsuariosPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/vinculos" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <VinculosPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/categorias" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <CategoriasPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/moderacao" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <ModeracaoPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/relato/:id" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <ReportDetailPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/auditoria" element={
            <RouteGuard allowedRoles={['admin_app']}>
              <AuditoriaPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/operacional" element={<Navigate to="/admin-app/visao-geral" replace />} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  );
}
