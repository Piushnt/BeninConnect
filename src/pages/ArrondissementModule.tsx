import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Building2, 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  ChevronRight,
  ArrowUpRight,
  PieChart,
  Target
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const ArrondissementModule: React.FC<{ arrondissementId?: string }> = ({ arrondissementId }) => {
  const { tenant } = useTenant();
  const { user, profile } = useAuth();
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [selectedArr, setSelectedArr] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (tenant) {
      fetchData();
    }
  }, [tenant, arrondissementId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('arrondissements')
        .select('*')
        .eq('tenant_id', tenant?.id);
      
      setArrondissements(data || []);

      const targetId = arrondissementId || (profile?.role === 'ca_admin' ? profile.arrondissement_id : null);
      if (targetId) {
        const found = data?.find(a => a.id === targetId);
        setSelectedArr(found);
        
        // Simulate stats for the arrondissement
        setStats({
          population: found?.population || 0,
          dossiers: Math.floor(Math.random() * 500),
          revenue: Math.floor(Math.random() * 1000000),
          growth: '+12%',
          completionRate: '92%'
        });
      }
    } catch (error) {
      console.error('Erreur data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold tracking-widest text-xs uppercase text-gray-500">Chargement des données décentralisées...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bento-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center">
            <MapPin className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              {selectedArr ? `Arrondissement de ${selectedArr.name}` : 'Décentralisation par Arrondissement'}
            </h1>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mt-1">
              Tableau de bord de performance locale
            </p>
          </div>
        </div>
      </div>

      {!selectedArr ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arrondissements.map((arr) => (
            <motion.button
              key={arr.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedArr(arr)}
              className="bento-card p-8 text-left group hover:border-purple-500 transition-all border-2 border-transparent"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arrondissement</span>
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-2">{arr.name}</h3>
              <p className="text-xs text-gray-500 font-medium mb-6">Chef: {arr.chef_arrondissement}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Population</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{arr.population?.toLocaleString()} hab.</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Dossiers Traités" value={stats.dossiers} icon={FileText} trend={stats.growth} color="blue" />
            <StatCard label="Recettes Locales" value={`${stats.revenue.toLocaleString()} CFA`} icon={TrendingUp} trend="+5%" color="emerald" />
            <StatCard label="Satisfaction" value={stats.completionRate} icon={CheckCircle2} trend="Stable" color="purple" />
            <StatCard label="Villages" value={selectedArr.villages?.length || 0} icon={Users} color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bento-card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white">Dernières Activités Locales</h3>
                <button className="text-xs font-bold text-purple-600 hover:underline uppercase tracking-widest">Voir tout</button>
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors group">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Demande d'acte de naissance #{1000 + i}</p>
                        <span className="text-[10px] font-medium text-gray-500">Il y a {i}h</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Village de {selectedArr.villages?.[0] || 'Centre'}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 uppercase">En cours</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bento-card p-8 bg-purple-600 text-white border-0 shadow-lg shadow-purple-500/20">
                <h4 className="text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  Objectifs 2026
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-purple-100 italic">Recouvrement fiscal</span>
                      <span className="font-bold tracking-widest">78%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[78%] rounded-full shadow-lg" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-purple-100 italic">Traitement dossiers</span>
                      <span className="font-bold tracking-widest">92%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[92%] rounded-full shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {profile?.role === 'admin' && (
                <button 
                  onClick={() => setSelectedArr(null)}
                  className="w-full btn-ghost py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                >
                  <MapPin className="w-4 h-4" />
                  Changer d'arrondissement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, trend, color }: any) => (
  <div className="bento-card p-6 group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
        color === 'blue' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" :
        color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" :
        color === 'purple' ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600" :
        "bg-orange-50 dark:bg-orange-500/10 text-orange-600"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
          trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500"
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);
