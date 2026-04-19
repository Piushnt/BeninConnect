import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const AnnouncementsTab: React.FC = () => {
  const { tenant } = useTenant();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('published_at', { ascending: false });
      return data || [];
    },
    enabled: !!tenant
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Annonces Officielles</h2>
          <div className="h-1 w-12 bg-primary rounded-full" />
        </div>
        <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="w-4 h-4" />
          Nouvelle Annonce
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="card-glass h-80 animate-pulse bg-gray-50/20 dark:bg-white/5" />)
        ) : announcements.length === 0 ? (
          <div className="col-span-full card-glass p-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs border-none">Aucune annonce publiée</div>
        ) : announcements.map((item: any, i: number) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-glass overflow-hidden flex flex-col group border-none shadow-xl hover:shadow-2xl transition-all duration-500"
          >
             <div className="p-8 space-y-4 flex-grow">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest">
                    {item.category}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button className="text-gray-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed font-bold tracking-tight">{item.content}</p>
             </div>
             <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{formatDate(item.published_at)}</span>
                {item.document_url && <FileText className="w-4 h-4 text-primary" />}
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
