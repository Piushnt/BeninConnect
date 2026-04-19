import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Globe, 
  Map as MapIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Settings,
  Bell
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Pagination } from '../components/Pagination';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const MinisterialDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUsers: 0,
    totalDossiers: 0,
    totalRevenue: 0,
    activeServices: 0,
    pendingSignalements: 0
  });
  const [dossierStats, setDossierStats] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any[]>([]);

  const queryClient = useQueryClient();

  const { data: qNationalData, isLoading: loadingOverview } = useQuery({
    queryKey: ['national_overview', currentPage, pageSize],
    queryFn: async () => {
      const [rpcRes, tenantsListRes, dossiersListRes] = await Promise.all([
        supabase.rpc('get_national_statistics'),
        supabase.from('tenants').select('*, department:departments(name)', { count: 'exact' }).order('name').range((currentPage - 1) * pageSize, currentPage * pageSize - 1),
        supabase.from('dossiers').select('*, tenant:tenants(name), citizen:user_profiles(full_name)').order('created_at', { ascending: false }).limit(5)
      ]);

      const rpcData = rpcRes.data || {};

      return {
        stats: {
          totalTenants: rpcData.totalTenants || 0,
          totalUsers: rpcData.totalUsers || 0,
          totalDossiers: rpcData.totalDossiers || 0,
          totalRevenue: rpcData.totalRevenue || 0,
          activeServices: rpcData.activeServices || 0,
          pendingSignalements: rpcData.pendingSignalements || 0
        },
        tenants: tenantsListRes.data || [],
        tenantsCount: tenantsListRes.count || 0,
        recentDossiers: dossiersListRes.data || []
      };
    },
    enabled: activeTab === 'overview'
  });

  const { data: qServices, isLoading: loadingServices } = useQuery({
    queryKey: ['national_services'],
    queryFn: async () => {
      const res = await supabase.from('public_services').select('*').order('category').order('name');
      return res.data || [];
    },
    enabled: activeTab === 'services'
  });

  const { data: qAlerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['national_alerts'],
    queryFn: async () => {
      const res = await supabase.from('signalements').select('*, tenant:tenants(name), citizen:user_profiles(full_name)').order('created_at', { ascending: false });
      return res.data || [];
    },
    enabled: activeTab === 'alerts'
  });

  const generateChartData = async () => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const [dossiersChartRes, paymentsChartRes] = await Promise.all([
        supabase.from('dossiers').select('created_at').gte('created_at', sixMonthsAgo.toISOString()),
        supabase.from('payments').select('amount, created_at').eq('status', 'success').gte('created_at', sixMonthsAgo.toISOString())
      ]);
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last6Months.push({ name: months[d.getMonth()], month: d.getMonth(), year: d.getFullYear(), value: 0, revenue: 0 });
      }
      dossiersChartRes.data?.forEach(d => {
        const date = new Date(d.created_at);
        const mData = last6Months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
        if (mData) mData.value++;
      });
      paymentsChartRes.data?.forEach(p => {
        const date = new Date(p.created_at);
        const mData = last6Months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
        if (mData) mData.revenue += Number(p.amount);
      });
      setDossierStats(last6Months.map(m => ({ name: m.name, value: m.value })));
      setRevenueStats(last6Months.map(m => ({ name: m.name, value: m.revenue })));
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    generateChartData();
  }, []);

  const toggleNationalService = async (serviceId: string, currentState: boolean) => {
    try {
      const { error } = await supabase.from('public_services').update({ is_active: !currentState }).eq('id', serviceId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['national_services'] });
    } catch(err) { alert('Error: ' + err); }
  };

  const moderateAlert = async (alertId: string, status: string) => {
    try {
      const { error } = await supabase.from('signalements').update({ status }).eq('id', alertId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['national_alerts'] });
    } catch(err) { alert('Error: ' + err); }
  };

  const currentStats = qNationalData?.stats || stats;
  const currentTenants = qNationalData?.tenants || [];
  const currentTenantsCount = qNationalData?.tenantsCount || 0;
  const recentOverviewDossiers = qNationalData?.recentDossiers || [];


  const COLORS = ['#008751', '#EBB700', '#E30613', '#004d2c', '#1a1a1a'];

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] p-4 lg:p-8 transition-colors relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bento-card p-6 md:p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ministère du Numérique et de la Digitalisation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Tableau de Bord National</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">Gouvernance Augmentée • Vue Globale</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-glass flex items-center gap-2 text-gray-900 dark:text-white">
              <Download className="w-4 h-4" />
              Exporter Rapport
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Vue Publique
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-[20px] max-w-fit shadow-inner">
          {[
            { id: 'overview', label: 'Vue Globale', icon: LayoutDashboard },
            { id: 'services', label: 'Services Nationaux', icon: Settings },
            { id: 'alerts', label: 'Observatoire des Alertes', icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all relative z-10",
                activeTab === tab.id ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xl" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Key Metrics - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            { label: 'Communes Déployées', value: currentStats.totalTenants, icon: Building2, trend: '+2 ce mois', color: 'from-blue-500 to-cyan-400' },
            { label: 'Citoyens Connectés', value: currentStats.totalUsers.toLocaleString(), icon: Users, trend: '+12% vs mai', color: 'from-emerald-500 to-teal-400' },
            { label: 'Dossiers Traités', value: currentStats.totalDossiers.toLocaleString(), icon: FileText, trend: '+5.4k aujourd\'hui', color: 'from-purple-500 to-indigo-400' },
            { label: 'Recettes Globales', value: `${currentStats.totalRevenue.toLocaleString()} FCFA`, icon: TrendingUp, trend: '+8% vs Q1', color: 'from-amber-500 to-orange-400' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bento-card p-8 group"
            >
              <div className="glow-effect" />
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${metric.color} text-white shadow-lg`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {metric.trend}
                </span>
              </div>
              <div>
                <h3 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-1">{metric.value}</h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">{metric.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bento-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Activité des Dossiers</h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Volume mensuel</p>
              </div>
              <select className="bg-gray-100 dark:bg-white/5 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2 outline-none dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <option>6 derniers mois</option>
                <option>Cette année</option>
              </select>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dossierStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                    contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="url(#colorDossiers)" radius={[12, 12, 0, 0]} barSize={32} />
                  <defs>
                    <linearGradient id="colorDossiers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bento-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Évolution des Recettes</h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">En FCFA</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Direct</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Communes List */}
          <div className="xl:col-span-2 bento-card overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Performance par Commune</h3>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-1">Top 10 des communes les plus actives</p>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-gray-200 dark:focus:border-white/10 rounded-xl text-xs font-medium outline-none dark:text-white transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Commune</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Département</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dossiers</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {loadingOverview ? (
                    [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-6 py-6 bg-gray-50/50 animate-pulse" /></tr>)
                  ) : currentTenants.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0">
                            {t.logo_url ? (
                              <img src={t.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Building2 className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t.department?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", t.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500")} />
                          <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">
                            {t.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">1,234</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-primary dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination 
              total={currentTenantsCount} 
              current={currentPage} 
              pageSize={pageSize}
              onChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>

          {/* Recent Activity */}
          <div className="bento-card p-6 md:p-8 flex flex-col">
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-8">Derniers Dossiers</h3>
            <div className="space-y-6 flex-grow">
              {recentOverviewDossiers.map((d: any, i: number) => (
                <div key={d.id} className="flex gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all shrink-0 border border-gray-100 dark:border-white/5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-grow min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {d.citizen?.full_name}
                      </h4>
                      <span className="text-[10px] font-medium text-gray-400 shrink-0">
                        {formatDate(d.created_at)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 truncate">
                      {d.tenant?.name} • <span className="font-mono text-[10px]">{d.tracking_code}</span>
                    </p>
                    <div className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      d.status_id === 'TERMINÉ' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    )}>
                      {d.status_id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold transition-all">
              Voir tout l'historique
            </button>
          </div>
        </div>
          </motion.div>
        )}

        {/* Tab Services */}
        {activeTab === 'services' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bento-card overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-white/5">
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Catalogue National des Services Publics</h3>
              <p className="text-gray-500 uppercase tracking-widest text-[10px] font-bold mt-1">Activation/Désactivation à l'échelle du territoire</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-white/5">
                  <tr>
                    <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-500">Service</th>
                    <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-500">Catégorie</th>
                    <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-500">Tarif Modèle</th>
                    <th className="px-8 py-4 text-left text-[10px] uppercase font-bold text-gray-500">Statut National</th>
                    <th className="px-8 py-4 text-right text-[10px] uppercase font-bold text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {loadingServices ? (
                    <tr><td colSpan={5} className="px-8 py-6 bg-gray-50/50 animate-pulse text-center">Chargement...</td></tr>
                  ) : (
                    qServices?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4 text-sm font-bold text-gray-900 dark:text-white">{s.name}</td>
                        <td className="px-8 py-4 text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">{s.category}</td>
                        <td className="px-8 py-4 text-xs font-mono dark:text-white">{s.base_price} FCFA</td>
                        <td className="px-8 py-4">
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", s.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                            {s.is_active ? 'Actif' : 'Coupé'}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button 
                            onClick={() => toggleNationalService(s.id, s.is_active)}
                            className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-white", s.is_active ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600")}
                          >
                            {s.is_active ? 'Suspendre' : 'Activer'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Tab Alertes */}
        {activeTab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bento-card p-6 border-l-4 border-l-amber-500">
                <h4 className="text-[10px] uppercase font-bold text-gray-500">Alertes Actives</h4>
                <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-2">{qAlerts?.filter((a: any) => a.status === 'pending').length || 0}</p>
              </div>
            </div>

            <div className="bento-card overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Observatoire National des Alertes</h3>
              </div>
              <div className="p-4 grid gap-4">
                {loadingAlerts ? (
                  <div className="p-8 text-center text-gray-500 animate-pulse">Scan en cours...</div>
                ) : qAlerts?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Aucune alerte civique sur le territoire.</div>
                ) : (
                  qAlerts?.map((alert: any) => (
                    <div key={alert.id} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                      {alert.image_url && (
                        <img src={alert.image_url} alt="" className="w-full md:w-48 h-32 object-cover rounded-xl shrink-0" />
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{alert.title}</h4>
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", alert.status === 'resolved' ? "bg-emerald-50 text-emerald-600" : alert.status === 'rejected' ? "bg-gray-200 text-gray-600" : "bg-amber-50 text-amber-600")}>
                            {alert.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {alert.tenant?.name}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {alert.citizen?.full_name}</span>
                        </div>
                        {alert.status === 'pending' && (
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                            <button onClick={() => moderateAlert(alert.id, 'resolved')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Prendre en charge</button>
                            <button onClick={() => moderateAlert(alert.id, 'rejected')} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Rejeter</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
