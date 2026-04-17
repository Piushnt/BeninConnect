import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, Clock, Coins, ChevronRight, Info, ExternalLink, MapPin, X, CheckCircle2 } from 'lucide-react';
import { TenantService } from '../types';
import { cn } from '../lib/utils';
import { useSearchParams, Link } from 'react-router-dom';

import { ServiceCard } from '../components/ServiceCard';

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
    <div className="py-20 lg:py-32 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] min-h-screen transition-colors duration-300 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <header className="text-center space-y-6 mb-20 lg:mb-32">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-primary dark:text-emerald-400 uppercase tracking-[0.4em] mb-4"
          >
            Catalogue des E-Services
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tighter"
          >
            Prestations de la Mairie
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-32 h-2 bg-secondary mx-auto rounded-full" 
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed"
          >
            Simplifiez vos démarches administratives auprès de la mairie de <span className="font-bold text-gray-900 dark:text-white uppercase px-1">{tenant?.name}</span>. 
            Transparence, célérité et sécurité.
          </motion.p>
        </header>

        {/* Search & Filter - Floating Bar */}
        <div className="max-w-5xl mx-auto mb-20 space-y-8">
          <div className="card-glass p-2 flex flex-col md:flex-row items-center gap-2 group">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Rechercher une prestation (ex: Acte de naissance, Mariage, Permis...)"
                className="w-full pl-16 pr-6 py-6 bg-transparent rounded-3xl text-sm font-bold placeholder:text-gray-400 outline-none dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex w-full md:w-auto p-2 gap-2">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-grow md:w-48 px-6 py-4 bg-gray-100 dark:bg-white/5 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none hover:bg-white transition-all cursor-pointer border border-transparent focus:border-primary/30"
              >
                <option value="all">Catégories</option>
                <option value="État Civil">État Civil</option>
                <option value="Urbanisme">Urbanisme</option>
                <option value="Fiscalité">Fiscalité</option>
                <option value="Administratif">Administratif</option>
              </select>

              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-grow md:w-48 px-6 py-4 bg-gray-100 dark:bg-white/5 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none hover:bg-white transition-all cursor-pointer border border-transparent focus:border-primary/30"
              >
                <option value="all">Digitalisation</option>
                <option value="online">100% Digital</option>
                <option value="partial">Mixte</option>
                <option value="physical">Présentiel</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-[32px] animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-8 lg:space-y-12 mb-20 lg:mb-32">
            {filteredServices.length > 0 ? (
              filteredServices.map((ts, i) => (
                <ServiceCard 
                  key={ts.id}
                  name={ts.service?.name || ''}
                  cost={ts.custom_price || ts.service?.base_price || 0}
                  delay={ts.custom_procedure ? "Voir détails" : (ts.service?.procedure_steps ? "Variable" : "48h")}
                  requiredDocuments={ts.custom_documents || ts.service?.required_documents || []}
                  physicalPresenceRequired={ts.service?.global_status !== 'online'}
                  onAction={() => setSelectedService(ts)}
                  actionLabel={ts.service?.global_status === 'online' ? "Lancer le service" : "Prise de RDV"}
                  icon={ts.service?.category === 'État Civil' ? <FileText className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                />
              ))
            ) : (
              <div className="text-center py-20 card-glass">
                <p className="text-gray-400 font-bold uppercase tracking-widest">Aucun service ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-900 dark:bg-black py-20 text-white relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Besoin d'aide ?</h3>
            <p className="opacity-60 text-sm font-medium">Nos agents vous accompagnent dans toutes vos démarches administratives.</p>
          </div>
          <div className="flex gap-4">
             <Link to={`/${tenant?.slug}/rendez-vous`} className="btn-primary bg-white text-black">Contact Mairie</Link>
             <Link to={`/${tenant?.slug}/suivi-dossier`} className="btn-primary border-white border text-white bg-transparent">Suivi Dossier</Link>
          </div>
        </div>
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
