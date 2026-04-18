import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { 
  Globe, 
  Plus, 
  Settings, 
  Users, 
  Shield, 
  Activity, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ChevronRight,
  Database,
  LayoutDashboard,
  MapPin,
  ImageIcon,
  Trash2,
  Vote,
  ExternalLink,
  ShieldAlert,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Pagination } from '../components/Pagination';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeUsers: 0,
    totalDossiers: 0,
    systemHealth: 'Optimal'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'agent',
    tenantId: ''
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const [globalServices, setGlobalServices] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const { data: qTenants, isLoading: qLoadingTenants, refetch: rTenants } = useQuery({
    queryKey: ['tenants', currentPage, pageSize],
    queryFn: async () => {
      const db = await supabase.from('tenants')
        .select('*, departments(name), tenant_features(features(*), is_enabled)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (db.error) throw db.error;
      return db;
    },
    enabled: ['overview', 'tenants'].includes(activeTab)
  });

  const { data: qLocations, isLoading: qLoadingLocations, refetch: rLocations } = useQuery({
    queryKey: ['locations', currentPage, pageSize],
    queryFn: async () => {
      const db = await supabase.from('locations').select('*, tenants(name)', { count: 'exact' }).order('created_at', { ascending: false }).range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (db.error) throw db.error;
      return db;
    },
    enabled: activeTab === 'locations'
  });

  const { data: qUsers, isLoading: qLoadingUsers, refetch: rUsers } = useQuery({
    queryKey: ['users', currentPage, pageSize],
    queryFn: async () => {
      const db = await supabase.from('user_profiles').select('*, tenants(name)', { count: 'exact' }).order('created_at', { ascending: false }).range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (db.error) throw db.error;
      return db;
    },
    enabled: activeTab === 'users'
  });

  const { data: qLogs, isLoading: qLoadingLogs } = useQuery({
    queryKey: ['audit_logs', currentPage, pageSize],
    queryFn: async () => {
      // Pour éviter les erreurs si la table n'existe pas on gère silencieusement l'erreur
      const db = await supabase.from('audit_logs').select('*, user:user_id(full_name, email)', { count: 'exact' }).order('created_at', { ascending: false }).range((currentPage - 1) * pageSize, currentPage * pageSize - 1).catch(() => ({ data: [], count: 0 }));
      return db;
    },
    enabled: activeTab === 'logs'
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    fetchDepartments();
    if (activeTab === 'locations') fetchLocations();
    if (activeTab === 'users') fetchAllUsers();
    if (activeTab === 'logs') fetchAuditLogs();
    if (activeTab === 'config') fetchGlobalServices();
  }, [activeTab, currentPage, pageSize]);

  // Données dérivées des Queries
  const { data: tenantsData = [], count: tenantsCount = 0 } = qTenants || { data: [], count: 0 };
  const { data: usersData = [], count: usersCount = 0 } = qUsers || { data: [], count: 0 };
  const { data: locationsData = [], count: locationsCount = 0 } = qLocations || { data: [], count: 0 };
  const { data: logsData = [], count: logsCount = 0 } = qLogs || { data: [], count: 0 };

  const loading = qLoadingTenants;
  const loadingLocations = qLoadingLocations;
  const loadingUsers = qLoadingUsers;
  const loadingLogs = qLoadingLogs;

  const totalItemsRender = 
    activeTab === 'locations' ? locationsCount : 
    activeTab === 'users' ? usersCount : 
    activeTab === 'logs' ? logsCount : tenantsCount;

  const toggleFeature = async (tenantId: string, featureKey: string, isActive: boolean) => {
    try {
      if (isActive) {
        // Remove feature
        const { error } = await supabase
          .from('tenant_features')
          .delete()
          .eq('tenant_id', tenantId)
          .eq('feature_id', featureKey);
        if (error) throw error;
      } else {
        // Add feature
        const { error: featErr, data: feature } = await supabase.from('features').select('id').eq('key', featureKey).single();
        if (featErr) throw featErr;
        const { error } = await supabase
          .from('tenant_features')
          .insert({ tenant_id: tenantId, feature_id: feature.id });
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    } catch (err: any) {
      alert('Erreur lors de la modification des fonctionnalités: ' + err.message);
    }
  };

  const toggleGlobalService = async (serviceId: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from('public_services').update({ is_active: !currentState }).eq('id', serviceId);
      if (error) throw error;
      // Refetch via react query invalidate could be here if globalServices was react-query
    } catch (err) {
      alert('Erreur: ' + err);
    }
  };

  const handleCreateUserInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setFeedback(null);
    try {
      const { error } = await supabase.rpc('create_admin_user', {
        x_email: newUser.email,
        x_full_name: newUser.fullName,
        x_role: newUser.role,
        x_tenant_id: newUser.tenantId || null
      });
      if (error) throw error;
      setFeedback({ type: 'success', msg: `Utilisateur créé avec succès : ${newUser.email}` });
      setNewUser({ email: '', fullName: '', role: 'agent', tenantId: '' });
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'La table des invitations est manquante, création RPC requise.' });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const updateUserRole = async (userId: string, role: string, tenantId: string | null) => {
    try {
      const { error } = await supabase.from('user_profiles').update({ role, tenant_id: tenantId }).eq('id', userId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    }
  };

  const deleteLocation = async (id: string) => {
    if (!window.confirm('Supprimer ce point d\'intérêt ?')) return;
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background Glow Effects (Neo-Glassmorphism) */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex relative z-10">
        {/* Sidebar - Floating Glass Effect */}
        <aside className="w-72 h-[calc(100vh-48px)] sticky top-6 ml-6 my-6 bg-white/40 dark:bg-[#131B2B]/40 backdrop-blur-2xl border border-white/40 dark:border-white/5 p-8 hidden lg:flex flex-col shadow-2xl rounded-[40px] overflow-hidden">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-2xl flex items-center justify-center text-white dark:text-gray-900 shadow-xl group-hover:rotate-6 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary dark:text-emerald-400 uppercase tracking-[0.3em] leading-tight mb-1">Bénin Connect</span>
              <span className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Console</span>
            </div>
          </div>

          <nav className="space-y-3 flex-grow">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'tenants', label: 'Town Halls', icon: Globe },
              { id: 'locations', label: 'Map POIs', icon: MapPin },
              { id: 'users', label: 'Accounts', icon: Users },
              { id: 'user-creation', label: 'Management', icon: Plus },
              { id: 'logs', label: 'System Logs', icon: Activity },
              { id: 'config', label: 'Cloud API', icon: Settings },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group",
                  activeTab === item.id 
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl" 
                    : "text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {activeTab === item.id && (
                  <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl" />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 transition-transform group-hover:scale-110", activeTab === item.id ? "text-secondary dark:text-primary" : "")} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}

            <div className="pt-8 space-y-3">
              <h4 className="px-5 text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Portails Externes</h4>
              <button 
                onClick={() => navigate('/ministerial-dashboard')}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all group"
              >
                <ShieldAlert className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Ministère</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={() => {
                  const firstTenant = tenants[0];
                  if (firstTenant) navigate(`/${firstTenant.slug}/admin-portal`);
                  else alert("Aucune mairie active pour la redirection.");
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all group"
              >
                <Building2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>Mairie Admin</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
              </button>
            </div>
          </nav>

          <div className="pt-6 border-t border-gray-100 dark:border-white/10 mt-auto">
            <div className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Environment</span>
              </div>
              <div className="text-[11px] font-mono font-bold text-gray-900 dark:text-white uppercase">Cloud-BJ-V2.5</div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow p-6 lg:p-12 max-w-[1500px] mx-auto space-y-12">
          {/* Top Navigation / Breadcrumbs Equivalent */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-4">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white tracking-tighter uppercase">
                {activeTab === 'overview' ? 'Global Command' : activeTab.replace('-', ' ')}
              </h1>
              <div className="flex items-center gap-4">
                <div className="h-1.5 w-16 bg-primary rounded-full" />
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Infrastructure & Access Control</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="btn-glass flex items-center gap-3">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">System OK</span>
              </button>
              <button 
                onClick={() => setIsAddingTenant(true)}
                className="btn-primary group"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                  <span>Deploy New Instance</span>
                </div>
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          {activeTab === 'user-creation' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bento-card p-8 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-display font-bold mb-2 uppercase tracking-tight">Nouvel Enregistrement Officiel</h2>
                  <p className="opacity-80 text-sm max-w-md font-medium">Inscrivez les maires, agents techniques et chefs d'arrondissements pour ouvrir leurs accès administratifs.</p>
                </div>
                <Users className="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12" />
              </div>

              <div className="bento-card p-8">
                {feedback && (
                  <div className={cn(
                    "p-4 rounded-2xl mb-6 text-sm font-bold animate-in fade-in slide-in-from-top-4",
                    feedback.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {feedback.msg}
                  </div>
                )}

                <form onSubmit={handleCreateUserInvite} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Nom Complet</label>
                      <input 
                        type="text"
                        required
                        value={newUser.fullName}
                        onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                        className="w-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 text-sm font-bold transition-all"
                        placeholder="Ex: Jean GLOIRE"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Adresse Email</label>
                      <input 
                        type="email"
                        required
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                        className="w-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 text-sm font-bold transition-all"
                        placeholder="jean@mairie.bj"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Rôle Système</label>
                      <select 
                        value={newUser.role}
                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                        className="w-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 text-sm font-bold transition-all"
                      >
                        <option value="citizen">Citoyen Béninois</option>
                        <option value="agent">Agent de Mairie</option>
                        <option value="admin">Administrateur (Maire/Adjoint)</option>
                        <option value="ca_admin">Chef d'Arrondissement</option>
                        <option value="super_admin">Super Administrateur</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Commune Assignée</label>
                      <select 
                        value={newUser.tenantId}
                        onChange={e => setNewUser({...newUser, tenantId: e.target.value})}
                        className="w-full bg-gray-100 dark:bg-white/5 border-transparent focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 text-sm font-bold transition-all"
                      >
                        <option value="">Administration Centrale (Supérieure)</option>
                        {tenants.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isCreatingUser}
                      className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest shadow-xl shadow-gray-900/10 dark:shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isCreatingUser ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isCreatingUser ? 'Enregistrement...' : 'Valider l\'Enregistrement'}
                    </button>
                    <p className="text-[9px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">L'utilisateur pourra ensuite activer son compte via son adresse email.</p>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Mairies Actives', value: tenantsCount, icon: Globe, color: 'from-blue-600 to-cyan-500' },
                  { label: 'Utilisateurs Cloud', value: usersCount || 0, icon: Users, color: 'from-[#008751] to-emerald-400' },
                  { label: 'Dossiers Traités', value: stats.totalDossiers, icon: CheckCircle2, color: 'from-[#EBB700] to-amber-300' },
                  { label: 'Santé Système', value: stats.systemHealth, icon: Activity, color: 'from-rose-600 to-pink-500' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
                    className="card-glass p-8 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 blur-2xl group-hover:blur-3xl transition-all" />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tighter">
                        {stat.value}
                      </span>
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                        {stat.label}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Tenants Table */}
          {['overview', 'tenants'].includes(activeTab) && (
            <div className="card-glass overflow-hidden border-none shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
              <div className="p-10 border-b border-gray-100 dark:border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Town Halls</h2>
                  <div className="h-1 w-12 bg-primary rounded-full" />
                </div>
                <div className="relative w-full lg:w-96 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="Filter instances..."
                    className="w-full h-full pl-16 pr-6 py-5 bg-gray-50 shadow-inner dark:bg-white/5 border border-transparent focus:border-primary/20 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] outline-none dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Municipality</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Location</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">System Status</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Service Modules</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {loading ? (
                      [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-10 py-10 bg-gray-50 dark:bg-white/5 animate-pulse" /></tr>)
                    ) : tenantsData.map((t: any, i: number) => {
                      const hasPolls = t.tenant_features?.some((f: any) => f.features?.key === 'citizen_voice' && f.is_enabled);
                      return (
                      <motion.tr 
                        key={t.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-500 group"
                      >
                        <td className="px-10 py-10">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                              <img src={t.logo_url} className="w-[60px] h-[60px] rounded-[22px] object-cover bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-white/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 relative z-10" alt={t.name} />
                              {t.is_active && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full z-20" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[15px] font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{t.name}</span>
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{t.slug}.mairieconnect.bj</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                               <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t.departments?.name}</span>
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className={cn(
                             "inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all",
                             t.is_active 
                                ? "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100/50 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                : "bg-rose-50/50 dark:bg-rose-500/10 border-rose-100/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
                          )}>
                            <div className={cn("w-2 h-2 rounded-full", t.is_active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-500")} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.is_active ? 'Active' : 'Offline'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="flex flex-wrap gap-2">
                             <button 
                                onClick={() => toggleFeature(t.id, 'citizen_voice', hasPolls)}
                                className={cn(
                                  "px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-3 shadow-inner border",
                                  hasPolls 
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20" 
                                    : "bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-white/5"
                                )}
                              >
                                <Vote className="w-3.5 h-3.5" />
                                Voice
                                {hasPolls && <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />}
                              </button>
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                            <button 
                               onClick={() => setEditingTenant(t)}
                               className="p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-xl hover:-translate-y-1"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                            <button className="p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-400 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-xl hover:-translate-y-1">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )})}
                  </tbody>
                </table>
              </div>

              <div className="p-10 border-t border-gray-100 dark:border-white/5">
                <Pagination 
                  total={totalItemsRender} 
                  current={currentPage} 
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="bento-card overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Tous les Points d'Intérêt</h2>
                  <div className="flex gap-3">
                    <button className="btn-glass text-gray-900 dark:text-white">Exporter CSV</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lieu</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mairie</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Catégorie</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Coordonnées</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {loadingLocations ? (
                        [1,2].map(i => <tr key={i}><td colSpan={5} className="px-6 py-6 bg-gray-50 animate-pulse" /></tr>)
                      ) : locationsData.map((loc: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0">
                                {loc.image_url ? (
                                  <img src={loc.image_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{loc.name}</span>
                                <span className="text-[10px] text-gray-500 font-medium line-clamp-1 max-w-[200px]">{loc.description}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{loc.tenants?.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {loc.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-mono text-gray-500">{loc.latitude}, {loc.longitude}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <button 
                                onClick={() => deleteLocation(loc.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination 
                  total={totalItemsRender} 
                  current={currentPage} 
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bento-card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs & Rôles</h2>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {usersCount} Utilisateurs inscrits
                  </div>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-xl text-xs font-bold outline-none dark:text-white transition-all"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Utilisateur</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rôle Actuel</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Commune Assignée</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {loadingUsers ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-6 py-8 bg-gray-50/50 dark:bg-white/5" />
                        </tr>
                      ))
                    ) : (
                      usersData
                        .filter(u => 
                          u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email?.toLowerCase().includes(userSearch.toLowerCase())
                        )
                        .map((u, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{u.full_name || 'Sans nom'}</span>
                                <span className="text-[10px] text-gray-500 font-mono">{u.email || u.id.slice(0, 18) + '...'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value, u.tenant_id)}
                              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none dark:text-white cursor-pointer"
                            >
                              <option value="citizen">Citoyen</option>
                              <option value="agent">Agent</option>
                              <option value="admin">Administrateur</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select 
                              value={u.tenant_id || ''}
                              onChange={(e) => updateUserRole(u.id, u.role, e.target.value || null)}
                              className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none dark:text-white cursor-pointer max-w-[200px]"
                            >
                              <option value="">Aucune (National)</option>
                              {tenantsData.map((t: any) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                              <Shield className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination 
                total={totalItems} 
                current={currentPage} 
                pageSize={pageSize}
                onChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}

          {['logs'].includes(activeTab) && (
            <div className="bento-card overflow-hidden">
               <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Logs & Activités Système</h2>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     Tracking Actif
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date & Heure</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Utilisateur</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Entité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5">
                          <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                             {new Date(log.created_at).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-col">
                               <span className="text-sm font-bold text-gray-900 dark:text-white">{log.user?.full_name || 'Système'}</span>
                               <span className="text-[10px] text-gray-500">{log.user?.email || 'N/A'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={cn(
                               "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                               log.action === 'CREATE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                               log.action === 'UPDATE' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                               log.action === 'DELETE' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                               'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
                             )}>
                               {log.action}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-gray-500">
                             {log.entity_type} {log.entity_id ? `(${log.entity_id.split('-')[0]}...)` : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
               <Pagination 
                 total={totalItems} 
                 current={currentPage} 
                 pageSize={pageSize}
                 onChange={setCurrentPage}
                 onPageSizeChange={setPageSize}
               />
            </div>
          )}

          {['config'].includes(activeTab) && (
            <div className="space-y-6">
              <div className="bento-card p-6 md:p-8 border-b border-gray-100 dark:border-white/5">
                <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Catalogue National des E-Services</h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Activez ou désactivez globalement les services pour toutes les communes</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {globalServices.map(service => (
                   <div key={service.id} className="card-glass p-6 space-y-4">
                      <div className="flex justify-between items-start">
                         <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{service.category}</span>
                         <button 
                           onClick={() => toggleGlobalService(service.id, service.is_active)}
                           className={cn(
                             "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                             service.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                           )}
                         >
                           {service.is_active ? 'Globalement Actif' : 'Désactivé'}
                         </button>
                      </div>
                      <div>
                         <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-tight mb-2">{service.name}</h3>
                         <p className="text-xs text-gray-500 line-clamp-2">{service.description}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Modifier la Mairie</h3>
              <button onClick={() => setEditingTenant(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const { error } = await supabase
                  .from('tenants')
                  .update({
                    name: formData.get('name'),
                    logo_url: formData.get('logo_url'),
                    is_active: formData.get('is_active') === 'true'
                  })
                  .eq('id', editingTenant.id);

                if (error) alert(error.message);
                else {
                  alert('Mairie mise à jour !');
                  setEditingTenant(null);
                  fetchData();
                }
              }}
              className="p-6 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom de la Mairie</label>
                <input 
                  name="name"
                  defaultValue={editingTenant.name}
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL du Logo</label>
                <input 
                  name="logo_url"
                  defaultValue={editingTenant.logo_url}
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</label>
                <select 
                  name="is_active"
                  defaultValue={editingTenant.is_active ? 'true' : 'false'}
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all appearance-none"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full py-4 text-xs">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {isAddingTenant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Déployer une Mairie</h3>
              <button onClick={() => setIsAddingTenant(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const slug = formData.get('slug') as string;
                const department_id = formData.get('department_id') as string;
                const logo_url = formData.get('logo_url') as string;

                const adminEmail = formData.get('admin_email') as string;

                try {
                  const { data: newTenant, error: tenantError } = await supabase
                    .from('tenants')
                    .insert({
                      name,
                      slug,
                      department_id,
                      logo_url: logo_url || 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=200&h=200',
                      is_active: true
                    })
                    .select()
                    .single();

                  if (tenantError) throw tenantError;

                  // Initialize the tenant (RPC call)
                  const { error: initError } = await supabase.rpc('initialize_tenant', { t_id: newTenant.id });
                  if (initError) throw initError;

                  // Assign admin if email provided
                  if (adminEmail) {
                    const { data: userData } = await supabase
                      .from('user_profiles')
                      .select('id')
                      .eq('email', adminEmail)
                      .maybeSingle();
                    
                    if (userData) {
                      await supabase
                        .from('user_profiles')
                        .update({ role: 'admin', tenant_id: newTenant.id })
                        .eq('id', userData.id);
                    }
                  }
                  
                  alert('Mairie déployée et initialisée avec succès !');
                  setIsAddingTenant(false);
                  fetchData();
                } catch (error: any) {
                  alert(`Erreur lors du déploiement: ${error.message}`);
                }
              }}
              className="p-6 space-y-5"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom de la Mairie</label>
                <input 
                  name="name"
                  placeholder="Ex: Mairie de Cotonou"
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Slug (URL)</label>
                <input 
                  name="slug"
                  placeholder="Ex: cotonou"
                  required
                  pattern="[a-z0-9-]+"
                  title="Uniquement des lettres minuscules, des chiffres et des tirets"
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                />
                <p className="text-[10px] font-medium text-gray-400">Ce slug sera utilisé pour l'URL (ex: cotonou.mairieconnect.bj)</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Département</label>
                <select 
                  name="department_id"
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all appearance-none"
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">URL du Logo (Optionnel)</label>
                <input 
                  name="logo_url"
                  placeholder="https://..."
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email de l'Administrateur (Optionnel)</label>
                <input 
                  name="admin_email"
                  type="email"
                  placeholder="admin@mairie.bj"
                  className="w-full px-5 py-3.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl outline-none dark:text-white text-sm font-medium transition-all"
                />
                <p className="text-[10px] font-medium text-gray-400">L'utilisateur doit déjà avoir un compte pour être assigné.</p>
              </div>
              <div className="pt-4">
                <button type="submit" className="btn-primary w-full py-4 text-xs">
                  Déployer l'Instance
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
