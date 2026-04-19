import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
const Annonces = lazy(() => import('./pages/Annonces').then(m => ({ default: m.Annonces })));
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

const MarketModule = lazy(() => import('./pages/MarketModule').then(m => ({ default: m.MarketModule })));
const LandModule = lazy(() => import('./pages/LandModule').then(m => ({ default: m.LandModule })));
const TransportModule = lazy(() => import('./pages/TransportModule').then(m => ({ default: m.TransportModule })));
const ArrondissementModule = lazy(() => import('./pages/ArrondissementModule').then(m => ({ default: m.ArrondissementModule })));

const VerifyIdentity = lazy(() => import('./pages/VerifyIdentity').then(m => ({ default: m.VerifyIdentity })));
const MinisterialDashboard = lazy(() => import('./pages/MinisterialDashboard').then(m => ({ default: m.MinisterialDashboard })));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const PendingApproval = lazy(() => import('./pages/PendingApproval').then(m => ({ default: m.PendingApproval })));

const NotFound = () => (
  <Layout>
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <h1 className="text-9xl font-black text-gray-200">404</h1>
      <p className="text-xl font-bold text-gray-500 uppercase tracking-widest">Page non trouvée</p>
    </div>
  </Layout>
);

// Utilitaires de Sous-Domaine
const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return null;
  }
  
  const nationalDomains = ['beninconnect.vercel.app', 'emairie.bj', 'www.emairie.bj'];
  if (nationalDomains.includes(hostname)) {
    return null; // Portail national
  }

  if (hostname.endsWith('.vercel.app')) {
    const sub = hostname.replace('.vercel.app', '');
    if (sub.endsWith('.beninconnect')) {
       return sub.replace('.beninconnect', '');
    }
    return sub !== 'beninconnect' ? sub : null;
  }

  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }
  
  return null;
};

// Wrapper to handle tenant loading by slug
const TenantWrapper: React.FC<{ children: React.ReactNode, fixedSlug?: string | null }> = ({ children, fixedSlug }) => {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const slug = fixedSlug || urlSlug;
  const { setTenantBySlug, loading, error, tenant } = useTenant();

  useEffect(() => {
    if (slug && (!tenant || tenant.slug !== slug)) {
      setTenantBySlug(slug);
    }
  }, [slug, tenant]);

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    },
  },
});

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
  requireTenant?: boolean;
}> = ({ children, allowedRoles, requireTenant }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth/login');
      } else if (user && !user.email_confirmed_at) {
        navigate('/auth/verify-email');
      } else if (!profile) {
        navigate('/auth/login');
      } else if (allowedRoles && !allowedRoles.includes(profile.role)) {
        navigate('/');
      } else {
        const isSuperAdmin = profile.role === 'super_admin' || profile.role === 'super-admin';
        const needsApprovalRoles = ['admin', 'ca_admin', 'agent'];
        if (needsApprovalRoles.includes(profile.role) && !profile.is_approved && location.pathname.includes('admin-portal')) {
          navigate('/pending-approval');
          return;
        }

        if (requireTenant && tenant) {
          // Isolation logic: Si pas super admin, on force l'accès à son propre tenant uniquement
          if (!isSuperAdmin && profile.tenant_id && profile.tenant_id !== tenant.id) {
            navigate('/');
          }
        }
      }
    }
  }, [user, profile, authLoading, allowedRoles, navigate, tenant, requireTenant, location.pathname]);

  if (authLoading || (requireTenant && tenantLoading)) return <PageLoader />;
  if (!user || (user && !user.email_confirmed_at)) return null;
  if (!profile) return null;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return null;
  if (requireTenant && !tenant) return <NotFound />;

  return <>{children}</>;
};

