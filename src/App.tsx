import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { FeatureProvider } from './contexts/FeatureContext';
import { Layout } from './components/Layout';
import { AIAssistant } from './components/AIAssistant';
import { ScrollToTop } from './components/ScrollToTop';

// Lazy load pages for performance (Code Splitting)
const NationalHome = lazy(() => import('./pages/NationalHome').then(m => ({ default: m.NationalHome })));
const NationalServices = lazy(() => import('./pages/NationalServices').then(m => ({ default: m.NationalServices })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const LocalHome = lazy(() => import('./pages/LocalHome').then(m => ({ default: m.LocalHome })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Services = lazy(() => import('./pages/Services').then(m => ({ default: m.Services })));
const SuiviDossier = lazy(() => import('./pages/SuiviDossier').then(m => ({ default: m.SuiviDossier })));
const Simulateur = lazy(() => import('./pages/Simulateur').then(m => ({ default: m.Simulateur })));
const Actualites = lazy(() => import('./pages/Actualites').then(m => ({ default: m.Actualites })));
const Sondages = lazy(() => import('./pages/Sondages').then(m => ({ default: m.Sondages })));
const Signalement = lazy(() => import('./pages/Signalement').then(m => ({ default: m.Signalement })));
const Stade = lazy(() => import('./pages/Stade').then(m => ({ default: m.Stade })));
const Artisans = lazy(() => import('./pages/Artisans').then(m => ({ default: m.Artisans })));
const Conseil = lazy(() => import('./pages/Conseil').then(m => ({ default: m.Conseil })));
const Arrondissements = lazy(() => import('./pages/Arrondissements').then(m => ({ default: m.Arrondissements })));
const Maire = lazy(() => import('./pages/Maire').then(m => ({ default: m.Maire })));
const RendezVous = lazy(() => import('./pages/RendezVous').then(m => ({ default: m.RendezVous })));
const Carte = lazy(() => import('./pages/Carte').then(m => ({ default: m.Carte })));
const Publications = lazy(() => import('./pages/Publications').then(m => ({ default: m.Publications })));
const AdminPortal = lazy(() => import('./pages/AdminPortal').then(m => ({ default: m.AdminPortal })));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const CitizenSpace = lazy(() => import('./pages/CitizenSpace').then(m => ({ default: m.CitizenSpace })));
const SystemSetup = lazy(() => import('./pages/SystemSetup').then(m => ({ default: m.SystemSetup })));
const Histoire = lazy(() => import('./pages/Histoire').then(m => ({ default: m.Histoire })));
const Tourisme = lazy(() => import('./pages/Tourisme').then(m => ({ default: m.Tourisme })));
const Formulaires = lazy(() => import('./pages/Formulaires').then(m => ({ default: m.Formulaires })));
const Economie = lazy(() => import('./pages/Economie').then(m => ({ default: m.Economie })));
const Opportunities = lazy(() => import('./pages/Opportunities').then(m => ({ default: m.Opportunities })));
const Agenda = lazy(() => import('./pages/Agenda').then(m => ({ default: m.Agenda })));
const BudgetParticipatif = lazy(() => import('./pages/BudgetParticipatif').then(m => ({ default: m.BudgetParticipatif })));
const OpenData = lazy(() => import('./pages/OpenData').then(m => ({ default: m.OpenData })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));

const MinisterialDashboard = lazy(() => import('./pages/MinisterialDashboard').then(m => ({ default: m.MinisterialDashboard })));

const NotFound = () => (
  <Layout>
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <h1 className="text-9xl font-black text-gray-200">404</h1>
      <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Page non trouvée</p>
    </div>
  </Layout>
);

// Wrapper to handle tenant loading by slug
const TenantWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { slug } = useParams<{ slug: string }>();
  const { setTenantBySlug, loading, error } = useTenant();

  useEffect(() => {
    if (slug) {
      setTenantBySlug(slug);
    }
  }, [slug]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 space-y-4 transition-colors">
      <div className="w-10 h-10 border-4 border-[#008751] border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chargement de la commune...</span>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-gray-900 space-y-4 transition-colors">
      <div className="text-red-500 font-black text-3xl">!</div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Erreur: {error}</span>
    </div>
  );

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </Layout>
  );
};

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-24 space-y-4">
    <div className="w-10 h-10 border-4 border-[#008751] border-t-transparent rounded-full animate-spin" />
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chargement...</span>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
  requireTenant?: boolean;
}> = ({ children, allowedRoles, requireTenant }) => {
  const { profile, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/auth/login');
    } else if (!authLoading && profile && allowedRoles && !allowedRoles.includes(profile.role)) {
      navigate('/');
    }
  }, [profile, authLoading, allowedRoles, navigate]);

  if (authLoading || (requireTenant && tenantLoading)) return <PageLoader />;
  if (!profile) return null;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return null;
  if (requireTenant && !tenant) return <NotFound />;

  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TenantProvider>
          <FeatureProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* National Portal */}
                  <Route path="/" element={<Layout><NationalHome /></Layout>} />
                  <Route path="/services" element={<Layout><NationalServices /></Layout>} />
                  <Route path="/about" element={<Layout><About /></Layout>} />
                  <Route path="/actualites" element={<Layout><Actualites /></Layout>} />
                  <Route path="/mon-espace" element={<Layout><CitizenSpace /></Layout>} />
                  
                  {/* Auth */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />

                  {/* Local Portal Routes */}
                  <Route path="/:slug" element={<TenantWrapper><LocalHome /></TenantWrapper>} />
                  <Route path="/:slug/maire" element={<TenantWrapper><Maire /></TenantWrapper>} />
                  <Route path="/:slug/conseil" element={<TenantWrapper><Conseil /></TenantWrapper>} />
                  <Route path="/:slug/arrondissements" element={<TenantWrapper><Arrondissements /></TenantWrapper>} />
                  <Route path="/:slug/services" element={<TenantWrapper><Services /></TenantWrapper>} />
                  <Route path="/:slug/suivi-dossier" element={<TenantWrapper><SuiviDossier /></TenantWrapper>} />
                  <Route path="/:slug/simulateur" element={<TenantWrapper><Simulateur /></TenantWrapper>} />
                  <Route path="/:slug/actualites" element={<TenantWrapper><Actualites /></TenantWrapper>} />
                  <Route path="/:slug/sondages" element={<TenantWrapper><Sondages /></TenantWrapper>} />
                  <Route path="/:slug/signalement" element={<TenantWrapper><Signalement /></TenantWrapper>} />
                  <Route path="/:slug/stade" element={<TenantWrapper><Stade /></TenantWrapper>} />
                  <Route path="/:slug/artisans" element={<TenantWrapper><Artisans /></TenantWrapper>} />
                  <Route path="/:slug/rendezvous" element={<TenantWrapper><RendezVous /></TenantWrapper>} />
                  <Route path="/:slug/carte" element={<TenantWrapper><Carte /></TenantWrapper>} />
                  <Route path="/:slug/publications" element={<TenantWrapper><Publications /></TenantWrapper>} />
                  <Route path="/:slug/histoire" element={<TenantWrapper><Histoire /></TenantWrapper>} />
                  <Route path="/:slug/tourisme" element={<TenantWrapper><Tourisme /></TenantWrapper>} />
                  <Route path="/:slug/formulaires" element={<TenantWrapper><Formulaires /></TenantWrapper>} />
                  <Route path="/:slug/economie" element={<TenantWrapper><Economie /></TenantWrapper>} />
                  <Route path="/:slug/opportunites" element={<TenantWrapper><Opportunities /></TenantWrapper>} />
                  <Route path="/:slug/agenda" element={<TenantWrapper><Agenda /></TenantWrapper>} />
                  <Route path="/:slug/budget-participatif" element={<TenantWrapper><BudgetParticipatif /></TenantWrapper>} />
                  <Route path="/:slug/open-data" element={<TenantWrapper><OpenData /></TenantWrapper>} />
                  <Route path="/:slug/contact" element={<TenantWrapper><Contact /></TenantWrapper>} />
                  
                  {/* Admin Routes - Protected */}
                  <Route path="/:slug/admin-portal" element={
                    <TenantWrapper>
                      <ProtectedRoute allowedRoles={['admin', 'agent', 'super_admin']} requireTenant={true}>
                        <AdminPortal />
                      </ProtectedRoute>
                    </TenantWrapper>
                  } />
                  
                  <Route path="/:slug/super-admin" element={
                    <TenantWrapper>
                      <ProtectedRoute allowedRoles={['super_admin']} requireTenant={true}>
                        <SuperAdminDashboard />
                      </ProtectedRoute>
                    </TenantWrapper>
                  } />
                  
                  <Route path="/:slug/system-setup" element={
                    <TenantWrapper>
                      <SystemSetup />
                    </TenantWrapper>
                  } />
                  
                  <Route path="/ministere" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <Layout><MinisterialDashboard /></Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <AIAssistant />
            </Router>
          </FeatureProvider>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
