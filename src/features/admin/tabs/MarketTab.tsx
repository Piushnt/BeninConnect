import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { motion } from 'motion/react';
import { Store, CheckCircle2, XCircle, Plus, Search } from 'lucide-react';
import { cn, formatDate } from '../../../lib/utils';
import { Pagination } from '../../../components/Pagination';

export const MarketTab: React.FC = () => {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<'stands' | 'demandes'>('stands');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddingStand, setIsAddingStand] = useState(false);

  // Fetch Stands
  const { data: standsData, isLoading: loadingStands } = useQuery({
    queryKey: ['market_stands', tenant?.id, currentPage, pageSize],
    queryFn: async () => {
      const { data, count } = await supabase
        .from('market_stands')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      return { stands: data || [], count: count || 0 };
    },
    enabled: !!tenant && activeView === 'stands'
  });

  // Fetch Requests (Registrations)
  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ['market_registrations', tenant?.id, currentPage, pageSize],
    queryFn: async () => {
      const { data, count } = await supabase
        .from('market_registrations')
        .select('*, citizen:user_profiles(full_name), stand:market_stands(stand_number, market_name)', { count: 'exact' })
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      return { requests: data || [], count: count || 0 };
    },
    enabled: !!tenant && activeView === 'demandes'
  });

  const createStandMutation = useMutation({
    mutationFn: async (standData: any) => {
      const { error } = await supabase.from('market_stands').insert({
        ...standData,
        tenant_id: tenant?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market_stands'] });
      setIsAddingStand(false);
      alert('Stand ajouté avec succès');
    },
    onError: (err: any) => alert(err.message)
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, newStatus, standId }: { id: string, newStatus: string, standId?: string }) => {
      const { error } = await supabase.from('market_registrations').update({ 
        status: newStatus,
        ...(standId ? { stand_id: standId } : {})
      }).eq('id', id);
      if (error) throw error;

      if (standId && newStatus === 'APPROUVÉ') {
        const { error: standErr } = await supabase.from('market_stands').update({ status: 'occupied' }).eq('id', standId);
        if (standErr) throw standErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market_registrations'] });
      queryClient.invalidateQueries({ queryKey: ['market_stands'] });
      alert('Demande mise à jour');
    },
    onError: (err: any) => alert(err.message)
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestion des Marchés</h2>
          <div className="h-1 w-12 bg-orange-500 rounded-full" />
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1">
          <button 
            onClick={() => { setActiveView('stands'); setCurrentPage(1); }}
            className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeView === 'stands' ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white" : "text-gray-500")}
          >
            Stands & Places
          </button>
          <button 
            onClick={() => { setActiveView('demandes'); setCurrentPage(1); }}
            className={cn("px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", activeView === 'demandes' ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white" : "text-gray-500")}
          >
            Demandes d'Attribution
          </button>
        </div>
      </div>

      {activeView === 'stands' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setIsAddingStand(true)} className="btn-primary bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 py-3 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Ajouter un stand
            </button>
          </div>

          <div className="card-glass overflow-hidden border-none shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Stand</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Marché</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loyer Mensuel</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loadingStands ? (
                  [1,2,3].map(i => <tr key={i}><td colSpan={4} className="px-6 py-8 animate-pulse bg-gray-50/20 dark:bg-white/5 h-16" /></tr>)
                ) : standsData?.stands.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Aucun stand trouvé</td></tr>
                ) : standsData?.stands.map((stand: any) => (
                  <tr key={stand.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{stand.stand_number} <span className="text-[10px] text-gray-400 ml-2">({stand.category})</span></td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{stand.market_name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{stand.monthly_rent} FCFA</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        stand.status === 'available' ? "bg-emerald-50 text-emerald-600" :
                        stand.status === 'occupied' ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {stand.status === 'available' ? 'LIBRE' : stand.status === 'occupied' ? 'OCCUPÉ' : 'MAINTENANCE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-6 border-t border-gray-100 dark:border-white/5">
               <Pagination total={standsData?.count || 0} current={currentPage} pageSize={pageSize} onChange={setCurrentPage} onPageSizeChange={setPageSize} />
            </div>
          </div>
        </div>
      )}

      {activeView === 'demandes' && (
        <div className="card-glass overflow-hidden border-none shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Demandeur</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Marché Souhaité</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loadingRequests ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={4} className="px-6 py-8 animate-pulse bg-gray-50/20 dark:bg-white/5 h-16" /></tr>)
              ) : requestsData?.requests.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Aucune demande</td></tr>
              ) : requestsData?.requests.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{req.citizen?.full_name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {req.requested_market} <span className="text-[10px] text-gray-400 uppercase tracking-widest ml-2">({req.requested_category})</span>
                    {req.stand && <div className="text-[10px] text-emerald-600 font-bold mt-1">Assigné: {req.stand.stand_number}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      req.status === 'EN_ATTENTE' ? "bg-orange-50 text-orange-600" :
                      req.status === 'APPROUVÉ' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {req.status === 'EN_ATTENTE' && (
                      <>
                        <button onClick={() => updateRequestMutation.mutate({ id: req.id, newStatus: 'APPROUVÉ' })} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100">Approuver</button>
                        <button onClick={() => updateRequestMutation.mutate({ id: req.id, newStatus: 'REJETÉ' })} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100">Rejeter</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 border-t border-gray-100 dark:border-white/5">
             <Pagination total={requestsData?.count || 0} current={currentPage} pageSize={pageSize} onChange={setCurrentPage} onPageSizeChange={setPageSize} />
          </div>
        </div>
      )}

      {/* Modal Ajout Stand */}
      {isAddingStand && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bento-card w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Ajouter un Stand</h3>
              <button onClick={() => setIsAddingStand(false)}><XCircle className="text-gray-400" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createStandMutation.mutate({
                stand_number: fd.get('stand_number'),
                market_name: fd.get('market_name'),
                category: fd.get('category'),
                monthly_rent: Number(fd.get('monthly_rent'))
              });
            }} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">N° de Stand</label>
                <input name="stand_number" required className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm outline-none mt-1" placeholder="Ex: A-42" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nom du Marché</label>
                <input name="market_name" required className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm outline-none mt-1" placeholder="Ex: Marché de Dantokpa" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type (Catégorie)</label>
                <select name="category" className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm outline-none mt-1">
                  <option value="boutique">Boutique</option>
                  <option value="hangar">Hangar</option>
                  <option value="place_ouverte">Place Ouverte</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Loyer Mensuel (FCFA)</label>
                <input name="monthly_rent" type="number" required className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm outline-none mt-1" placeholder="Ex: 15000" />
              </div>
              <button type="submit" className="w-full btn-primary bg-orange-500 hover:bg-orange-600 mt-4 py-3">Créer le stand</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