export default function App() {
  const currentSubdomain = getSubdomain();
  const tenantBasePath = currentSubdomain ? '/' : '/:slug';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
        <TenantProvider>
          <FeatureProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* National Portal - Uniquement monté si pas de sous-domaine ou localhost */}
                  {(!currentSubdomain) && (
                    <>
                      <Route path="/" element={<Layout><NationalHome /></Layout>} />
                      <Route path="/services" element={<Layout><NationalServices /></Layout>} />
                      <Route path="/about" element={<Layout><About /></Layout>} />
                      <Route path="/actualites" element={<Layout><Actualites /></Layout>} />
                      <Route path="/mon-espace" element={<Layout><CitizenSpace /></Layout>} />
                    </>
                  )}
                  
                  {/* Auth */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/verify-email" element={<VerifyEmail />} />
                  <Route path="/pending-approval" element={<PendingApproval />} />

                  {/* Local Portal Routes - Dynamic Base Path */}
                  <Route path={tenantBasePath}>
                    <Route index element={<TenantWrapper fixedSlug={currentSubdomain}><LocalHome /></TenantWrapper>} />
                    <Route path="maire" element={<TenantWrapper fixedSlug={currentSubdomain}><Maire /></TenantWrapper>} />
                    <Route path="conseil" element={<TenantWrapper fixedSlug={currentSubdomain}><Conseil /></TenantWrapper>} />
                    <Route path="arrondissements" element={<TenantWrapper fixedSlug={currentSubdomain}><Arrondissements /></TenantWrapper>} />
                    <Route path="services" element={<TenantWrapper fixedSlug={currentSubdomain}><Services /></TenantWrapper>} />
                    <Route path="suivi-dossier" element={<TenantWrapper fixedSlug={currentSubdomain}><SuiviDossier /></TenantWrapper>} />
                    <Route path="simulateur" element={<TenantWrapper fixedSlug={currentSubdomain}><Simulateur /></TenantWrapper>} />
                    <Route path="actualites" element={<TenantWrapper fixedSlug={currentSubdomain}><Actualites /></TenantWrapper>} />
                    <Route path="annonces" element={<TenantWrapper fixedSlug={currentSubdomain}><Annonces /></TenantWrapper>} />
                    <Route path="sondages" element={<TenantWrapper fixedSlug={currentSubdomain}><Sondages /></TenantWrapper>} />
                    <Route path="signalement" element={<TenantWrapper fixedSlug={currentSubdomain}><Signalement /></TenantWrapper>} />
                    <Route path="stade" element={<TenantWrapper fixedSlug={currentSubdomain}><Stade /></TenantWrapper>} />
                    <Route path="artisans" element={<TenantWrapper fixedSlug={currentSubdomain}><Artisans /></TenantWrapper>} />
                    <Route path="rendezvous" element={<TenantWrapper fixedSlug={currentSubdomain}><RendezVous /></TenantWrapper>} />
                    <Route path="carte" element={<TenantWrapper fixedSlug={currentSubdomain}><Carte /></TenantWrapper>} />
                    <Route path="publications" element={<TenantWrapper fixedSlug={currentSubdomain}><Publications /></TenantWrapper>} />
                    <Route path="histoire" element={<TenantWrapper fixedSlug={currentSubdomain}><Histoire /></TenantWrapper>} />
                    <Route path="tourisme" element={<TenantWrapper fixedSlug={currentSubdomain}><Tourisme /></TenantWrapper>} />
                    <Route path="formulaires" element={<TenantWrapper fixedSlug={currentSubdomain}><Formulaires /></TenantWrapper>} />
                    <Route path="economie" element={<TenantWrapper fixedSlug={currentSubdomain}><Economie /></TenantWrapper>} />
                    <Route path="opportunites" element={<TenantWrapper fixedSlug={currentSubdomain}><Opportunities /></TenantWrapper>} />
                    <Route path="agenda" element={<TenantWrapper fixedSlug={currentSubdomain}><Agenda /></TenantWrapper>} />
                    <Route path="budget-participatif" element={<TenantWrapper fixedSlug={currentSubdomain}><BudgetParticipatif /></TenantWrapper>} />
                    <Route path="open-data" element={<TenantWrapper fixedSlug={currentSubdomain}><OpenData /></TenantWrapper>} />
                    <Route path="contact" element={<TenantWrapper fixedSlug={currentSubdomain}><Contact /></TenantWrapper>} />

                    {/* Metropolitan Modules - Citizen Side */}
                    <Route path="services/mon-marche" element={<TenantWrapper fixedSlug={currentSubdomain}><MarketModule isAdmin={false} /></TenantWrapper>} />
                    <Route path="services/foncier" element={<TenantWrapper fixedSlug={currentSubdomain}><LandModule isAdmin={false} /></TenantWrapper>} />
                    <Route path="services/transport" element={<TenantWrapper fixedSlug={currentSubdomain}><TransportModule isAdmin={false} /></TenantWrapper>} />
                    <Route path="services/arrondissement" element={<TenantWrapper fixedSlug={currentSubdomain}><ArrondissementModule /></TenantWrapper>} />

                    {/* Admin Routes - Protected */}
                    <Route path="admin-portal" element={
                      <TenantWrapper fixedSlug={currentSubdomain}>
                        <ProtectedRoute allowedRoles={['admin', 'agent', 'super_admin', 'ca_admin']} requireTenant={true}>
                          <AdminPortal />
                        </ProtectedRoute>
                      </TenantWrapper>
                    } />
                    
                    <Route path="super-admin" element={
                      <TenantWrapper fixedSlug={currentSubdomain}>
                        <ProtectedRoute allowedRoles={['super_admin']} requireTenant={true}>
                          <SuperAdminDashboard />
                        </ProtectedRoute>
                      </TenantWrapper>
                    } />
                    
                    <Route path="system-setup" element={
                      <TenantWrapper fixedSlug={currentSubdomain}>
                        <ProtectedRoute allowedRoles={['super_admin']} requireTenant={true}>
                          <SystemSetup />
                        </ProtectedRoute>
                      </TenantWrapper>
                    } />
                  </Route>
                  
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
    </QueryClientProvider>
  );
}
