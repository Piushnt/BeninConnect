import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  Menu, X, Sun, Moon, LayoutDashboard, FileText, ImageIcon, Megaphone,
  MessageSquare, AlertCircle, Database, Vote, MapPin, Store, Building2,
  ShieldCheck, Map as MapIcon, Users, Eye, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

// Existing Modules (unchanged paths)
import { MarketModule } from './MarketModule';
import { LandModule } from './LandModule';
import { TransportModule } from './TransportModule';
import { ArrondissementModule } from './ArrondissementModule';
import { AgendaFlashModule } from '../features/admin/AgendaFlashModule';
import { SondageModule } from '../features/admin/SondageModule';
import { CMSModule } from '../features/admin/CMSModule';

// New Extracted Tabs
import { DashboardTab } from '../features/admin/tabs/DashboardTab';
import { DossiersTab } from '../features/admin/tabs/DossiersTab';
import { NewsTab } from '../features/admin/tabs/NewsTab';
import { SignalementsTab } from '../features/admin/tabs/SignalementsTab';
import { UsersTab } from '../features/admin/tabs/UsersTab';
import { AnnouncementsTab } from '../features/admin/tabs/AnnouncementsTab';
import { ServicesTab } from '../features/admin/tabs/ServicesTab';
import { ConfigTab } from '../features/admin/tabs/ConfigTab';
import { MarketTab } from '../features/admin/tabs/MarketTab';

export const AdminPortal: React.FC = () => {
  const { tenant } = useTenant();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin' && profile.role !== 'ca_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black uppercase tracking-tight dark:text-white">Accès Refusé</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Vous n'avez pas les permissions pour accéder à ce portail.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      // General
      case 'dashboard': return <DashboardTab />;
      case 'dossiers': return <DossiersTab />;
      case 'news': return <NewsTab />;
      case 'signalements': return <SignalementsTab />;
      case 'users': return <UsersTab />;
      case 'announcements': return <AnnouncementsTab />;
      case 'services': return <ServicesTab />;
      case 'config': return <ConfigTab />;
      
      // Existing Modules
      case 'social': return <AgendaFlashModule />;
      case 'engagement': return <SondageModule />;
      case 'content': return <CMSModule />;
      case 'market': return <MarketTab />;
      case 'land': return <LandModule isAdmin={true} />;
      case 'transport': return <TransportModule isAdmin={true} />;
      case 'arrondissement': return <ArrondissementModule />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] transition-colors duration-300 relative overflow-hidden font-sans">
      <Helmet>
        <title>Console Admin | {tenant?.name || 'Bénin Connect'}</title>
        <meta name="description" content={`Gestion administrative de la commune de ${tenant?.name}`} />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">{tenant?.name}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex relative z-10">
        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
             <>
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" 
               />
               <motion.aside 
                 initial={{ x: '-100%' }}
                 animate={{ x: 0 }}
                 exit={{ x: '-100%' }}
                 className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-950 z-[70] p-6 lg:hidden flex flex-col shadow-2xl"
               >
                 <SideNavContent activeTab={activeTab} setActiveTab={(tab: string) => { setActiveTab(tab); setIsMobileMenuOpen(false); }} profile={profile} />
               </motion.aside>
             </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <aside className="w-72 h-[calc(100vh-48px)] sticky top-6 ml-6 my-6 bg-white/40 dark:bg-[#131B2B]/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 p-8 hidden lg:flex flex-col shadow-2xl rounded-[40px] overflow-hidden transition-all">
           <SideNavContent activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
        </aside>

        {/* Main Workspace */}
        <main className="flex-grow p-4 lg:p-12 max-w-[1500px] mx-auto space-y-12 h-screen overflow-y-auto no-scrollbar">
          {/* Top Control Bar */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                {activeTab === 'dashboard' ? 'Tableau de bord' : activeTab.replace('-', ' ')}
              </h1>
              <div className="flex items-center gap-4">
                <div className="h-1.5 w-16 bg-[#008751] rounded-full" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Mairie de {tenant?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="w-12 h-12 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:scale-110 transition-all shadow-xl"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="h-12 w-px bg-gray-200 dark:bg-white/10 mx-2" />
              <div className="flex items-center gap-4 px-5 py-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl shadow-xl">
                 <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs uppercase">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                 </div>
                 <div className="hidden sm:flex flex-col">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{profile?.full_name || user?.email}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{profile?.role}</span>
                 </div>
              </div>
            </div>
          </header>

          {/* Render Extracted Tabs */}
          {renderTabContent()}

        </main>
      </div>
    </div>
  );
};

const SideNavContent = ({ activeTab, setActiveTab, profile }: any) => {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  
  const navItems = [
    { title: 'Principal', items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'dossiers', label: 'Dossiers', icon: FileText },
      { id: 'news', label: 'Actualités', icon: ImageIcon },
      { id: 'announcements', label: 'Annonces', icon: Megaphone },
      { id: 'social', label: 'Communication', icon: MessageSquare },
      { id: 'signalements', label: 'Signalements', icon: AlertCircle },
    ]},
    { title: 'Services & Engagement', items: [
      { id: 'services', label: 'Catalogue', icon: Database },
      { id: 'engagement', label: 'Engagement', icon: Vote },
      { id: 'locations', label: 'Carte', icon: MapPin },
    ]},
    { title: 'Modules Spécifiques', items: [
      { id: 'market', label: 'Marché', icon: Store },
      { id: 'land', label: 'Foncier', icon: Building2 },
      { id: 'transport', label: 'Transport', icon: ShieldCheck },
      { id: 'arrondissement', label: 'Arrondi.', icon: MapIcon },
    ]},
    { title: 'Administration', items: [
      { id: 'users', label: 'Utilisateurs', icon: Users },
      { id: 'content', label: 'Pages', icon: Eye },
      { id: 'config', label: 'Réglages', icon: Settings },
    ]}
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-gradient-to-br from-[#008751] to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-xl">
          <Building2 className="w-6 h-6" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] font-black text-[#008751] uppercase tracking-[0.3em] leading-tight mb-1 truncate">{tenant?.name}</span>
          <span className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Console</span>
        </div>
      </div>

      <nav className="space-y-8 flex-grow overflow-y-auto no-scrollbar pr-2">
        {navItems.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="px-6 text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] font-mono">{group.title}</h4>
            <div className="space-y-1">
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                    activeTab === item.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-4 h-4 transition-transform duration-500", activeTab === item.id && "scale-110")} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {profile?.role === 'super_admin' && (
          <button
            onClick={() => navigate('/super-admin')}
            className="w-full mt-4 flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-gray-900 text-white shadow-xl group border border-white/10"
          >
            <ShieldCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Super Admin
          </button>
        )}
      </nav>
    </div>
  );
};

export default AdminPortal;
