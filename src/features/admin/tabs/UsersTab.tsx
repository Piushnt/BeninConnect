import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Users as UsersIcon, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const UsersTab: React.FC = () => {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['users', tenant?.id, userSearch],
    queryFn: async () => {
      if (!tenant) return [];
      let query = supabase.from('user_profiles').select('*');
      if (userSearch) {
        query = query.ilike('full_name', `%${userSearch}%`);
      } else {
        query = query.eq('tenant_id', tenant.id);
      }
      const { data } = await query.limit(50);
      return data || [];
    },
    enabled: !!tenant
  });

  const elevateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string, newRole: string }) => {
      const { error } = await supabase.from('user_profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      setFeedback({ type: 'success', msg: 'Rôle mis à jour avec succès' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => setFeedback({ type: 'error', msg: err.message })
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Citoyens & Staff</h2>
          <div className="h-1 w-12 bg-primary rounded-full" />
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par nom..." 
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="card-glass overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Utilisateur</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Rôle Actuel</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                <tr><td colSpan={3} className="px-8 py-20 text-center animate-pulse font-black text-gray-400 uppercase tracking-widest text-xs">Chargement...</td></tr>
              ) : allUsers.map((u: any, i: number) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all"
                >
                  <td className="px-8 py-8">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black uppercase text-xs">{u.full_name?.charAt(0) || 'U'}</div>
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{u.full_name || 'Utilisateur Anonyme'}</span>
                     </div>
                  </td>
                  <td className="px-8 py-8">
                     <span className={cn(
                       "inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                       u.role === 'super_admin' ? "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" :
                       u.role === 'admin' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                       "bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                     )}>
                       {u.role}
                     </span>
                  </td>
                  <td className="px-8 py-8">
                     <select 
                      onChange={(e) => elevateRoleMutation.mutate({ userId: u.id, newRole: e.target.value })}
                      value={u.role}
                      className="bg-white dark:bg-gray-800 border-gray-100 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                     >
                       <option value="citizen">Citoyen</option>
                       <option value="agent">Agent</option>
                       <option value="admin">Admin</option>
                       {profile?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                     </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl z-[100] border backdrop-blur-md flex items-center gap-3",
              feedback.type === 'success' ? "bg-emerald-50/90 border-emerald-200 text-emerald-900" : "bg-red-50/90 border-red-200 text-red-900"
            )}
          >
            <span className="text-sm font-bold uppercase tracking-tight">{feedback.msg}</span>
            <button onClick={() => setFeedback(null)} className="ml-4 hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
