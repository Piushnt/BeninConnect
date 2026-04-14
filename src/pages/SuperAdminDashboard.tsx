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
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

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

  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    fetchDepartments();
    if (activeTab === 'locations') fetchLocations();
  }, [activeTab]);

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('name');
    setDepartments(data || []);
  };

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*, tenants(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLocations(data || []);
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

  const fetchData = async () => {
    try {
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('*, departments(name)');
      
      setTenants(tenantsData || []);
      setStats(prev => ({ ...prev, totalTenants: tenantsData?.length || 0 }));
    } catch (error) {
      console.error('Error fetching super admin data:', error);
    } finally {
      setLoading(false);
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
              { id: 'users', label: 'Candidatures Admins', icon: Users },
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
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Mairies Actives', value: stats.totalTenants, icon: Globe, color: 'from-blue-500 to-cyan-400' },
                  { label: 'Utilisateurs Cloud', value: '12.4K', icon: Users, color: 'from-purple-500 to-indigo-400' },
                  { label: 'Dossiers Traités', value: '8.2K', icon: CheckCircle2, color: 'from-emerald-500 to-teal-400' },
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
                      {tenants.map((t, i) => (
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
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Actif</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2">
                              {[1, 2, 3, 4].map(m => (
                                <div key={m} className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-white dark:border-[#131B2B] flex items-center justify-center">
                                  <Settings className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                              ))}
                              <div className="w-8 h-8 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-2 border-white dark:border-[#131B2B] flex items-center justify-center text-[10px] font-bold">
                                +8
                              </div>
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
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center border-t border-gray-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Affichage de {tenants.length} instances</span>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">Précédent</button>
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Suivant</button>
                  </div>
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
              </div>
            </div>
          )}

          {['users', 'logs', 'config'].includes(activeTab) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bento-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Gestion des Utilisateurs</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest leading-relaxed">
                  Module de gestion centralisée des comptes administrateurs et citoyens à l'échelle nationale.
                </p>
                <div className="mt-6 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  En développement
                </div>
              </div>

              <div className="bento-card p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Logs Système</h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest leading-relaxed">
                  Surveillance en temps réel des activités système, erreurs et performances du cloud.
                </p>
                <div className="mt-6 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  En développement
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
                <div className="mt-6 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  En développement
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

                try {
                  const { error } = await supabase
                    .from('tenants')
                    .insert({
                      name,
                      slug,
                      department_id,
                      logo_url: logo_url || 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&q=80&w=200&h=200',
                      is_active: true
                    });

                  if (error) throw error;
                  
                  alert('Mairie déployée avec succès !');
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
