import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  Vote
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Pagination } from '../components/Pagination';

export const SuperAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    setCurrentPage(1);
    setTotalItems(0);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    fetchDepartments();
    if (activeTab === 'locations') fetchLocations();
    if (activeTab === 'users') fetchAllUsers();
  }, [activeTab, currentPage, pageSize]);

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    setDepartments(data || []);
  };

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const { data, count, error } = await supabase
        .from('locations')
        .select('*, tenants(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (error) throw error;
      setLocations(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, count, error } = await supabase
        .from('user_profiles')
        .select('*, tenants(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      if (error) throw error;
      setAllUsers(data || []);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUserInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setFeedback(null);

    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { error } = await supabase.from('invitations').insert({
        email: newUser.email,
        full_name: newUser.fullName,
        role: newUser.role,
        tenant_id: newUser.tenantId || null,
        token: token,
        invited_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      setFeedback({ type: 'success', msg: `Invitation envoyée avec succès à ${newUser.email}` });
      setNewUser({ email: '', fullName: '', role: 'agent', tenantId: '' });
    } catch (err: any) {
      console.error('Invite error:', err);
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const updateUserRole = async (userId: string, role: string, tenantId: string | null) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role, tenant_id: tenantId })
        .eq('id', userId);
      if (error) throw error;
      alert('Rôle mis à jour !');
      fetchAllUsers();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tenantsRes, usersRes, dossiersRes] = await Promise.all([
        supabase.from('tenants').select('*, departments(name), tenant_features(*)', { count: 'exact' }).order('created_at', { ascending: false }).range((currentPage - 1) * pageSize, currentPage * pageSize - 1),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('dossiers').select('*', { count: 'exact', head: true })
      ]);
      
      if (tenantsRes.error) throw tenantsRes.error;
      setTenants(tenantsRes.data || []);
      setTotalItems(tenantsRes.count || 0);
      setStats({
        totalTenants: tenantsRes.count || 0,
        activeUsers: usersRes.count || 0,
        totalDossiers: dossiersRes.count || 0,
        systemHealth: 'Optimal'
      });
    } catch (error) {
      console.error('Error fetching super admin data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        const { error } = await supabase
          .from('tenant_features')
          .insert({ tenant_id: tenantId, feature_id: featureKey });
        if (error) throw error;
      }
      fetchData();
    } catch (err: any) {
      alert('Erreur lors de la modification des fonctionnalités: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="w-64 h-screen sticky top-0 bg-white/60 dark:bg-[#131B2B]/60 backdrop-blur-xl border-r border-gray-200 dark:border-white/5 p-6 hidden lg:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 rounded-xl flex items-center justify-center text-white dark:text-gray-900 shadow-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">SaaS Console</span>
              <span className="text-sm font-display font-bold text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Super Admin</span>
            </div>
          </div>

          <nav className="space-y-2 flex-grow">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
              { id: 'tenants', label: 'Gestion Mairies', icon: Globe },
              { id: 'locations', label: 'Points d\'Intérêt', icon: MapPin },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'user-creation', label: 'Créer un Acteur', icon: Plus },
              { id: 'logs', label: 'Logs Système', icon: Activity },
              { id: 'config', label: 'Configuration Cloud', icon: Settings },
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => setActiveTab(item.id)}
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

          <div className="pt-4 border-t border-gray-200 dark:border-white/5">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-2 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Version Cloud</span>
              </div>
              <div className="text-[10px] font-mono font-bold text-gray-900 dark:text-white">v2.5.0-stable</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-grow p-6 md:p-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bento-card p-6 md:p-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Console de Gestion Globale</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Contrôle centralisé de toutes les instances MairieConnect.</p>
            </div>
            <button 
              onClick={() => setIsAddingTenant(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Déployer une Mairie
            </button>
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Mairies Actives', value: stats.totalTenants, icon: Globe, color: 'from-blue-500 to-cyan-400' },
                  { label: 'Utilisateurs Cloud', value: stats.activeUsers, icon: Users, color: 'from-purple-500 to-indigo-400' },
                  { label: 'Dossiers Traités', value: stats.totalDossiers, icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
                  { label: 'Santé Système', value: stats.systemHealth, icon: Activity, color: 'from-amber-500 to-orange-400' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bento-card p-6 group"
                  >
                    <div className="glow-effect" />
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Tenants Table */}
          {['overview', 'tenants'].includes(activeTab) && (
              <div className="bento-card overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Instances Déployées</h2>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl text-xs font-medium outline-none dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5">
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mairie / Commune</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Département</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modules</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {tenants.map((t, i) => {
                        const hasPolls = t.tenant_features?.some((f: any) => f.features?.key === 'citizen_voice' && f.is_enabled);
                        
                        return (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={t.logo_url} className="w-10 h-10 rounded-xl object-cover bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/10" alt={t.name} />
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</span>
                                <span className="text-[10px] text-gray-500 font-medium">{t.slug}.mairieconnect.bj</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.departments?.name}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", t.is_active ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500")} />
                              <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                                {t.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleFeature(t.id, 'citizen_voice', hasPolls)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                  hasPolls 
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                              >
                                <Vote className="w-3.5 h-3.5" />
                                Sondages
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button 
                                onClick={() => setEditingTenant(t)}
                                className="p-2 text-gray-400 hover:text-primary dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                      {locations.map((loc, i) => (
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
                  total={totalItems} 
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
                    {allUsers.length} Utilisateurs inscrits
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
                      allUsers
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
                              {tenants.map(t => (
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

          {['logs', 'config'].includes(activeTab) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bento-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Logs Système</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest leading-relaxed">
                  Surveillance en temps réel des activités système, erreurs et performances du cloud.
                </p>
                <div className="mt-6 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Opérationnel
                </div>
              </div>

              <div className="bento-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Configuration Cloud</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest leading-relaxed">
                  Paramètres globaux de l'infrastructure, clés API et quotas de ressources.
                </p>
                <div className="mt-6 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Opérationnel
                </div>
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
