import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Store, 
  Map as MapIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  User, 
  CreditCard,
  FileText,
  TrendingUp,
  Filter,
  ArrowRight
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const MarketModule: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const { tenant } = useTenant();
  const { user, profile } = useAuth();
  const [stands, setStands] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'stands' | 'applications'>('stands');
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStand, setSelectedStand] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (tenant) {
      fetchData();
    }
  }, [tenant, isAdmin, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let standsQuery = supabase
        .from('market_stands')
        .select('*')
        .eq('tenant_id', tenant?.id);
      
      if (searchTerm) {
        standsQuery = standsQuery.or(`name.ilike.%${searchTerm}%,stand_number.ilike.%${searchTerm}%`);
      }
      
      const { data: standsData } = await standsQuery;
      setStands(standsData || []);

      const query = supabase
        .from('market_registrations')
        .select('*, citizen:citizen_id(full_name), stand:stand_id(*)')
        .eq('tenant_id', tenant?.id);
      
      if (!isAdmin) {
        query.eq('citizen_id', user?.id);
      }

      const { data: regData } = await query;
      setRegistrations(regData || []);
    } catch (error) {
      console.error('Erreur data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (standId: string) => {
    try {
      const { error } = await supabase
        .from('market_registrations')
        .insert({
          tenant_id: tenant?.id,
          citizen_id: user?.id,
          stand_id: standId,
          status: 'EN_ATTENTE'
        });
      
      if (error) throw error;
      alert('Demande envoyée avec succès !');
      fetchData();
      setShowApplyModal(false);
    } catch (error) {
      alert('Erreur lors de la demande');
    }
  };

  const handleApprove = async (regId: string, standId: string) => {
    try {
      // 1. Update registration
      await supabase
        .from('market_registrations')
        .update({ status: 'APPROUVÉ', updated_at: new Date().toISOString() })
        .eq('id', regId);
      
      // 2. Update stand status
      await supabase
        .from('market_stands')
        .update({ status: 'OCCUPÉ' })
        .eq('id', standId);
      
      fetchData();
    } catch (error) {
      alert('Erreur approbation');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold tracking-widest text-xs uppercase text-gray-500">Chargement du module marchés...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="bento-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <Store className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              {isAdmin ? 'Régie des Marchés' : 'Ma Place de Marché'}
            </h1>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mt-1">
              {isAdmin ? 'Gestion des stands et recouvrements' : 'Gérez vos emplacements commerciaux'}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-500/5 px-6 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Recettes Jour</p>
              <p className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-300">450.000 <span className="text-xs uppercase">CFA</span></p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/5 px-6 py-3 rounded-2xl border border-blue-100 dark:border-blue-500/10">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Stands Libres</p>
              <p className="text-2xl font-display font-bold text-blue-700 dark:text-blue-300">{stands.filter(s => s.status === 'LIBRE').length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveView('stands')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeView === 'stands' ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              Carte des Stands
            </button>
            <button 
              onClick={() => setActiveView('applications')}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeView === 'applications' ? "bg-white dark:bg-gray-800 text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {isAdmin ? "Demandes d'Attribution" : 'Mes Demandes'}
            </button>
          </div>

          {activeView === 'stands' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {stands.map((stand) => (
                <motion.button
                  key={stand.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedStand(stand);
                    if (!isAdmin && stand.status === 'LIBRE') setShowApplyModal(true);
                  }}
                  className={cn(
                    "bento-card p-6 text-left transition-all border-2 group relative overflow-hidden",
                    stand.status === 'LIBRE' ? "border-emerald-100 dark:border-emerald-500/10 hover:border-emerald-500" : "border-gray-100 dark:border-white/5 opacity-80"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-16 h-16 transition-all",
                    stand.status === 'LIBRE' ? "bg-emerald-500/10 rounded-bl-[4rem]" : "bg-gray-500/10 rounded-bl-[4rem]"
                  )} />
                  
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Emplacement</span>
                  <p className="text-2xl font-display font-bold text-gray-900 dark:text-white mt-1">{stand.stand_number}</p>
                  <p className="text-[10px] font-mono font-bold text-gray-500 mt-2 uppercase tracking-tight">{stand.category || 'Commerce Général'}</p>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      stand.status === 'LIBRE' ? "bg-emerald-500" : "bg-gray-400"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {stand.status === 'LIBRE' ? 'Disponible' : 'Occupé'}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <div className="bento-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Détails</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Stand</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Statut</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              {reg.citizen?.full_name || 'Citoyen'}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap uppercase tracking-tighter">Bail Numérique • ID: {reg.id.slice(0,8)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-gray-900 dark:text-white px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-lg">
                            #{reg.stand?.stand_number}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-medium text-gray-500 whitespace-nowrap">
                          {formatDate(reg.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={cn(
                            "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                            reg.status === 'APPROUVÉ' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                            reg.status === 'REJETÉ' ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          )}>
                            {reg.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {isAdmin && reg.status === 'EN_ATTENTE' && (
                            <button 
                              onClick={() => handleApprove(reg.id, reg.stand_id)}
                              className="btn-primary py-1.5 px-4 text-[10px]"
                            >
                              Valider
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Infos */}
        <div className="space-y-6">
          <div className="bento-card p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-0 shadow-lg shadow-indigo-500/20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mb-4 flex items-center gap-2">
              <CreditCard className="w-3 h-3" />
              Paiement des Taxes
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-indigo-200">Total à payer (Mois)</span>
                <span className="font-display font-bold text-xl">15.000 CFA</span>
              </div>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                Payer via Mobile Money
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bento-card p-6 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/10">
            <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Documents Utiles
            </h4>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors group">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 uppercase tracking-tighter">Contrat de Bail Type</span>
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors group">
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 uppercase tracking-tighter">Règlement Intérieur</span>
                <FileText className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Demande de Stand</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="bento-card p-6 bg-emerald-50 dark:bg-emerald-500/5 flex items-center gap-4 border-emerald-100 dark:border-emerald-500/10">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm">
                <Store className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Emplacement #</p>
                <p className="text-xl font-display font-bold text-gray-900 dark:text-white leading-none">{selectedStand?.stand_number}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 italic">En soumettant cette demande, vous acceptez les conditions de gestion du marché municipal et vous engagez à payer les taxes journalières en vigueur.</p>

            <div className="flex gap-4">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 btn-ghost py-4">Annuler</button>
              <button onClick={() => handleApply(selectedStand.id)} className="flex-1 btn-primary py-4">Confirmer la demande</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const X = ({ className }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
