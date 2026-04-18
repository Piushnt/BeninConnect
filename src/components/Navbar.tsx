import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Moon, Sun, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { SubscriptionManager } from './SubscriptionManager';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { BRANDING } from '../constants';

export const Navbar: React.FC = () => {
  const { tenant, isNational } = useTenant();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { slug } = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCivilRegistryEnabled, setIsCivilRegistryEnabled] = useState(false);
  const location = useLocation();

  // Mode Administration (Cache les menus superflus pour éviter la superposition)
  const isAdminView = location.pathname.includes('/admin-portal') || 
                      location.pathname.includes('/super-admin') || 
                      location.pathname.includes('/ministere') ||
                      location.pathname.includes('/system-setup');

  useEffect(() => {
    if (tenant) {
      checkFeatures();
    }
  }, [tenant]);

  const checkFeatures = async () => {
    const { data } = await supabase
      .from('tenant_features')
      .select(`
        is_enabled,
        features!inner (
          key
        )
      `)
      .eq('tenant_id', tenant?.id)
      .eq('features.key', 'civil_registry')
      .maybeSingle(); // maybeSingle() au lieu de single() pour éviter le 406 si la feature n'existe pas encore
    
    setIsCivilRegistryEnabled(!!(data as any)?.is_enabled);
  };

  const primaryColor = tenant?.theme_config.primaryColor || '#004d2c';

  const navLinks = [
    { label: 'Accueil', path: slug ? `/${slug}` : '/' },
    { 
      label: 'La Mairie', 
      children: [
        { label: 'Le Maire', path: `/${slug}/maire` },
        { label: 'Le Conseil', path: `/${slug}/conseil` },
        { label: 'Carte interactive', path: `/${slug}/carte` },
        { label: 'Arrondissements', path: `/${slug}/arrondissements` },
        { label: 'Histoire & Culture', path: `/${slug}/histoire` },
        { label: 'Transparence', path: `/${slug}/publications` },
        { label: 'Observatoire (Open Data)', path: `/${slug}/open-data` },
      ]
    },
    { 
      label: 'Services', 
      children: [
        { label: 'État Civil', path: `/${slug}/services?category=État Civil` },
        { label: 'Suivi de Dossier', path: `/${slug}/suivi-dossier` },
        { label: 'Formulaires', path: `/${slug}/formulaires` },
        { label: 'Urbanisme', path: `/${slug}/services?category=Urbanisme` },
        { label: 'Simulateur Fiscal', path: `/${slug}/simulateur` },
        { label: 'Prise de RDV', path: `/${slug}/rendezvous` },
      ]
    },
    { 
      label: 'Économie', 
      children: [
        { label: 'Marchés Locaux', path: `/${slug}/economie` },
        { label: 'Annuaire Artisans', path: `/${slug}/artisans` },
        { label: 'Opportunités', path: `/${slug}/opportunites` },
      ]
    },
    { 
      label: 'Citoyenneté', 
      children: [
        { label: 'Sondages', path: `/${slug}/sondages` },
        { label: 'Budget Participatif', path: `/${slug}/budget-participatif` },
        { label: 'Signalement', path: `/${slug}/signalement` },
      ]
    },
    { 
      label: 'Loisirs', 
      children: [
        { label: 'Agenda', path: `/${slug}/agenda` },
        { label: 'Stade Municipal', path: `/${slug}/stade` },
        { label: 'Guide Touristique', path: `/${slug}/tourisme` },
      ]
    },
    { label: 'Actualités', path: slug ? `/${slug}/actualites` : '/actualites' },
    { label: 'Contact', path: `/${slug}/contact` },
  ];

  const nationalLinks = [
    { label: 'Accueil', path: '/' },
    { label: 'Services Publics', path: '/services' },
    { label: 'Actualités Nationales', path: '/actualites' },
    { label: 'À propos', path: '/about' },
  ];

  const links = isNational ? nationalLinks : navLinks;

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-gray-900 border-b border-gray-800 shadow-sm transition-colors duration-300">
        {/* Top Bar (Government Branding) */}
        <div className="bg-[#004d2c] text-white py-1.5 px-4 text-[10px] uppercase tracking-[0.2em] font-black flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-4">
            <img src={BRANDING.NATIONAL.COAT_OF_ARMS} className="h-4 w-auto brightness-0 invert" alt="Benin" />
            <span>{BRANDING.NATIONAL.NAME}</span>
          </div>
          <div className="hidden sm:flex gap-6">
            <Link to="/" className="hover:text-[#EBB700] transition-colors">Portail National</Link>
            <Link to="/mon-espace" className="hover:text-[#EBB700] transition-colors">Mon Espace</Link>
          </div>
        </div>

        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo & Name */}
            <div className="flex items-center">
              <Link to={slug ? `/${slug}` : '/'} className="flex items-center gap-4 group">
                <div className="relative">
                  <img 
                    src={tenant?.logo_url || BRANDING.NATIONAL.LOGO_PRIMARY} 
                    alt="Logo" 
                    className="h-12 w-auto transition-transform group-hover:scale-105 rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  {!isNational && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#008751] rounded-full border-2 border-gray-900" />}
                </div>
                <div className="flex flex-col">
                  {!isNational && <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em] leading-tight">Mairie de</span>}
                  <span className="text-lg font-black text-white uppercase tracking-tighter leading-none">
                    {tenant?.name || "Bénin Connect"}
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Links (Hidden in Admin Views) */}
            {!isAdminView && (
              <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                {links.map((link) => (
                  <div 
                    key={link.label} 
                    className="relative group h-full flex items-center"
                    onMouseEnter={() => setActiveDropdown(link.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {link.path ? (
                      <Link 
                        to={link.path} 
                        className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-green-400 transition-colors relative"
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#EBB700] transition-all group-hover:w-full" />
                      </Link>
                    ) : (
                      <button className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-green-400 transition-colors relative flex items-center gap-1">
                        {link.label}
                        <ChevronRight className={cn("w-3 h-3 transition-transform", activeDropdown === link.label ? "rotate-90" : "")} />
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#EBB700] transition-all group-hover:w-full" />
                      </button>
                    )}

                    {/* Dropdown */}
                    <AnimatePresence>
                      {link.children && activeDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 w-60 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-3 grid gap-1"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.path}
                              className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-800 hover:text-green-400 transition-all"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-2 text-gray-400 hover:bg-gray-800 rounded-xl transition-all">
                <Search className="w-5 h-5" />
              </button>
              
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:bg-gray-800 rounded-xl transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {user && <NotificationCenter />}
              
              <div className="h-6 w-px bg-gray-800 mx-2 hidden sm:block" />

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[9px] font-black text-white uppercase tracking-tight">{profile?.full_name}</span>
                    <span className="text-[7px] text-green-400 uppercase font-black tracking-widest">{profile?.role}</span>
                  </div>
                  <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/auth/login" 
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#004d2c] text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-[#003d23] transition-all shadow-lg shadow-[#004d2c]/20 active:scale-95"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">Connexion</span>
                </Link>
              )}

              {/* Mobile Menu Button - Hidden if Admin View to avoid Sidebar conflict */}
              {!isAdminView && (
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-gray-400 hover:bg-gray-800 rounded-xl transition-all"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60] lg:hidden"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[320px] bg-white dark:bg-gray-900 z-[70] lg:hidden shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800"
              >
                {/* Mobile Menu Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Menu</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Navigation</span>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="p-3 bg-white dark:bg-gray-900 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
 
                {/* Mobile Menu Links */}
                <div className="flex-grow overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                  {links.map((link) => (
                    <div key={link.label} className="space-y-1">
                      {link.path ? (
                        <Link 
                          to={link.path} 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#004d2c] dark:hover:text-green-400 transition-all group"
                        >
                          <span className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-[#008751] transition-colors" />
                            {link.label}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </Link>
                      ) : (
                        <div className="space-y-1">
                          <div className="px-4 py-3 text-[9px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
                            <div className="w-4 h-px bg-[#EBB700]" />
                            {link.label}
                          </div>
                          {link.children?.map((child) => (
                            <Link 
                              key={child.label}
                              to={child.path} 
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center justify-between p-4 pl-8 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#004d2c] dark:hover:text-green-400 transition-all group"
                            >
                              {child.label}
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
 
                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode Sombre</span>
                    <button 
                      onClick={toggleTheme}
                      className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-400"
                    >
                      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                  </div>

                  {!user ? (
                    <Link 
                      to="/auth/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-[#004d2c] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#003d23] transition-all shadow-xl shadow-[#004d2c]/20 active:scale-95"
                    >
                      <User className="w-4 h-4" />
                      Connexion Citoyenne
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="w-10 h-10 bg-[#008751] rounded-xl flex items-center justify-center text-white font-black">
                        {profile?.full_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col flex-grow">
                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{profile?.full_name}</span>
                        <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">{profile?.role}</span>
                      </div>
                      <button onClick={signOut} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
      <SubscriptionManager />
    </>
  );
};
