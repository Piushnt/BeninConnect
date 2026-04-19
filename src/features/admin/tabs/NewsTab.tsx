import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { motion } from 'motion/react';
import { Plus, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

export const NewsTab: React.FC = () => {
  const { tenant } = useTenant();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data } = await supabase
        .from('news')
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
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Actualités Locales</h2>
          <div className="h-1 w-12 bg-primary rounded-full" />
        </div>
        <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="w-4 h-4" />
          Nouvel Article
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="card-glass h-80 animate-pulse bg-gray-50/20 dark:bg-white/5" />)
        ) : news.length === 0 ? (
          <div className="col-span-full card-glass p-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs border-none">Aucun article publié</div>
        ) : news.map((item: any, i: number) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-glass overflow-hidden flex flex-col group border-none shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
             <div className="h-48 bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/50 dark:border-white/5">
                    {item.category}
                  </span>
                </div>
             </div>
             <div className="p-8 space-y-4 flex-grow">
                <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed font-bold tracking-tight">{item.excerpt || item.content}</p>
             </div>
             <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/[0.01]">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{formatDate(item.published_at)}</span>
                <div className="flex gap-2">
                  <button className="w-9 h-9 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 transition-all">
                     <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-500/40 transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
