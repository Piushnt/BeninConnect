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
  X
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [flashNews, setFlashNews] = useState<any[]>([]);
  const [loadingFlash, setLoadingFlash] = useState(true);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [polls, setPolls] = useState<any[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    dossiers: 0,
    signalements: 0,
    users: 0,
    revenue: '0'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [newDossier, setNewDossier] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    npi: '',
    serviceId: '',
    status: 'SOUMIS'
  });

  const generateTrackingCode = () => {
    return 'MC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pour les dossiers créés par l'agent, on peut soit lier à un utilisateur existant,
      // soit laisser citizen_id à null et stocker les infos dans submission_data.
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone', newDossier.phone)
        .maybeSingle();

      const citizenId = existingUser?.id || null;

      const trackingCode = generateTrackingCode();
      const { error: dossierError } = await supabase
        .from('dossiers')
        .insert({
          tenant_id: tenant?.id,
          service_id: newDossier.serviceId,
          citizen_id: citizenId,
          status_id: newDossier.status,
          tracking_code: trackingCode,
          submission_data: {
            firstName: newDossier.firstName,
            lastName: newDossier.lastName,
            phone: newDossier.phone,
            npi: newDossier.npi
          }
        });

      if (dossierError) throw dossierError;

      alert(`Dossier créé avec succès ! Code de suivi : ${trackingCode}`);
      setIsDossierModalOpen(false);
      setNewDossier({
        firstName: '',
        lastName: '',
        phone: '',
        npi: '',
        serviceId: '',
        status: 'SOUMIS'
      });
      if (activeTab === 'dossiers') fetchDossiers();
      fetchStats();
    } catch (err: any) {
      alert('Erreur lors de la création du dossier: ' + err.message);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (tenant) {
      fetchStats();
      if (activeTab === 'services') fetchServicesData();
      if (activeTab === 'signalements') fetchSignalements();
      if (activeTab === 'users') fetchAllUsers();
      if (activeTab === 'signalements') fetchAgents();
      if (activeTab === 'dossiers') fetchDossiers();
      if (activeTab === 'cms') fetchFlashNews();
      if (activeTab === 'news') fetchNewsList();
      if (activeTab === 'polls') fetchPolls();
      if (activeTab === 'partners') fetchPartners();
      if (activeTab === 'locations') fetchLocations();
    }
  }, [tenant, activeTab, currentPage]);

  const Pagination = ({ total, current, onChange }: { total: number, current: number, onChange: (p: number) => void }) => {
    const totalPages = Math.ceil(total / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 gap-4">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Affichage de {Math.min(itemsPerPage, total - (current - 1) * itemsPerPage)} sur {total} éléments
        </span>
        <div className="flex items-center gap-2">
          <button 
            disabled={current === 1}
            onClick={() => onChange(current - 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50"
          >
            Précédent
          </button>
          <div className="flex items-center gap-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => onChange(i + 1)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[10px] font-bold transition-all",
                  current === i + 1 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/10"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={current === totalPages}
            onClick={() => onChange(current + 1)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const fetchLocations = async () => {
    if (!tenant) return;
    try {
      setLoadingLocations(true);
      const { data, count, error } = await supabase
        .from('locations')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('name')
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      if (error) throw error;
      setLocations(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const deleteLocation = async (id: string) => {
    if (!window.confirm('Supprimer ce point d\'intérêt ?')) return;
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
      fetchLocations();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const fetchPolls = async () => {
    if (!tenant) return;
    try {
      setLoadingPolls(true);
      const { data, count, error } = await supabase
        .from('polls')
        .select('*, poll_options(*)', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      if (error) throw error;
      setPolls(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching polls:', err);
    } finally {
      setLoadingPolls(false);
    }
  };

  const fetchPartners = async () => {
    if (!tenant) return;
    try {
      setLoadingPartners(true);
      const { data, count, error } = await supabase
        .from('partners')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('order', { ascending: true })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      if (error) throw error;
      setPartners(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoadingPartners(false);
    }
  };

  const fetchNewsList = async () => {
    if (!tenant) return;
    try {
      setLoadingNews(true);
      const { data, count, error } = await supabase
        .from('news')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('published_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      
      if (error) throw error;
      setNewsList(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching news list:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (!window.confirm('Supprimer cette actualité ?')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      fetchNewsList();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const fetchFlashNews = async () => {
    if (!tenant) return;
    try {
      setLoadingFlash(true);
      const { data, error } = await supabase
        .from('flash_news')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFlashNews(data || []);
    } catch (err) {
      console.error('Error fetching flash news:', err);
    } finally {
      setLoadingFlash(false);
    }
  };

  const deleteFlashNews = async (id: string) => {
    try {
      const { error } = await supabase.from('flash_news').delete().eq('id', id);
      if (error) throw error;
      fetchFlashNews();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const fetchAllUsers = async () => {
    if (!tenant) return;
    try {
      setLoadingUsers(true);
      const { data, count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('full_name')
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      if (error) throw error;
      setAllUsers(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDossiers = async () => {
    if (!tenant) return;
    try {
      setLoadingDossiers(true);
      const { data, count, error } = await supabase
        .from('dossiers')
        .select('*, citizen:user_profiles!citizen_id(*), tenant_service:tenant_services!service_id(*, service:public_services(*))', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
      if (error) throw error;
      setDossiers(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching dossiers:', err);
    } finally {
      setLoadingDossiers(false);
    }
  };

  const fetchAgents = async () => {
    if (!tenant) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('tenant_id', tenant.id)
      .in('role', ['admin', 'agent']);
    setAgents(data || []);
  };

  const handleDeleteUser = async (userId: string, fullName: string) => {
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${fullName}" ?\n\nCette action est irréversible et supprimera toutes les données associées à ce profil.`
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      alert('Utilisateur supprimé avec succès.');
      fetchAllUsers();
      if (activeTab === 'signalements') fetchAgents();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Erreur lors de la suppression: ${err.message}`);
    }
  };

  const fetchSignalements = async () => {
    try {
      setLoadingSignalements(true);
      const { data, count, error } = await supabase
        .from('signalements')
        .select('*, citizen:user_profiles!citizen_id(*), agent:user_profiles!assigned_to(*)', { count: 'exact' })
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      setSignalements(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching signalements:', err);
    } finally {
      setLoadingSignalements(false);
    }
  };

  const updateSignalementStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      fetchSignalements();
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const assignSignalement = async (id: string, agentId: string) => {
    try {
      const { error } = await supabase
        .from('signalements')
        .update({ assigned_to: agentId, status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      fetchSignalements();
    } catch (err) {
      alert('Erreur lors de l\'assignation');
    }
  };

  const updateCustomPrice = async (serviceId: string, price: number) => {
    const existing = tenantServices[serviceId];
    try {
      if (existing) {
        const { error } = await supabase
          .from('tenant_services')
          .update({ custom_price: price })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_services')
          .insert({
            tenant_id: tenant?.id,
            service_id: serviceId,
            custom_price: price,
            is_active: true,
            is_visible: true
          });
        if (error) throw error;
      }
      fetchServicesData();
    } catch (err) {
      alert('Erreur lors de la mise à jour du prix');
    }
  };

  const fetchServicesData = async () => {
    try {
      setLoadingServices(true);
      const [publicRes, tenantRes] = await Promise.all([
        supabase.from('public_services').select('*').order('name'),
        supabase.from('tenant_services').select('*').eq('tenant_id', tenant?.id)
      ]);

      setPublicServices(publicRes.data || []);
      const tsMap = (tenantRes.data || []).reduce((acc, curr) => ({ ...acc, [curr.service_id]: curr }), {});
      setTenantServices(tsMap);
    } catch (err) {
      console.error('Error fetching services data:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  const toggleServiceActivation = async (serviceId: string) => {
    const existing = tenantServices[serviceId];
    try {
      if (existing) {
        const { error } = await supabase
          .from('tenant_services')
          .update({ is_active: !existing.is_active })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tenant_services')
          .insert({
            tenant_id: tenant?.id,
            service_id: serviceId,
            is_active: true,
            is_visible: true
          });
        if (error) throw error;
      }
      fetchServicesData();
    } catch (err) {
      alert("Erreur lors de l'activation du service");
    }
  };

  const fetchStats = async () => {
    if (!tenant) return;
    
    try {
      const [dossiersCount, usersCount, signalementsCount, paymentsRes] = await Promise.all([
        supabase.from('dossiers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('signalements').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('payments').select('amount').eq('tenant_id', tenant.id).eq('status', 'success')
      ]);

      const totalRevenue = (paymentsRes.data || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

      setStats({
        dossiers: dossiersCount.count || 0,
        signalements: signalementsCount.count || 0,
        users: usersCount.count || 0,
        revenue: totalRevenue.toLocaleString()
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  if (!profile || !['admin', 'agent', 'super_admin'].includes(profile.role)) {
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
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] flex transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-64 bg-white/60 dark:bg-[#131B2B]/60 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 flex flex-col p-6 space-y-8 transition-colors relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">E-Admin</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{tenant?.name}</p>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { id: 'dossiers', label: 'Gestion Dossiers', icon: FileText },
            { id: 'news', label: 'Actualités', icon: FileText },
            { id: 'services', label: 'Services Publics', icon: FileText },
            { id: 'signalements', label: 'Signalements', icon: AlertCircle },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'departments', label: 'Départements', icon: Map },
            { id: 'users', label: 'Citoyens & Agents', icon: Users },
            { id: 'cms', label: 'Contenu Pages', icon: FileText },
            { id: 'polls', label: 'Sondages', icon: Vote },
            { id: 'locations', label: 'Carte & POIs', icon: MapPin },
            { id: 'partners', label: 'Partenaires', icon: Handshake },
            { id: 'settings', label: 'Configuration', icon: Settings },
            ...(profile.role === 'super_admin' ? [{ id: 'setup', label: 'Setup Système', icon: Database }] : []),
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'setup') {
                  navigate(`/${slug}/system-setup`);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === item.id 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg shadow-gray-900/20 dark:shadow-white/10" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-3 border border-gray-100 dark:border-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connecté en tant que</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{profile.full_name}</p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{profile.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-8 overflow-y-auto relative z-10 max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bento-card p-6 md:p-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Bonjour, {profile.full_name.split(' ')[0]}</h1>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Voici l'état de la commune aujourd'hui</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-3 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-100 dark:border-white/5 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#131B2B]" />
            </button>
            <button 
              onClick={() => setIsDossierModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvelle Action
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Dossiers Actifs', val: stats.dossiers, icon: FileText, color: 'from-blue-500 to-cyan-400' },
              { label: 'Signalements', val: stats.signalements, icon: AlertCircle, color: 'from-red-500 to-rose-400' },
              { label: 'Citoyens', val: stats.users, icon: Users, color: 'from-emerald-500 to-teal-400' },
              { label: 'Recettes (FCFA)', val: stats.revenue, icon: TrendingUp, color: 'from-amber-500 to-orange-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-6 group"
              >
                <div className="glow-effect" />
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]">Statistique</span>
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-1">{stat.val}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Gestion des Actualités</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Publiez et modifiez les articles de la mairie</p>
              </div>
              <button 
                onClick={() => {
                  // For now just show a simple alert or we could add a form
                  alert('Fonctionnalité de création en cours de développement. Utilisez le script SQL pour l\'instant.');
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvel Article
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loadingNews ? (
                [1,2,3].map(i => <div key={i} className="h-24 bento-card animate-pulse" />)
              ) : newsList.length === 0 ? (
                <div className="text-center py-12 bento-card border-dashed">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aucun article publié</p>
                </div>
              ) : (
                newsList.map((item) => (
                  <div key={item.id} className="bento-card p-6 flex items-center justify-between gap-6 group">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/5 shrink-0">
                        <img 
                          src={item.image_url || `https://picsum.photos/seed/${item.id}/200/200`} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                          Publié le {new Date(item.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteNews(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Catalogue des Services</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Gérez les prestations offertes par la mairie</p>
              </div>
              {profile.role === 'super_admin' && (
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau Service Global
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loadingServices ? (
                [1,2,3].map(i => <div key={i} className="h-24 bento-card animate-pulse" />)
              ) : (
                publicServices.map((service) => {
                  const ts = tenantServices[service.id];
                  const isActive = ts?.is_active;

                  return (
                    <div key={service.id} className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                          isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-gray-50 dark:bg-white/5 text-gray-400"
                        )}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">{service.name}</h3>
                            <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
                              {service.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1">{service.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Tarif</p>
                          <div className="flex items-center justify-end gap-1">
                            <input 
                              type="number"
                              defaultValue={ts?.custom_price || service.base_price || 0}
                              onBlur={(e) => updateCustomPrice(service.id, Number(e.target.value))}
                              className="text-lg font-display font-bold text-gray-900 dark:text-white bg-transparent border-b border-transparent focus:border-gray-200 dark:focus:border-white/10 w-24 text-right outline-none transition-colors"
                            />
                            <span className="text-xs font-bold text-gray-400">FCFA</span>
                          </div>
                        </div>
                        <div className="h-10 w-px bg-gray-100 dark:bg-white/5 hidden sm:block" />
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleServiceActivation(service.id)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                              isActive 
                                ? "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20" 
                                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                            )}
                          >
                            {isActive ? 'Désactiver' : 'Activer'}
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all">
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Signalements Tab */}
        {activeTab === 'signalements' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Signalements Citoyens</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Gérez les alertes et problèmes signalés</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {loadingSignalements ? (
                [1,2,3].map(i => <div key={i} className="h-32 bento-card animate-pulse" />)
              ) : (
                signalements.map((sig) => (
                  <div key={sig.id} className="bento-card p-6 md:p-8 group">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                          sig.priority === 'urgent' ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                        )}>
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">{sig.category}</h3>
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              sig.status === 'resolved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}>
                              {sig.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Signalé le {formatDate(sig.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <select 
                          value={sig.status}
                          onChange={(e) => updateSignalementStatus(sig.id, e.target.value)}
                          className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest outline-none dark:text-white transition-all appearance-none"
                        >
                          <option value="pending">En attente</option>
                          <option value="under_review">En cours</option>
                          <option value="assigned">Assigné</option>
                          <option value="resolved">Résolu</option>
                          <option value="rejected">Rejeté</option>
                        </select>
                        <select 
                          value={sig.assigned_to || ''}
                          onChange={(e) => assignSignalement(sig.id, e.target.value)}
                          className="px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest outline-none dark:text-white transition-all appearance-none"
                        >
                          <option value="">Assigner à...</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">{sig.description}</p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {sig.location || 'Position non spécifiée'}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {sig.citizen?.full_name || 'Anonyme'}
                      </div>
                      {sig.agent && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          Assigné à: {sig.agent.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8">
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">Envoyer une Notification</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const notificationData = {
                  title: formData.get('title'),
                  body: formData.get('message'),
                  image_url: formData.get('image_url'),
                  action_url: formData.get('link'),
                  priority: formData.get('type') === 'alert' ? 'high' : 'normal',
                };
                
                const { data: notif, error: notifError } = await supabase
                  .from('notifications')
                  .insert(notificationData)
                  .select()
                  .single();

                if (notifError) {
                  alert(notifError.message);
                  return;
                }

                const targetData = {
                  notification_id: notif.id,
                  tenant_id: profile.role === 'super_admin' ? null : tenant?.id,
                  role_target: 'citizen', // Default target for now
                };

                const { error: targetError } = await supabase.from('notification_targets').insert(targetData);
                
                if (targetError) alert(targetError.message);
                else {
                  alert('Notification diffusée !');
                  (e.target as HTMLFormElement).reset();
                }
              }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre</label>
                  <input name="title" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Titre de l'alerte" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</label>
                  <select name="type" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all appearance-none">
                    <option value="info">Information</option>
                    <option value="alert">Alerte Urgente</option>
                    <option value="news">Actualité</option>
                    <option value="event">Événement</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Message</label>
                  <textarea name="message" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-32 resize-none" placeholder="Contenu de la notification..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Image (Optionnel)</label>
                  <input name="image_url" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lien (Optionnel)</label>
                  <input name="link" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="/services/..." />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="btn-primary w-full py-4">
                    Diffuser la notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8">
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-8">Ajouter/Modifier un Département</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get('name'),
                  history: formData.get('history'),
                  images: [
                    formData.get('img1'),
                    formData.get('img2'),
                    formData.get('img3'),
                    formData.get('img4'),
                  ].filter(Boolean),
                  communes: formData.get('communes')?.toString().split(',').map(s => s.trim()),
                };
                
                const { error } = await supabase.from('departments').upsert(data, { onConflict: 'name' });
                if (error) alert(error.message);
                else {
                  alert('Département enregistré !');
                  (e.target as HTMLFormElement).reset();
                }
              }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom du Département</label>
                  <input name="name" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Littoral" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Communes (séparées par des virgules)</label>
                  <input name="communes" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Cotonou, Abomey-Calavi..." />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Histoire & Description</label>
                  <textarea name="history" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-32 resize-none" placeholder="L'histoire du département..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image 1 (ImgBB Link)</label>
                  <input name="img1" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://i.ibb.co/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image 2 (ImgBB Link)</label>
                  <input name="img2" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://i.ibb.co/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image 3 (ImgBB Link)</label>
                  <input name="img3" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://i.ibb.co/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Image 4 (ImgBB Link)</label>
                  <input name="img4" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://i.ibb.co/..." />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="btn-primary w-full py-4">
                    Enregistrer le Département
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dossiers Tab */}
        {activeTab === 'dossiers' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Gestion des Dossiers</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Suivez et traitez les demandes des citoyens</p>
              </div>
              <button 
                onClick={() => setIsDossierModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouveau Dossier
              </button>
            </div>

            <div className="bento-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Code</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Citoyen</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Service</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Statut</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {loadingDossiers ? (
                      [1,2,3,4,5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-white/5" />
                        </tr>
                      ))
                    ) : dossiers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                          Aucun dossier trouvé
                        </td>
                      </tr>
                    ) : (
                      dossiers.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">{d.tracking_code}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {d.citizen?.full_name || `${d.submission_data?.firstName} ${d.submission_data?.lastName}`}
                              </span>
                              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{d.submission_data?.phone || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                            {d.tenant_service?.service?.name}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">
                            {formatDate(d.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={cn(
                              "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              d.status_id === 'TERMINÉ' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                              d.status_id === 'REJETÉ' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            )}>
                              {d.status_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Citoyens & Agents</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Gérez les utilisateurs de votre commune</p>
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un Agent
              </button>
            </div>

            <div className="bento-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Utilisateur</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Rôle</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Email</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Dernière Connexion</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {loadingUsers ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-white/5" />
                        </tr>
                      ))
                    ) : allUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Aucun utilisateur trouvé</td>
                      </tr>
                    ) : (
                      allUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">{u.full_name}</span>
                                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">ID: {u.id.slice(0,8)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={cn(
                              "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              u.role === 'admin' ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" : 
                              u.role === 'agent' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                              "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.email || 'N/A'}</td>
                          <td className="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">{u.last_login ? formatDate(u.last_login) : 'Jamais'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                                <Settings className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id, u.full_name)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
            </div>
          </div>
        )}

        {/* CMS Tab */}
        {activeTab === 'cms' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Personnalisation du Contenu</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Modifiez les textes et images des pages de votre mairie</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Home Page CMS */}
              <div className="bento-card p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Page d'Accueil</h3>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const heroContent = {
                    title: formData.get('title'),
                    subtitle: formData.get('subtitle'),
                    badge: formData.get('badge'),
                  };
                  const budgetContent = {
                    title: formData.get('budget_title'),
                    description: formData.get('budget_desc'),
                    amount: formData.get('budget_amount'),
                    button_text: formData.get('budget_btn'),
                  };
                  
                  const p1 = supabase.from('page_sections').upsert({
                    tenant_id: tenant?.id,
                    page_id: 'home',
                    section_id: 'hero',
                    content: heroContent
                  }, { onConflict: 'tenant_id,page_id,section_id' });

                  const p2 = supabase.from('page_sections').upsert({
                    tenant_id: tenant?.id,
                    page_id: 'home',
                    section_id: 'budget',
                    content: budgetContent
                  }, { onConflict: 'tenant_id,page_id,section_id' });

                  const results = await Promise.all([p1, p2]);
                  if (results.some(r => r.error)) alert('Erreur lors de la mise à jour');
                  else alert('Contenu Accueil mis à jour !');
                }} className="space-y-6">
                  <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Section Hero</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Badge</label>
                      <input name="badge" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Transparence Municipale" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre</label>
                      <input name="title" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Titre principal" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sous-titre</label>
                      <textarea name="subtitle" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-24 resize-none" placeholder="Description courte" />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-4 border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Section Budget Participatif</p>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre</label>
                      <input name="budget_title" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Budget Participatif 2026" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                      <textarea name="budget_desc" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-24 resize-none" placeholder="Description du budget..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Montant</label>
                        <input name="budget_amount" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="500 millions FCFA" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Texte Bouton</label>
                        <input name="budget_btn" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Participer maintenant" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full py-4">
                    Enregistrer Accueil
                  </button>
                </form>
              </div>

              {/* Tourisme Page CMS */}
              <div className="bento-card p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Page Tourisme</h3>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const heroContent = {
                    title: formData.get('title'),
                    subtitle: formData.get('subtitle'),
                    image_url: formData.get('image_url'),
                  };
                  
                  const { error } = await supabase
                    .from('page_sections')
                    .upsert({
                      tenant_id: tenant?.id,
                      page_id: 'tourisme',
                      section_id: 'hero',
                      content: heroContent
                    }, { onConflict: 'tenant_id,page_id,section_id' });

                  if (error) alert(error.message);
                  else alert('Contenu Tourisme mis à jour !');
                }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre Hero</label>
                    <input name="title" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Explorez Za-Kpota" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sous-titre Hero</label>
                    <textarea name="subtitle" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-24 resize-none" placeholder="Description touristique..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Image Hero</label>
                    <input name="image_url" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://..." />
                  </div>
                  <button type="submit" className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">
                    Enregistrer Tourisme
                  </button>
                </form>
              </div>

              {/* Maire Page CMS */}
              <div className="bento-card p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Page du Maire</h3>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const bioContent = {
                    name: formData.get('name'),
                    photo_url: formData.get('photo_url'),
                  };
                  const visionContent = {
                    title: formData.get('vision_title'),
                    content: formData.get('vision_content'),
                  };
                  
                  const p1 = supabase.from('page_sections').upsert({
                    tenant_id: tenant?.id,
                    page_id: 'maire',
                    section_id: 'biography',
                    content: bioContent
                  }, { onConflict: 'tenant_id,page_id,section_id' });

                  const p2 = supabase.from('page_sections').upsert({
                    tenant_id: tenant?.id,
                    page_id: 'maire',
                    section_id: 'vision',
                    content: visionContent
                  }, { onConflict: 'tenant_id,page_id,section_id' });

                  const results = await Promise.all([p1, p2]);
                  if (results.some(r => r.error)) alert('Erreur lors de la mise à jour');
                  else alert('Contenu mis à jour !');
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom Complet du Maire</label>
                    <input name="name" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Félicien DANWOUIGNAN" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Photo du Maire</label>
                    <input name="photo_url" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre de la Vision</label>
                    <input name="vision_title" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Notre Vision" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contenu de la Vision / Mot du Maire</label>
                    <textarea name="vision_content" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-24 resize-none" placeholder="Le message du maire..." />
                  </div>
                  <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all">
                    Enregistrer Page Maire
                  </button>
                </form>
              </div>

              {/* News Page CMS */}
              <div className="bento-card p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Page Actualités</h3>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const content = {
                    title: formData.get('title'),
                    subtitle: formData.get('subtitle'),
                  };
                  
                  const { error } = await supabase
                    .from('page_sections')
                    .upsert({
                      tenant_id: tenant?.id,
                      page_id: 'news',
                      section_id: 'hero',
                      content
                    }, { onConflict: 'tenant_id,page_id,section_id' });

                  if (error) alert(error.message);
                  else alert('Contenu mis à jour !');
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Titre Hero</label>
                    <input name="title" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: E-Actualités" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sous-titre Hero</label>
                    <textarea name="subtitle" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all h-24 resize-none" placeholder="Description de la page news" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all">
                    Enregistrer Page News
                  </button>
                </form>
              </div>

              {/* Flash News Management */}
              <div className="lg:col-span-2 bento-card p-6 md:p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Flash Infos (Ticker)</h3>
                  </div>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const { error } = await supabase.from('flash_news').insert({
                    tenant_id: tenant?.id,
                    content: formData.get('content'),
                    priority: formData.get('priority'),
                    expires_at: formData.get('expires_at') || null
                  });

                  if (error) alert(error.message);
                  else {
                    alert('Flash info ajouté !');
                    (e.target as HTMLFormElement).reset();
                    fetchFlashNews();
                  }
                }} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Message Flash</label>
                    <input name="content" required className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-red-500 dark:focus:border-red-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: La mairie sera fermée ce vendredi..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Priorité</label>
                    <select name="priority" className="w-full px-5 py-3.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-red-500 dark:focus:border-red-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all appearance-none">
                      <option value="info">Information</option>
                      <option value="warning">Avertissement</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 pt-2">
                    <button type="submit" className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all">
                      Publier le Flash Info
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Flash Infos Actifs</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {loadingFlash ? (
                      <div className="h-16 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />
                    ) : flashNews.length === 0 ? (
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center py-8 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">Aucun flash info actif</p>
                    ) : (
                      flashNews.map(fn => (
                        <div key={fn.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#131B2B] rounded-2xl border border-gray-100 dark:border-white/5 group hover:border-red-200 dark:hover:border-red-500/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full shadow-sm",
                              fn.priority === 'urgent' ? "bg-red-500 shadow-red-500/50" : fn.priority === 'warning' ? "bg-amber-500 shadow-amber-500/50" : "bg-blue-500 shadow-blue-500/50"
                            )} />
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{fn.content}</p>
                          </div>
                          <button 
                            onClick={() => deleteFlashNews(fn.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Sondages Citoyens</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Créez et gérez les sondages pour recueillir l'avis des habitants</p>
              </div>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouveau Sondage
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {loadingPolls ? (
                [1,2].map(i => <div key={i} className="h-48 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />)
              ) : polls.length === 0 ? (
                <div className="text-center py-20 bento-card border-2 border-dashed border-gray-200 dark:border-white/10">
                  <Vote className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aucun sondage créé pour le moment</p>
                </div>
              ) : (
                polls.map(poll => (
                  <div key={poll.id} className="bento-card p-6 md:p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{poll.question}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Créé le {formatDate(poll.created_at)}</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (confirm('Supprimer ce sondage ?')) {
                            await supabase.from('polls').delete().eq('id', poll.id);
                            fetchPolls();
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {poll.poll_options?.map((opt: any) => (
                        <div key={opt.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 flex justify-between items-center group hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{opt.label}</span>
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                            {opt.votes_count || 0} votes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Partenaires Stratégiques</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Gérez les logos des partenaires qui s'affichent sur la page d'accueil</p>
              </div>
            </div>

            <div className="bento-card p-6 md:p-8">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const { error } = await supabase.from('partners').insert({
                  tenant_id: tenant?.id,
                  name: formData.get('name'),
                  logo_url: formData.get('logo_url'),
                  link: formData.get('link') || null,
                  order: Number(formData.get('order')) || 0
                });

                if (error) alert(error.message);
                else {
                  alert('Partenaire ajouté !');
                  (e.target as HTMLFormElement).reset();
                  fetchPartners();
                }
              }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom</label>
                  <input name="name" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Banque Mondiale" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Logo (ImgBB/Drive)</label>
                  <input name="logo_url" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lien Site Web</label>
                  <input name="link" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://..." />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary w-full py-3.5">
                    Ajouter Partenaire
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {loadingPartners ? (
                [1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />)
              ) : partners.map(partner => (
                <div key={partner.id} className="bento-card p-6 flex flex-col items-center justify-center group relative hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
                  <div className="aspect-square w-full flex items-center justify-center mb-4">
                    <img src={partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" referrerPolicy="no-referrer" />
                  </div>
                  <p className="text-[10px] font-bold text-center text-gray-900 dark:text-white uppercase tracking-widest">{partner.name}</p>
                  <button 
                    onClick={async () => {
                      if (confirm('Supprimer ce partenaire ?')) {
                        await supabase.from('partners').delete().eq('id', partner.id);
                        fetchPartners();
                      }
                    }}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Points d'Intérêt (POIs)</h2>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Gérez les lieux affichés sur la carte interactive</p>
              </div>
            </div>

            <div className="bento-card p-6 md:p-8">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const { error } = await supabase.from('locations').insert({
                  tenant_id: tenant?.id,
                  name: formData.get('name'),
                  category: formData.get('category'),
                  description: formData.get('description'),
                  image_url: formData.get('image_url'),
                  latitude: Number(formData.get('latitude')),
                  longitude: Number(formData.get('longitude'))
                });

                if (error) alert(error.message);
                else {
                  alert('Lieu ajouté !');
                  (e.target as HTMLFormElement).reset();
                  fetchLocations();
                }
              }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom du lieu</label>
                  <input name="name" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: Musée Historique" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Catégorie</label>
                  <select name="category" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all appearance-none">
                    <option value="tourisme">Tourisme</option>
                    <option value="mairie">Mairie</option>
                    <option value="ecole">Éducation</option>
                    <option value="sante">Santé</option>
                    <option value="marche">Marché</option>
                    <option value="culture">Culture</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL Image</label>
                  <input name="image_url" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</label>
                  <textarea name="description" rows={3} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all resize-none" placeholder="Description du lieu..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Latitude</label>
                  <input name="latitude" type="number" step="any" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: 6.365" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Longitude</label>
                  <input name="longitude" type="number" step="any" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" placeholder="Ex: 2.418" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="btn-primary w-full py-3.5">
                    Ajouter le Lieu
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingLocations ? (
                [1,2,3].map(i => <div key={i} className="h-48 bg-gray-50 dark:bg-white/5 rounded-2xl animate-pulse" />)
              ) : locations.map(loc => (
                <div key={loc.id} className="bento-card p-6 flex gap-4 group relative hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    {loc.image_url ? (
                      <img src={loc.image_url} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white truncate">{loc.name}</h3>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">{loc.category}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{loc.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                      <MapPin className="w-3 h-3" />
                      {loc.latitude}, {loc.longitude}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteLocation(loc.id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <Pagination total={totalItems} current={currentPage} onChange={setCurrentPage} />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bento-card p-6 md:p-8">
              <h3 className="text-2xl font-display font-bold mb-8 dark:text-white">Paramètres de la Commune</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Informations Générales</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom de la Commune</label>
                    <input defaultValue={tenant?.name} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Slug (URL)</label>
                    <input defaultValue={tenant?.slug} disabled className="w-full px-5 py-3.5 bg-gray-100 dark:bg-white/5 border border-transparent rounded-xl outline-none text-gray-400 cursor-not-allowed text-sm font-medium" />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Apparence</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Logo de la Mairie</label>
                    <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-[#131B2B] flex items-center justify-center border border-gray-100 dark:border-white/5 shrink-0">
                        {tenant?.logo_url ? (
                          <img src={tenant.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                      <div className="flex-grow space-y-2">
                        <input 
                          type="text" 
                          placeholder="URL du logo (https://...)"
                          defaultValue={tenant?.logo_url}
                          onBlur={async (e) => {
                            if (!tenant) return;
                            const { error } = await supabase
                              .from('tenants')
                              .update({ logo_url: e.target.value })
                              .eq('id', tenant.id);
                            if (error) alert(error.message);
                            else alert('Logo mis à jour !');
                          }}
                          className="w-full px-4 py-2.5 bg-white dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none text-xs font-medium dark:text-white transition-all" 
                        />
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Utilisez une URL directe vers l'image (PNG/JPG)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 pt-8 border-t border-gray-100 dark:border-white/5">
                  <button className="btn-primary px-8 py-4">
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity / Table */}
        {activeTab === 'dashboard' && (
          <div className="bento-card overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-display font-bold dark:text-white">Dossiers Récents</h3>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:flex-grow-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Rechercher un code..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500 rounded-xl text-sm font-medium outline-none dark:text-white transition-all"
                />
              </div>
              <button className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all shrink-0">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Code</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Citoyen</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Service</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loadingDossiers ? (
                  [1,2,3,4,5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-white/5" />
                    </tr>
                  ))
                ) : dossiers.slice(0, 5).map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">{d.tracking_code}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                      {d.citizen?.full_name || `${d.submission_data?.firstName} ${d.submission_data?.lastName}`}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                      {d.tenant_service?.service?.name}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">{formatDate(d.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        d.status_id === 'TERMINÉ' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                        d.status_id === 'REJETÉ' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}>
                        {d.status_id}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
      {/* Create Dossier Modal */}
      {isDossierModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Créer un Nouveau Dossier</h3>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Enregistrement direct par un agent</p>
              </div>
              <button onClick={() => setIsDossierModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={createDossier} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Prénom du Citoyen</label>
                  <input 
                    required
                    value={newDossier.firstName}
                    onChange={e => setNewDossier({...newDossier, firstName: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                    placeholder="Ex: Jean"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom du Citoyen</label>
                  <input 
                    required
                    value={newDossier.lastName}
                    onChange={e => setNewDossier({...newDossier, lastName: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                    placeholder="Ex: Dupont"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Téléphone</label>
                  <input 
                    required
                    value={newDossier.phone}
                    onChange={e => setNewDossier({...newDossier, phone: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                    placeholder="Ex: +229 00 00 00 00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">NPI (Optionnel)</label>
                  <input 
                    value={newDossier.npi}
                    onChange={e => setNewDossier({...newDossier, npi: e.target.value})}
                    className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                    placeholder="Ex: 123456789"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Service Municipal</label>
                <select 
                  required
                  value={newDossier.serviceId}
                  onChange={e => setNewDossier({...newDossier, serviceId: e.target.value})}
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-[#131B2B] border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl outline-none dark:text-white text-sm font-medium transition-all appearance-none"
                >
                  <option value="">Sélectionner un service...</option>
                  {publicServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full py-4">
                  Enregistrer le Dossier
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
