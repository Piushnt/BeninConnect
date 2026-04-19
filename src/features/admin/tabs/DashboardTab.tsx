import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { FileText, AlertCircle, Users, Vote, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';

export const DashboardTab: React.FC = () => {
  const { tenant } = useTenant();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: '', body: '', target: 'all' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Stats Queries
  const { data: dossiersCount = 0 } = useQuery({
    queryKey: ['dossiers_count', tenant?.id],
    queryFn: async () => {
      if (!tenant) return 0;
      const { count } = await supabase.from('dossiers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
      return count || 0;
    },
    enabled: !!tenant
  });

  const { data: signalementsCount = 0 } = useQuery({
    queryKey: ['signalements_count', tenant?.id],
    queryFn: async () => {
      if (!tenant) return 0;
      const { count } = await supabase.from('signalements').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
      return count || 0;
    },
    enabled: !!tenant
  });

  const { data: usersCount = 0 } = useQuery({
    queryKey: ['users_count', tenant?.id],
    queryFn: async () => {
      if (!tenant) return 0;
      const { count } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
      return count || 0;
    },
    enabled: !!tenant
  });

  const { data: pollsCount = 0 } = useQuery({
    queryKey: ['polls_count', tenant?.id],
    queryFn: async () => {
      if (!tenant) return 0;
      const { count } = await supabase.from('polls').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id);
      return count || 0;
    },
    enabled: !!tenant
  });

  const handleSendNotification = async () => {
    if (!tenant || !notificationData.title || !notificationData.body) return;
    
    try {
      const { data: notif, error: notifError } = await supabase
        .from('notifications')
        .insert({
          tenant_id: tenant.id,
          title: notificationData.title,
          body: notificationData.body,
          priority: 'info'
        })
        .select()
        .single();

      if (notifError) throw notifError;

      let userQuery = supabase.from('user_profiles').select('id').eq('tenant_id', tenant.id);
      const { data: targetUsers } = await userQuery;

      if (targetUsers && targetUsers.length > 0) {
        const targets = targetUsers.map(u => ({
          notification_id: notif.id,
          user_id: u.id,
          tenant_id: tenant.id
        }));
        await supabase.from('notification_targets').insert(targets);
      }

      setFeedback({ type: 'success', msg: 'Notification envoyée avec succès' });
      setIsNotificationModalOpen(false);
      setNotificationData({ title: '', body: '', target: 'all' });
    } catch (err: any) {
      setFeedback({ type: 'error', msg: `Erreur: ${err.message}` });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Tableau de bord</h2>
          <div className="h-1 w-12 bg-primary rounded-full" />
        </div>
        <button 
          onClick={() => setIsNotificationModalOpen(true)}
          className="px-8 py-4 bg-primary text-white rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Bell className="w-4 h-4" />
          Envoyer une Alerte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Dossiers', value: dossiersCount, icon: FileText, color: 'from-[#008751] to-emerald-400' },
          { label: 'Signalements', value: signalementsCount, icon: AlertCircle, color: 'from-blue-600 to-cyan-500' },
          { label: 'Utilisateurs', value: usersCount, icon: Users, color: 'from-purple-600 to-indigo-500' },
          { label: 'Sondages', value: pollsCount, icon: Vote, color: 'from-[#EBB700] to-amber-300' }
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-glass p-8 group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-12 -mt-12 blur-xl" />
            <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-6 shadow-xl", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-4xl font-display font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {feedback && (
         <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="fixed bottom-8 right-8 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-xl flex items-center gap-3 z-50">
           {feedback.msg}
           <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
         </motion.div>
      )}

      {isNotificationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white dark:bg-gray-950 rounded-[40px] w-full max-w-xl p-10 space-y-8 shadow-2xl relative"
           >
              <div className="flex justify-between items-center relative z-10">
                 <h3 className="text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Nouvelle Alerte Citoyenne</h3>
                 <button onClick={() => setIsNotificationModalOpen(false)} className="text-gray-400 hover:text-rose-500"><X /></button>
              </div>

              <div className="space-y-6 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Titre</label>
                    <input 
                      type="text" 
                      value={notificationData.title}
                      onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</label>
                    <textarea 
                      rows={4}
                      value={notificationData.body}
                      onChange={(e) => setNotificationData({...notificationData, body: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none resize-none"
                    />
                 </div>
                 <button 
                  onClick={handleSendNotification}
                  className="w-full py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]"
                 >
                    Diffuser la Notification
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
};
