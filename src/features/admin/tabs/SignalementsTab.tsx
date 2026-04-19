import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { motion } from 'motion/react';
import { cn, formatDate } from '../../../lib/utils';

export const SignalementsTab: React.FC = () => {
  const { tenant } = useTenant();

  const { data: signalements = [], isLoading } = useQuery({
    queryKey: ['signalements', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data } = await supabase
        .from('signalements')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!tenant
  });

  return (
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
              {isLoading ? (
                [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-8 py-8 h-16 animate-pulse bg-gray-50/20 dark:bg-white/5" /></tr>)
              ) : signalements.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Aucun signalement</td></tr>
              ) : signalements.map((s: any, i: number) => (
                <motion.tr 
                  key={s.id} 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300"
                >
                  <td className="px-8 py-8">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">{s.category || s.type || "??"}</span>
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
  );
};
