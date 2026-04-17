import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Bell, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Search,
  MoreVertical,
  User,
  Database,
  Map,
  MapPin,
  Trash2,
  Sun,
  Moon,
  Vote,
  Handshake,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Store,
  Building2,
  ShieldCheck,
  Edit2,
  X
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { Pagination } from '../components/Pagination';
import { MarketModule } from './MarketModule';
import { LandModule } from './LandModule';
import { TransportModule } from './TransportModule';
import { ArrondissementModule } from './ArrondissementModule';
import { SignaturePad } from '../components/SignaturePad';
import { generateSignatureHash } from '../lib/cryptoUtils';
import { generateOfficialPDF } from '../lib/pdfGenerator';
import { AnimatePresence } from 'motion/react';

export const AdminPortal: React.FC = () => {
  const { tenant } = useTenant();
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [publicServices, setPublicServices] = useState<any[]>([]);
  const [tenantServices, setTenantServices] = useState<Record<string, any>>({});
  const [loadingServices, setLoadingServices] = useState(true);
  const [signalements, setSignalements] = useState<any[]>([]);
  const [loadingSignalements, setLoadingSignalements] = useState(true);
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loadingDossiers, setLoadingDossiers] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [polls, setPolls] = useState<any[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [dossierHistory, setDossierHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dossierNote, setDossierNote] = useState('');
  const [isSignMode, setIsSignMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [newDossier, setNewDossier] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    npi: '',
    serviceId: ''
  });

  useEffect(() => {
    if (tenant) {
      fetchServices();
      fetchDossiers();
      fetchSignalements();
      fetchUsers();
      fetchPolls();
      fetchPartners();
      fetchLocations();
      fetchNews();
    }
  }, [tenant, activeTab, currentPage, pageSize]);

  const fetchServices = async () => {
    const { data: pub } = await supabase.from('public_services').select('*');
    if (pub) setPublicServices(pub);
    
    const { data: ten } = await supabase.from('tenant_services').select('*, service:public_services(*)').eq('tenant_id', tenant?.id);
    if (ten) {
      const map: any = {};
      ten.forEach((s: any) => map[s.service_id] = s);
      setTenantServices(map);
    }
    setLoadingServices(false);
  };

  const fetchDossiers = async () => {
    setLoadingDossiers(true);
    const { data, count } = await supabase
      .from('dossiers')
      .select('*, tenant_service:tenant_services(service:public_services(*)), citizen:user_profiles(*)', { count: 'exact' })
      .eq('tenant_id', tenant?.id)
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
    
    if (data) setDossiers(data);
    if (count !== null) setTotalItems(count);
    setLoadingDossiers(false);
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('tenant_id', tenant?.id)
      .order('published_at', { ascending: false });
    if (data) setNews(data);
    setLoadingNews(false);
  };

  const fetchSignalements = async () => {
    const { data } = await supabase.from('signalements').select('*').eq('tenant_id', tenant?.id).order('created_at', { ascending: false });
    if (data) setSignalements(data);
    setLoadingSignalements(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    let query = supabase.from('user_profiles').select('*');
    
    // If user is search for someone specific (email search requires join or logic)
    if (userSearch) {
      // Profiles don't have email directly in schema usually (it's in auth.users), 
      // but we can search by full_name or assume the user has a way.
      // The requirement says "search by email". We might need an RPC for this if auth.users is restricted.
      // For now, we search in profiles by metadata if available, or just name.
      query = query.ilike('full_name', `%${userSearch}%`);
    } else {
      query = query.eq('tenant_id', tenant?.id);
    }

    const { data } = await query.limit(50);
    if (data) setAllUsers(data);
    setLoadingUsers(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'users') fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleElevateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      setFeedback({ type: 'error', msg: `Erreur: ${error.message}` });
    } else {
      setFeedback({ type: 'success', msg: 'Rôle mis à jour avec succès' });
      fetchUsers();
    }
  };

  const handleToggleService = async (serviceId: string, isActive: boolean) => {
    if (!tenant) return;
    
    const { error } = await supabase
      .from('tenant_services')
      .upsert({ 
        tenant_id: tenant.id, 
        service_id: serviceId, 
        is_active: isActive 
      }, { onConflict: 'tenant_id,service_id' });

    if (error) {
      setFeedback({ type: 'error', msg: error.message });
    } else {
      setFeedback({ type: 'success', msg: `Service ${isActive ? 'activé' : 'désactivé'}` });
      fetchServices();
    }
  };

  const fetchPolls = async () => {
    const { data } = await supabase.from('polls').select('*, poll_options(*)').eq('tenant_id', tenant?.id);
    if (data) setPolls(data);
    setLoadingPolls(false);
  };

  const fetchPartners = async () => {
    const { data } = await supabase.from('partners').select('*').eq('tenant_id', tenant?.id).order('order');
    if (data) setPartners(data);
  };

  const fetchLocations = async () => {
    const { data } = await supabase.from('locations').select('*').eq('tenant_id', tenant?.id);
    if (data) setLocations(data);
  };

  const fetchDossierHistory = async (dossierId: string) => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from('dossier_history')
      .select('*, agent:user_profiles(*)')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: false });
    if (data) setDossierHistory(data);
    setLoadingHistory(false);
  };

  const handleAddDossierNote = async () => {
    if (!dossierNote.trim()) return;
    const { error } = await supabase.from('dossier_history').insert({
      tenant_id: tenant?.id,
      dossier_id: selectedDossier.id,
      agent_id: user?.id,
      status_id: selectedDossier.status_id,
      comment: dossierNote
    });

    if (error) alert(error.message);
    else {
      setDossierNote('');
      fetchDossierHistory(selectedDossier.id);
    }
  };

  const handleUpdateDossierStatus = async (dossierId: string, newStatus: string) => {
    setLoadingHistory(true);
    const prevStatus = selectedDossier?.status_id;
    
    const { error } = await supabase
      .from('dossiers')
      .update({ status_id: newStatus })
      .eq('id', dossierId);
    
    if (error) {
      setFeedback({ type: 'error', msg: error.message });
    } else {
      await supabase.from('dossier_history').insert({
        tenant_id: tenant?.id,
        dossier_id: dossierId,
        status_id: newStatus,
        agent_id: user?.id,
        notes: `Mise à jour manuelle. Passé de ${prevStatus || 'NR'} à ${newStatus}`
      });
      
      setFeedback({ type: 'success', msg: 'Statut mis à jour avec succès' });
      setSelectedDossier((prev: any) => ({ ...prev, status_id: newStatus }));
      fetchDossiers();
      fetchDossierHistory(dossierId);
    }
    setLoadingHistory(false);
  };

  const handleSignAndGenerate = async (signatureDataUrl: string) => {
    if (!selectedDossier || !tenant || !user) return;
    
    setIsGeneratingPDF(true);
    setIsSignMode(false);
    
    try {
      // 1. Generate Hash
      const hash = await generateSignatureHash(selectedDossier.submission_data, user.id);
      
      // 2. Prepare Data for PDF
      const pdfData = {
        tracking_code: selectedDossier.tracking_code,
        citizen_name: `${selectedDossier.submission_data?.firstName} ${selectedDossier.submission_data?.lastName}`,
        service_name: selectedDossier.tenant_service?.service?.name || "Service Administratif",
        municipality_name: tenant.name.toUpperCase(),
        submission_date: new Date().toLocaleDateString('fr-FR'),
        signature_hash: hash,
        signer_name: profile?.full_name || "L'Autorité Municipale",
        qr_code_data: `${window.location.origin}/verify/${selectedDossier.id}`
      };

      // 3. Generate PDF Blob
      const pdfBlob = await generateOfficialPDF(pdfData);
      
      // 4. Upload to Supabase Storage
      const year = new Date().getFullYear();
      const filePath = `officiel-documents/${tenant.id}/${year}/${selectedDossier.tracking_code}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      // 5. Update Dossier in DB
      const { error: updateError } = await supabase
        .from('dossiers')
        .update({
          status_id: 'TERMINÉ',
          document_url: publicUrl,
          signature_hash: hash,
          signed_at: new Date().toISOString(),
          signed_by_id: user.id
        })
        .eq('id', selectedDossier.id);

      if (updateError) throw updateError;

      setFeedback({ type: 'success', msg: 'Document signé et archivé avec succès' });
      setSelectedDossier((prev: any) => ({ 
        ...prev, 
        status_id: 'TERMINÉ', 
        document_url: publicUrl,
        signature_hash: hash
      }));
      fetchDossiers();

    } catch (err: any) {
      console.error('Signing error:', err);
      setFeedback({ type: 'error', msg: `Erreur de signature: ${err.message}` });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const createDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    const ts = tenantServices[newDossier.serviceId];
    if (!ts) return;

    const { data, error } = await supabase.from('dossiers').insert({
      tenant_id: tenant?.id,
      service_id: ts.id,
      status_id: 'SOUMIS',
      tracking_code: `DOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      submission_data: {
        firstName: newDossier.firstName,
        lastName: newDossier.lastName,
        phone: newDossier.phone,
        npi: newDossier.npi
      }
    }).select().single();

    if (error) alert(error.message);
    else {
      setIsDossierModalOpen(false);
      setNewDossier({ firstName: '', lastName: '', phone: '', npi: '', serviceId: '' });
      fetchDossiers();
    }
  };

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

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="flex relative z-10">
        {/* Sidebar - Neo-Glassmorphism Floating */}
        <aside className="w-72 h-[calc(100vh-48px)] sticky top-6 ml-6 my-6 bg-white/40 dark:bg-[#131B2B]/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 p-8 hidden lg:flex flex-col shadow-2xl rounded-[40px] overflow-hidden transition-all">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-[#008751] to-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#008751] uppercase tracking-[0.3em] leading-tight mb-1 truncate max-w-[150px]">{tenant?.name}</span>
              <span className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Console Admin</span>
            </div>
          </div>

          <nav className="space-y-3 flex-grow overflow-y-auto no-scrollbar pr-2">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
              { id: 'dossiers', label: 'Gestion Dossiers', icon: FileText },
              { id: 'services', label: 'Services Mairie', icon: ShieldCheck },
              { id: 'users', label: 'Citoyens & Staff', icon: Users },
              { id: 'signalements', label: 'Signalements', icon: AlertCircle },
              { id: 'market', label: 'Marchés Urbains', icon: Store },
              { id: 'land', label: 'Gestion Foncière', icon: MapPin },
              { id: 'transport', label: 'Transports', icon: Map },
              { id: 'arrondissement', label: 'Arrondissements', icon: Building2 },
              { id: 'news', label: 'Actualités', icon: Bell },
              { id: 'config', label: 'Paramètres', icon: Settings },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative group",
                  activeTab === item.id 
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl" 
                    : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {activeTab === item.id && (
                  <motion.div layoutId="nav-glow-admin" className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl px-2" />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 transition-transform group-hover:scale-110", activeTab === item.id ? "text-secondary" : "")} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-100 dark:border-white/10 mt-6">
            <button 
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-rose-500 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              Retour Site
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-grow p-6 lg:p-12 max-w-[1500px] mx-auto space-y-12 h-screen overflow-y-auto no-scrollbar">
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
                    {user?.email?.charAt(0)}
                 </div>
                 <div className="hidden sm:flex flex-col">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{profile?.full_name || user?.email}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{profile?.role}</span>
                 </div>
              </div>
            </div>
          </header>

          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Dossiers', value: totalItems, icon: FileText, color: 'from-[#008751] to-emerald-400' },
                  { label: 'Signalements', value: signalements.length, icon: AlertCircle, color: 'from-blue-600 to-cyan-500' },
                  { label: 'Utilisateurs', value: allUsers.length, icon: Users, color: 'from-purple-600 to-indigo-500' },
                  { label: 'Sondages', value: polls.length, icon: Vote, color: 'from-[#EBB700] to-amber-300' }
                ].map((stat, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card-glass p-8 group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-12 -mt-12 blur-xl" />
                    <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 shadow-xl", stat.color)}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <p className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        {activeTab === 'dossiers' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestion des Dossiers</h2>
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
              <button 
                onClick={() => setIsDossierModalOpen(true)}
                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                Nouveau Dossier
              </button>
            </div>

            <div className="card-glass overflow-hidden border-none shadow-2xl">
              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Code Suivi</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Citoyen</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Type de Service</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Statut</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {loadingDossiers ? (
                       [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-8 py-8 animate-pulse bg-gray-50/20 dark:bg-white/5 h-16" /></tr>)
                    ) : dossiers.length === 0 ? (
                       <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Aucun dossier trouvé</td></tr>
                    ) : dossiers.map((d, i) => (
                      <motion.tr 
                        key={d.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300 group"
                      >
                        <td className="px-8 py-8">
                          <span className="font-mono text-[10px] font-black text-primary px-3 py-1.5 bg-primary/10 rounded-lg">{d.tracking_code}</span>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                              {d.submission_data?.firstName} {d.submission_data?.lastName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest">{d.submission_data?.phone}</span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{d.tenant_service?.service?.name}</span>
                        </td>
                        <td className="px-8 py-8">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                            d.status_id === 'TERMINÉ' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                            d.status_id === 'REJETÉ' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
                            "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", d.status_id === 'TERMINÉ' ? "bg-emerald-500" : "bg-blue-500")} />
                            {d.status_id}
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button 
                            onClick={() => { setSelectedDossier(d); fetchDossierHistory(d.id); }} 
                            className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:text-primary hover:border-primary/30 uppercase tracking-widest transition-all shadow-sm"
                          >
                            Détails
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
               </table>
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-white/5">
              <Pagination 
                total={totalItems} 
                current={currentPage} 
                pageSize={pageSize}
                onChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </div>
        </div>
      )}

        {activeTab === 'news' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Actualités Locales</h2>
                <div className="h-1 w-12 bg-primary rounded-full" />
              </div>
              <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus className="w-4 h-4" />
                Nouvel Article
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingNews ? (
                [1,2,3].map(i => <div key={i} className="card-glass h-80 animate-pulse bg-gray-50/20 dark:bg-white/5" />)
              ) : news.length === 0 ? (
                <div className="col-span-full card-glass p-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs border-none">Aucun article publié</div>
              ) : news.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-glass overflow-hidden flex flex-col group border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                   <div className="h-48 bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-6 left-6">
                        <span className="px-4 py-1.5 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/50 dark:border-white/5">
                          {item.category}
                        </span>
                      </div>
                   </div>
                   <div className="p-8 space-y-4 flex-grow">
                      <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed font-bold tracking-tight">{item.excerpt || item.content}</p>
                   </div>
                   <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{formatDate(item.published_at)}</span>
                      <div className="flex gap-2">
                        <button className="w-9 h-9 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 transition-all">
                           <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="w-9 h-9 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-500/40 transition-all">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signalements' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="space-y-1">
              <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Signalements Citoyens</h2>
              <div className="h-1 w-12 bg-primary rounded-full" />
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">Traiter les problèmes signalés par les résidents</p>
            </div>

            <div className="card-glass overflow-hidden border-none shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Type</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Description</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Statut</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Date</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {loadingSignalements ? (
                      [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-8 py-8 h-16 animate-pulse bg-gray-50/20 dark:bg-white/5" /></tr>)
                    ) : signalements.length === 0 ? (
                      <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Aucun signalement</td></tr>
                    ) : signalements.map((s, i) => (
                      <motion.tr 
                        key={s.id} 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300"
                      >
                        <td className="px-8 py-8">
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">{s.type}</span>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight max-w-xs truncate">{s.description}</p>
                        </td>
                        <td className="px-8 py-8">
                           <span className={cn(
                             "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
                             s.status === 'resolved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-orange-50 text-orange-600 border border-orange-100"
                           )}>
                              {s.status === 'resolved' ? 'Résolu' : 'En attente'}
                           </span>
                        </td>
                        <td className="px-8 py-8">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(s.created_at)}</span>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <button className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:text-primary hover:border-primary/30 uppercase tracking-widest transition-all shadow-sm">
                            Traiter
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
               </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold dark:text-white">Citoyens & Agents</h2>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Gérez les accès et profils utilisateurs</p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Rechercher par nom..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-xl text-sm outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="bento-card overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Nom</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Rôle Actuel</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">Actions de Rôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      [1,2,3].map(i => <tr key={i}><td colSpan={3} className="px-6 py-4 h-12 animate-pulse bg-gray-50/50 dark:bg-white/5" /></tr>)
                    ) : allUsers.length === 0 ? (
                       <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">Aucun utilisateur trouvé</td></tr>
                    ) : allUsers.map(u => (
                      <tr key={u.id} className="border-b border-gray-100 dark:border-white/5 group hover:bg-gray-50/50 dark:hover:bg-white/5">
                        <td className="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{u.full_name}</td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                             u.role === 'admin' ? "bg-purple-50 text-purple-600" : 
                             u.role === 'agent' ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500"
                           )}>
                             {u.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <select 
                             className="bg-transparent text-xs font-bold uppercase tracking-widest border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 outline-none"
                             value={u.role}
                             onChange={(e) => handleElevateRole(u.id, e.target.value)}
                           >
                             <option value="citizen">Citoyen</option>
                             <option value="agent">Agent Mairie</option>
                             <option value="admin">Administrateur</option>
                             <option value="ca_admin">Chef Arrond.</option>
                             {profile?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                           </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'polls' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-bold dark:text-white">Participation Citoyenne</h2>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Sondages et consultations publiques</p>
              </div>
              <button className="btn-primary">Nouveau Sondage</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.map(poll => (
                <div key={poll.id} className="bento-card p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg dark:text-white leading-tight">{poll.question}</h3>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">ACTIF</span>
                  </div>
                  <div className="space-y-3">
                    {poll.poll_options?.map((opt: any) => (
                      <div key={opt.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                          <span>{opt.text}</span>
                          <span>{opt.votes_count || 0} votes</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(opt.votes_count / (poll.total_votes || 1)) * 100}%` }}
                             className="h-full bg-emerald-500"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-bold dark:text-white">Carte & Lieux d'Intérêt</h2>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mt-1">Gérez les points d'intérêt sur la carte interactive</p>
              </div>
              <button className="btn-primary">Ajouter un Lieu</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {locations.map(loc => (
                 <div key={loc.id} className="bento-card p-4 flex flex-col gap-3">
                    <div className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl overflow-hidden">
                       {loc.image_url ? <img src={loc.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin /></div>}
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{loc.category}</p>
                       <h4 className="font-bold text-sm dark:text-white">{loc.name}</h4>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* ... Other tabs ... */}
        {activeTab === 'services' && (
           <div className="space-y-12 animate-in fade-in duration-700">
              <div className="space-y-1">
                <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Catalogue des Services</h2>
                <div className="h-1 w-16 bg-primary rounded-full" />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">Activez les services disponibles pour votre municipalité</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {publicServices.map((service, i) => (
                   <motion.div 
                    key={service.id} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-glass p-8 flex flex-col justify-between group h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-none"
                   >
                      <div className="space-y-6">
                         <div className="flex justify-between items-start">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-[20px] flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                               <FileText className="w-7 h-7" />
                            </div>
                            <button 
                              onClick={() => handleToggleService(service.id, !tenantServices[service.id]?.is_active)}
                              className={cn(
                                "text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl transition-all shadow-sm border",
                                tenantServices[service.id]?.is_active 
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                  : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400"
                              )}
                            >
                               {tenantServices[service.id]?.is_active ? 'Activé' : 'Désactivé'}
                            </button>
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-2">
                               <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{service.category}</span>
                            </div>
                            <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{service.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed font-bold tracking-tight">{service.description}</p>
                         </div>
                      </div>
                      <div className="pt-8 border-t border-gray-100 dark:border-white/5 mt-8 flex justify-between items-center">
                         <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-white/10" />
                            ))}
                         </div>
                         <button className="w-10 h-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 transition-all">
                            <Settings className="w-4 h-4" />
                         </button>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        )}
      </main>
    </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-[100] border backdrop-blur-md flex items-center gap-3",
              feedback.type === 'success' ? "bg-emerald-50/90 border-emerald-200 text-emerald-900" : "bg-red-50/90 border-red-200 text-red-900"
            )}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span className="text-sm font-bold uppercase tracking-tight">{feedback.msg}</span>
            <button onClick={() => setFeedback(null)} className="ml-4 hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedDossier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Détails Dossier {selectedDossier.tracking_code}</h3>
              <button onClick={() => setSelectedDossier(null)}><X /></button>
            </div>
            <div className="p-6 overflow-y-auto">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                        <p className="text-xs uppercase font-bold text-gray-500">Citoyen</p>
                        <p className="font-bold">{selectedDossier.submission_data?.firstName} {selectedDossier.submission_data?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-gray-500">Statut Actuel</p>
                        <p className="font-bold text-emerald-600">{selectedDossier.status_id}</p>
                    </div>

                    {selectedDossier.document_url && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Document Signé</p>
                        <a 
                          href={selectedDossier.document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          Voir l'Acte Officiel
                        </a>
                      </div>
                    )}

                    {selectedDossier.status_id === 'APPROUVÉ' && !selectedDossier.document_url && (
                      <div className="pt-4">
                        <button 
                          onClick={() => setIsSignMode(true)}
                          disabled={isGeneratingPDF}
                          className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                        >
                          {isGeneratingPDF ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShieldCheck className="w-5 h-5" />
                          )}
                          {isGeneratingPDF ? 'Génération en cours...' : 'Signer & Générer l\'Acte'}
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-gray-500">Mettre à jour le statut</p>
                        <div className="flex flex-wrap gap-2">
                           {['SOUMIS', 'EN_REVISION', 'APPROUVÉ', 'REJETÉ', 'TERMINÉ'].map(s => (
                             <button 
                               key={s} 
                               onClick={() => handleUpdateDossierStatus(selectedDossier.id, s)}
                               className={cn("px-3 py-1 rounded-full text-[10px] font-bold", selectedDossier.status_id === s ? "bg-emerald-600 text-white" : "border")}
                             >
                               {s}
                             </button>
                           ))}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-gray-500">Notes & Historique</p>
                        <div className="flex gap-2">
                           <input 
                             value={dossierNote}
                             onChange={e => setDossierNote(e.target.value)}
                             className="flex-grow border rounded-lg px-3 py-2 text-sm"
                             placeholder="Note..."
                           />
                           <button onClick={handleAddDossierNote} className="btn-primary py-1 px-4">Ajouter</button>
                        </div>
                        <div className="space-y-4 pt-4">
                           {dossierHistory.map(h => (
                             <div key={h.id} className="p-3 border rounded-xl text-xs">
                                <p className="font-bold">{h.agent?.full_name || 'Système'}</p>
                                <p className="italic">"{h.comment}"</p>
                                <p className="text-[10px] text-gray-400 mt-1">{formatDate(h.created_at)}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {isSignMode && (
        <SignaturePad 
          onSave={handleSignAndGenerate}
          onCancel={() => setIsSignMode(false)}
        />
      )}

      {isDossierModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-lg">
             <h3 className="text-xl font-bold mb-6">Nouveau Dossier</h3>
             <form onSubmit={createDossier} className="space-y-4">
                <input placeholder="Prénom" className="w-full border rounded-xl p-3" value={newDossier.firstName} onChange={e => setNewDossier({...newDossier, firstName: e.target.value})} />
                <input placeholder="Nom" className="w-full border rounded-xl p-3" value={newDossier.lastName} onChange={e => setNewDossier({...newDossier, lastName: e.target.value})} />
                <select className="w-full border rounded-xl p-3" value={newDossier.serviceId} onChange={e => setNewDossier({...newDossier, serviceId: e.target.value})}>
                   <option value="">Choisir un service</option>
                   {publicServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button className="btn-primary w-full py-3">Créer</button>
             </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
