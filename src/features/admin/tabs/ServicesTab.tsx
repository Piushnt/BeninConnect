import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Settings, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const ServicesTab: React.FC = () => {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['services', tenant?.id],
    queryFn: async () => {
      if (!tenant) return { publicServices: [], tenantServicesMap: {} };
      const { data: pub } = await supabase.from('public_services').select('*');
      const { data: ten } = await supabase.from('tenant_services').select('*').eq('tenant_id', tenant.id);
      
      const map: Record<string, any> = {};
      ten?.forEach(s => map[s.service_id] = s);
      
      return { publicServices: pub || [], tenantServicesMap: map };
    },
    enabled: !!tenant
  });

  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('tenant_services')
        .upsert({ tenant_id: tenant?.id, service_id: serviceId, is_active: isActive }, { onConflict: 'tenant_id,service_id' });
      if (error) throw error;
      return isActive;
    },
    onSuccess: (isActive) => {
      setFeedback({ type: 'success', msg: `Service ${isActive ? 'activé' : 'désactivé'}` });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err: any) => setFeedback({ type: 'error', msg: err.message })
  });

  const publicServices = servicesData?.publicServices || [];
  const tenantServicesMap = servicesData?.tenantServicesMap || {};

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Catalogue des Services</h2>
        <div className="h-1 w-16 bg-primary rounded-full" />
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">Activez les services disponibles pour votre municipalité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="card-glass h-80 animate-pulse bg-gray-50/20 dark:bg-white/5" />)
        ) : publicServices.map((service: any, i: number) => {
          const isActive = tenantServicesMap[service.id]?.is_active;
          return (
            <motion.div 
            key={service.id} 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-glass p-8 flex flex-col justify-between group h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-none"
            >
              <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-[20px] flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                        <FileText className="w-7 h-7" />
                    </div>
                    <button 
                      onClick={() => toggleServiceMutation.mutate({ serviceId: service.id, isActive: !isActive })}
                      className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl transition-all shadow-sm border",
                        isActive 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                          : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400"
                      )}
                    >
                        {isActive ? 'Activé' : 'Désactivé'}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{service.category}</span>
                    </div>
                    <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{service.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-3 leading-relaxed font-bold tracking-tight">{service.description}</p>
                  </div>
              </div>
              <div className="pt-8 border-t border-gray-100 dark:border-white/5 mt-8 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(j => (
                        <div key={j} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-white/10" />
                    ))}
                  </div>
                  <button className="w-10 h-10 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/40 transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
              </div>
            </motion.div>
          );
        })}
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
