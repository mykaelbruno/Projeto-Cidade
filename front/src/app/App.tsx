import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Suspense, lazy } from 'react';
import { UserProvider } from './contexts/UserContext';
import { RouteGuard } from './components/RouteGuard';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { SecretariaLayout } from './layouts/SecretariaLayout';
import { AdminAppLayout } from './layouts/AdminAppLayout';
import { ModeradorLayout } from './layouts/ModeradorLayout';

const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })));
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })));
const NewReportPage = lazy(() => import('./pages/NewReportPage').then((module) => ({ default: module.NewReportPage })));
const MyReportsPage = lazy(() => import('./pages/MyReportsPage').then((module) => ({ default: module.MyReportsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const ReportDetailPage = lazy(() => import('./pages/ReportDetailPage').then((module) => ({ default: module.ReportDetailPage })));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const RelatosPage = lazy(() => import('./pages/admin/RelatosPage').then((module) => ({ default: module.RelatosPage })));
const AdministracaoPage = lazy(() => import('./pages/admin/AdministracaoPage').then((module) => ({ default: module.AdministracaoPage })));
const BairrosPage = lazy(() => import('./pages/admin/BairrosPage').then((module) => ({ default: module.BairrosPage })));
const AuditoriaPrefeituraPage = lazy(() => import('./pages/admin/AuditoriaPrefeituraPage').then((module) => ({ default: module.AuditoriaPrefeituraPage })));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage').then((module) => ({ default: module.AdminProfilePage })));
const DashboardSecretariaPage = lazy(() => import('./pages/secretaria/DashboardSecretariaPage').then((module) => ({ default: module.DashboardSecretariaPage })));
const RelatosSecretariaPage = lazy(() => import('./pages/secretaria/RelatosSecretariaPage').then((module) => ({ default: module.RelatosSecretariaPage })));
const PerfilSecretariaPage = lazy(() => import('./pages/secretaria/PerfilSecretariaPage').then((module) => ({ default: module.PerfilSecretariaPage })));
const UsuariosSecretariaPage = lazy(() => import('./pages/secretaria/UsuariosSecretariaPage').then((module) => ({ default: module.UsuariosSecretariaPage })));
const VisaoGeralPage = lazy(() => import('./pages/adminapp/VisaoGeralPage').then((module) => ({ default: module.VisaoGeralPage })));
const OrganizacoesPage = lazy(() => import('./pages/adminapp/OrganizacoesPage').then((module) => ({ default: module.OrganizacoesPage })));
const UsuariosPage = lazy(() => import('./pages/adminapp/UsuariosPage').then((module) => ({ default: module.UsuariosPage })));
const VinculosPage = lazy(() => import('./pages/adminapp/VinculosPage').then((module) => ({ default: module.VinculosPage })));
const CategoriasPage = lazy(() => import('./pages/adminapp/CategoriasPage').then((module) => ({ default: module.CategoriasPage })));
const ModeracaoPage = lazy(() => import('./pages/adminapp/ModeracaoPage').then((module) => ({ default: module.ModeracaoPage })));
const AuditoriaPage = lazy(() => import('./pages/adminapp/AuditoriaPage').then((module) => ({ default: module.AuditoriaPage })));
const ModeradorPage = lazy(() => import('./pages/moderador/ModeradorPage').then((module) => ({ default: module.ModeradorPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

function PageLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
      Carregando...
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoadingFallback />}>
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
          <Route path="/prefeitura/auditoria" element={
            <RouteGuard allowedRoles={['prefeitura']}>
              <AuditoriaPrefeituraPage />
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
            <RouteGuard allowedRoles={['admin']}>
              <VisaoGeralPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/organizacoes" element={
            <RouteGuard allowedRoles={['admin']}>
              <OrganizacoesPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/usuarios" element={
            <RouteGuard allowedRoles={['admin']}>
              <UsuariosPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/vinculos" element={
            <RouteGuard allowedRoles={['admin']}>
              <VinculosPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/categorias" element={
            <RouteGuard allowedRoles={['admin']}>
              <CategoriasPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/moderacao" element={
            <RouteGuard allowedRoles={['admin']}>
              <ModeracaoPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/relato/:id" element={
            <RouteGuard allowedRoles={['admin']}>
              <ReportDetailPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/auditoria" element={
            <RouteGuard allowedRoles={['admin']}>
              <AuditoriaPage />
            </RouteGuard>
          } />
          <Route path="/admin-app/operacional" element={<Navigate to="/admin-app/visao-geral" replace />} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </UserProvider>
  );
}
