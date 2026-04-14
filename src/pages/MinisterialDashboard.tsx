import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
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
  LayoutDashboard
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
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
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUsers: 0,
    totalDossiers: 0,
    totalRevenue: 0,
    activeServices: 0,
    pendingSignalements: 0
  });
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [recentDossiers, setRecentDossiers] = useState<any[]>([]);
  const [dossierStats, setDossierStats] = useState<any[]>([]);
  const [revenueStats, setRevenueStats] = useState<any[]>([]);

  useEffect(() => {
    fetchNationalData();
  }, []);

  const fetchNationalData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [
        tenantsRes, 
        usersRes, 
        dossiersRes, 
        paymentsRes, 
        servicesRes,
        signalementsRes
      ] = await Promise.all([
        supabase.from('tenants').select('*', { count: 'exact' }),
        supabase.from('user_profiles').select('*', { count: 'exact' }),
        supabase.from('dossiers').select('*', { count: 'exact' }),
        supabase.from('payments').select('amount').eq('status', 'success'),
        supabase.from('public_services').select('*', { count: 'exact' }).eq('is_active', true),
        supabase.from('signalements').select('*', { count: 'exact' }).eq('status', 'pending')
      ]);

      const totalRevenue = (paymentsRes.data || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

      setStats({
        totalTenants: tenantsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalDossiers: dossiersRes.count || 0,
        totalRevenue,
        activeServices: servicesRes.count || 0,
        pendingSignalements: signalementsRes.count || 0
      });

      // Fetch tenants with their stats
      const { data: tenantsData } = await supabase
        .from('tenants')
        .select('*, department:departments(name)')
        .limit(10);
      setTenants(tenantsData || []);

      // Fetch recent dossiers
      const { data: dossiersData } = await supabase
        .from('dossiers')
        .select('*, tenant:tenants(name), citizen:user_profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentDossiers(dossiersData || []);

      // Fetch chart data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [dossiersChartRes, paymentsChartRes] = await Promise.all([
        supabase
          .from('dossiers')
          .select('created_at')
          .gte('created_at', sixMonthsAgo.toISOString()),
        supabase
          .from('payments')
          .select('amount, created_at')
          .eq('status', 'success')
          .gte('created_at', sixMonthsAgo.toISOString())
      ]);

      // Process dossier stats
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        last6Months.push({
          name: months[d.getMonth()],
          month: d.getMonth(),
          year: d.getFullYear(),
          value: 0,
          revenue: 0
        });
      }

      dossiersChartRes.data?.forEach(d => {
        const date = new Date(d.created_at);
        const monthData = last6Months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
        if (monthData) monthData.value++;
      });

      paymentsChartRes.data?.forEach(p => {
        const date = new Date(p.created_at);
        const monthData = last6Months.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
        if (monthData) monthData.revenue += Number(p.amount);
      });

      setDossierStats(last6Months.map(m => ({ name: m.name, value: m.value })));
      setRevenueStats(last6Months.map(m => ({ name: m.name, value: m.revenue })));

    } catch (err) {
      console.error('Error fetching national data:', err);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Key Metrics - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Communes Déployées', value: stats.totalTenants, icon: Building2, trend: '+2 ce mois', color: 'from-blue-500 to-cyan-400' },
            { label: 'Citoyens Connectés', value: stats.totalUsers.toLocaleString(), icon: Users, trend: '+12% vs mai', color: 'from-emerald-500 to-teal-400' },
            { label: 'Dossiers Traités', value: stats.totalDossiers.toLocaleString(), icon: FileText, trend: '+5.4k aujourd\'hui', color: 'from-purple-500 to-indigo-400' },
            { label: 'Recettes Globales', value: `${stats.totalRevenue.toLocaleString()} FCFA`, icon: TrendingUp, trend: '+8% vs Q1', color: 'from-amber-500 to-orange-400' },
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
                  {tenants.map((t) => (
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
          </div>

          {/* Recent Activity */}
          <div className="bento-card p-6 md:p-8 flex flex-col">
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-8">Derniers Dossiers</h3>
            <div className="space-y-6 flex-grow">
              {recentDossiers.map((d, i) => (
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

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Disponibilité API', value: '99.98%', icon: Globe, status: 'Optimal' },
            { label: 'Temps de Réponse', value: '124ms', icon: Clock, status: 'Stable' },
            { label: 'Alertes Système', value: '0', icon: AlertTriangle, status: 'Aucune' },
          ].map((item, i) => (
            <div key={i} className="bento-card p-6 flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-white/5">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">{item.value}</span>
                  <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    {item.status}
                  </span>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
