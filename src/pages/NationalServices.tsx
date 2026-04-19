import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Search, Globe, ChevronRight, Building2, Shield, Users, FileText, CreditCard, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const NationalServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);

  const categories = [
    'Tous',
    'État Civil',
    'Urbanisme',
    'Économie',
    'Citoyenneté',
    'Social',
    'Éducation'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('public_services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                         s.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              <Shield className="w-4 h-4" />
              Services Publics Numériques
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none"
            >
              Simplifiez vos <span className="text-green-500">Démarches</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 font-medium leading-relaxed"
            >
              Accédez à l'ensemble des services publics de vos communes en un seul endroit. 
              Rapide, sécurisé et disponible 24h/24.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text"
                  placeholder="Rechercher un service (ex: Acte de naissance, Permis...)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold dark:text-white transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                      selectedCategory === cat
                        ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-white dark:bg-gray-900 rounded-[32px] animate-pulse" />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Aucun service trouvé</h3>
              <p className="text-gray-400 font-medium mt-2">Essayez d'autres mots-clés ou changez de catégorie.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all"
                >
                  <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="mb-4">
                    <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      {service.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3 group-hover:text-green-500 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <CreditCard className="w-4 h-4" />
                      {service.base_price > 0 ? `${service.base_price} FCFA` : 'Gratuit'}
                    </div>
                    <button 
                      onClick={() => setSelectedService(service)}
                      className="flex items-center gap-2 text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest group-hover:text-green-500 transition-colors"
                    >
                      Détails & Démarche
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Service Details Modal (CDC Compliance) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl z-10 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">{selectedService.category}</span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-3 leading-tight">{selectedService.name}</h3>
              </div>
              <button onClick={() => setSelectedService(null)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center text-sm font-black">✕</button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-4">
                 <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Prix</span>
                 </div>
                 <div>
                    <span className="text-xl font-black text-green-600">{selectedService.base_price > 0 ? `${selectedService.base_price} FCFA` : 'Gratuit'}</span>
                 </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pièces à fournir obligatoires</h4>
                <ul className="space-y-2">
                   {(typeof selectedService.required_documents === 'string' ? JSON.parse(selectedService.required_documents) : selectedService.required_documents || []).map((doc: string, idx: number) => (
                     <li key={idx} className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {doc}
                     </li>
                   ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Statut de Dématérialisation</h4>
                <div className="flex items-center gap-2">
                   {selectedService.global_status === 'online' ? (
                     <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase tracking-widest">✅ En Ligne</span>
                   ) : selectedService.global_status === 'partial' ? (
                     <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold uppercase tracking-widest">🟡 Partiel (Retrait Physique)</span>
                   ) : (
                     <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest">❌ Présentiel</span>
                   )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                {selectedService.external_link ? (
                  <button onClick={() => window.open(selectedService.external_link, '_blank')} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:opacity-90">
                    Continuer sur le site externe <Globe className="w-4 h-4" />
                  </button>
                ) : selectedService.global_status === 'online' || selectedService.global_status === 'partial' ? (
                  <button onClick={() => {
                        window.location.href = '/mon-espace';
                  }} className="w-full py-4 bg-green-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-green-600 flex items-center justify-center gap-2">
                    Faire la démarche via mon espace <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white rounded-xl font-black uppercase tracking-widest text-[10px]">
                    Prendre Rendez-vous en Mairie
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
