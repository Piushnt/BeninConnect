import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Clock, Coins, ChevronRight, Info, ExternalLink, MapPin, X, CheckCircle2 } from 'lucide-react';
import { TenantService } from '../types';
import { cn } from '../lib/utils';
import { useSearchParams, Link } from 'react-router-dom';

export const Services: React.FC = () => {
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [services, setServices] = useState<TenantService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<TenantService | null>(null);

  useEffect(() => {
    if (tenant) fetchServices();
  }, [tenant]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_services')
        .select('*, service:public_services(*)')
        .eq('tenant_id', tenant?.id)
        .eq('is_active', true)
        .eq('is_visible', true);

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(ts => {
    const matchesSearch = ts.service?.name.toLowerCase().includes(search.toLowerCase()) ||
      (ts.service?.category && ts.service?.category.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || ts.service?.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || ts.service?.global_status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <div className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Services Publics</div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Prestations de la Mairie</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Accédez à toutes les prestations de la mairie de {tenant?.name}. 
            Consultez les tarifs, les pièces à fournir et lancez vos démarches en ligne.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher un service (ex: Acte de naissance, Permis...)"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all font-bold text-xs dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catégorie:</span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest outline-none dark:text-white"
              >
                <option value="all">Toutes</option>
                <option value="État Civil">État Civil</option>
                <option value="Urbanisme">Urbanisme</option>
                <option value="Fiscalité">Fiscalité</option>
                <option value="Administratif">Administratif</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut:</span>
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest outline-none dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="online">En ligne</option>
                <option value="partial">Partiellement en ligne</option>
                <option value="physical">En présentiel</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-[40px] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((ts, i) => (
              <motion.div
                key={ts.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => setSelectedService(ts)}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase">{ts.service?.category}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        ts.service?.global_status === 'online' ? "bg-green-500" :
                        ts.service?.global_status === 'partial' ? "bg-yellow-500" : "bg-blue-500"
                      )} />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                        {ts.service?.global_status === 'online' ? 'En ligne' :
                         ts.service?.global_status === 'partial' ? 'Partiel' : 'Présentiel'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight leading-tight group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors">
                  {ts.service?.name}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 line-clamp-3 font-medium">
                  {ts.service?.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Clock className="w-4 h-4" />
                    Délai variable
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Coins className="w-4 h-4" />
                    {(ts.custom_price || ts.service?.base_price || 0) > 0 ? `${ts.custom_price || ts.service?.base_price} FCFA` : 'GRATUIT'}
                  </div>
                </div>

                <button className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-[#008751] dark:text-green-400 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group-hover:bg-[#008751] group-hover:text-white transition-all active:scale-95">
                  Détails & Procédure
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-8 lg:p-12 overflow-y-auto space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#008751]/10 text-[#008751] dark:text-green-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {selectedService.service?.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        selectedService.service?.global_status === 'online' ? "bg-green-500" :
                        selectedService.service?.global_status === 'partial' ? "bg-yellow-500" : "bg-blue-500"
                      )} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {selectedService.service?.global_status === 'online' ? 'Service en ligne' :
                         selectedService.service?.global_status === 'partial' ? 'Service partiellement digitalisé' : 'Service en présentiel'}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    {selectedService.service?.name}
                  </h2>
                  <div className="w-20 h-1.5 bg-[#EBB700]" />
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium text-lg">
                    {selectedService.service?.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Pièces à fournir
                    </h3>
                    <ul className="space-y-3">
                      {(selectedService.custom_documents || selectedService.service?.required_documents || []).map((doc, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all hover:border-[#008751]/30">
                          <CheckCircle2 className="w-5 h-5 text-[#008751] dark:text-green-400 shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Procédure & Tarifs
                      </h3>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tarif officiel</span>
                          <span className="text-xl font-black text-[#008751] dark:text-green-400">
                            {(selectedService.custom_price || selectedService.service?.base_price || 0) > 0 ? `${selectedService.custom_price || selectedService.service?.base_price} FCFA` : 'GRATUIT'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Étapes à suivre</span>
                          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed font-medium">
                            {selectedService.custom_procedure || selectedService.service?.procedure_steps}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      {selectedService.service?.global_status === 'online' || selectedService.custom_link || selectedService.service?.external_link ? (
                        <a 
                          href={selectedService.custom_link || selectedService.service?.external_link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#008751]/20 hover:bg-[#006b40] transition-all flex items-center justify-center gap-3"
                        >
                          Accéder au service en ligne
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : selectedService.service?.global_status === 'partial' ? (
                        <button 
                          className="w-full py-5 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#EBB700]/20 hover:bg-[#d4a500] transition-all flex items-center justify-center gap-3"
                        >
                          Démarrer le formulaire
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link 
                          to={`/${tenant?.slug}/rendez-vous`}
                          className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3"
                          onClick={() => setSelectedService(null)}
                        >
                          Prendre rendez-vous en mairie
                          <MapPin className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
