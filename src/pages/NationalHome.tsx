import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePageContent } from '../hooks/usePageContent';
import { motion } from 'motion/react';
import { Search, MapPin, Building2, ChevronRight, Globe, Info, X, Map, Users } from 'lucide-react';
import { Tenant, Department } from '../types';
import { AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { BRANDING } from '../constants';

export const NationalHome: React.FC = () => {
  const { sections } = usePageContent('national_home');
  const [communes, setCommunes] = useState<Tenant[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllDepts, setShowAllDepts] = useState(false);
  const [expandedCommuneId, setExpandedCommuneId] = useState<string | null>(null);
  const [communeServices, setCommuneServices] = useState<Record<string, any[]>>({});
  const [loadingServices, setLoadingServices] = useState<Record<string, boolean>>({});

  const iconMap: Record<string, any> = {
    'Building2': Building2,
    'MapPin': MapPin,
    'Globe': Globe,
    'Users': Users
  };

  const defaultStats = [
    { label: 'Communes', val: '77', icon: Building2 },
    { label: 'Départements', val: '12', icon: MapPin },
    { label: 'Services en ligne', val: '150+', icon: Globe },
    { label: 'Citoyens connectés', val: '2M+', icon: Building2 },
  ];

  const stats = sections.stats ? (sections.stats as any[]).map((s: any) => ({
    ...s,
    icon: iconMap[s.icon] || Globe
  })) : defaultStats;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [communesRes, newsRes, deptsRes] = await Promise.all([
        supabase
          .from('tenants')
          .select('*, departments(name)')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('news')
          .select('*, tenants(name, slug)')
          .order('published_at', { ascending: false })
          .limit(4),
        supabase
          .from('departments')
          .select('*')
          .order('name')
      ]);

      if (communesRes.error) throw communesRes.error;
      if (newsRes.error) throw newsRes.error;
      if (deptsRes.error) throw deptsRes.error;

      setCommunes(communesRes.data || []);
      setNews(newsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error('Error fetching national data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunes = communes.filter(c => {
    const deptName = (c as any).departments?.name || '';
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         deptName.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !selectedDeptFilter || deptName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const fetchCommuneServices = async (tenantId: string) => {
    if (communeServices[tenantId]) return;
    
    try {
      setLoadingServices(prev => ({ ...prev, [tenantId]: true }));
      const { data, error } = await supabase
        .from('tenant_services')
        .select('*, service:public_services(*)')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .eq('is_visible', true);

      if (error) throw error;
      setCommuneServices(prev => ({ ...prev, [tenantId]: data || [] }));
    } catch (err) {
      console.error('Error fetching commune services:', err);
    } finally {
      setLoadingServices(prev => ({ ...prev, [tenantId]: false }));
    }
  };

  return (
    <div className="space-y-0 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-[#004d2c] text-white py-16 relative overflow-hidden transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
              <Globe className="w-3.5 h-3.5 text-[#EBB700]" />
              {BRANDING.NATIONAL.NAME}
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              Portail National <br />
              <span className="text-[#EBB700]">de l'e-Gouvernance</span>
            </h1>
            <p className="text-lg text-green-50/80 max-w-xl mx-auto font-medium">
              Accédez aux services numériques des 77 communes du Bénin. 
              Une administration moderne, proche et transparente.
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text"
              placeholder="Rechercher une commune (ex: Cotonou, Parakou...)"
              className="w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white font-bold shadow-2xl focus:ring-4 focus:ring-[#EBB700]/30 outline-none transition-all placeholder:text-gray-400 border-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-64 h-64 border-8 border-white rounded-full" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 border-8 border-[#EBB700] rounded-full" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center space-y-1.5">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto text-[#008751] dark:text-green-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stat.val}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Dernières Actualités</h2>
              <div className="w-16 h-1.5 bg-[#EBB700]" />
            </div>
            <Link 
              to="/actualites" 
              className="text-[#008751] dark:text-green-400 font-bold text-[10px] flex items-center gap-2 hover:underline uppercase tracking-widest"
            >
              Voir tout
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-72 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {news.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="aspect-video overflow-hidden relative">
                    <img 
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-[#008751] text-white text-[8px] font-bold rounded-full uppercase tracking-widest">
                        {item.tenants?.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(item.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <Link to={`/${item.tenants?.slug}/actualites?id=${item.id}`}>
                      <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight line-clamp-2 hover:text-[#008751] dark:hover:text-green-400 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <Link 
                      to={`/${item.tenants?.slug}/actualites?id=${item.id}`}
                      className="text-[#008751] dark:text-green-400 font-bold text-[9px] flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest"
                    >
                      Lire la suite
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 bg-gray-50 dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="text-[9px] font-bold text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Territoire National</div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Découvrez nos Départements</h2>
            <div className="w-20 h-1.5 bg-[#EBB700] mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
              Le Bénin est divisé en 12 départements, chacun avec ses richesses culturelles et économiques uniques.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(showAllDepts ? departments : departments.slice(0, 4)).map((dept, i) => (
              <motion.div
                key={dept.id}
                whileHover={{ y: -6 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                onClick={() => {
                  setSelectedDept(dept);
                  setActiveImageIndex(0);
                }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-[#008751] dark:text-green-400">
                    <Map className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.2em]">Département</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tight leading-tight group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors">
                  {dept.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 font-medium">
                  {dept.history}
                </p>
                <div className="text-[#008751] dark:text-green-400 font-bold text-[9px] flex items-center gap-2 uppercase tracking-widest border-b-2 border-[#EBB700] w-fit pb-1 group-hover:gap-3 transition-all">
                  Découvrir
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </div>

          {!showAllDepts && departments.length > 4 && (
            <div className="mt-12 text-center">
              <button 
                onClick={() => setShowAllDepts(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                Voir tous les départements
                <ChevronRight className="w-4 h-4 rotate-90" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Access Section (Communes Grid) */}
      <section id="communes" className="py-16 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="text-[9px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Catalogue National</div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Toutes les Mairies du Bénin</h2>
            <div className="w-20 h-1.5 bg-[#EBB700] mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
              Accédez directement au portail numérique de votre commune pour vos démarches administratives.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-10">
            <div className="relative flex-grow">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Rechercher une commune..."
                className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#008751] transition-all dark:text-white shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#008751] transition-all dark:text-white appearance-none cursor-pointer shadow-sm"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
            >
              <option value="">Tous les départements</option>
              {['Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
              ))
            ) : (
              filteredCommunes.map((commune) => (
                <motion.div 
                  key={commune.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-950 rounded-2xl p-2.5 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                      <img 
                        src={commune.logo_url || BRANDING.PLACEHOLDERS.COMMUNE_LOGO} 
                        alt={commune.name}
                        className="max-h-full w-auto rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Mairie de {commune.name}</h3>
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-[#008751]" />
                        {(commune as any).departments?.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Portail Actif</span>
                    </div>
                    <Link 
                      to={`/${commune.slug}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#008751] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006b40] shadow-lg shadow-[#008751]/20 transition-all group-hover:scale-105"
                    >
                      Accéder au portail
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Department Detail Modal */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDept(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedDept(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Slideshow */}
              <div className="w-full lg:w-1/2 h-64 lg:h-auto relative bg-gray-100 dark:bg-gray-800">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImageIndex}
                    src={selectedDept.images[activeImageIndex] || `https://picsum.photos/seed/${selectedDept.name}/800/1200`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                <div className="absolute bottom-8 left-8 right-8 flex gap-2">
                  {selectedDept.images.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        i === activeImageIndex ? "w-8 bg-[#EBB700]" : "w-2 bg-white/30"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 p-10 lg:p-16 overflow-y-auto space-y-8">
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Département du</div>
                  <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedDept.name}</h2>
                  <div className="w-20 h-1.5 bg-[#EBB700]" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Histoire & Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {selectedDept.history}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Communes du département
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDept.communes.map((commune: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                        {commune}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setSearch(selectedDept.name);
                      setSelectedDept(null);
                    }}
                    className="w-full py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#008751]/20 hover:bg-[#006b40] transition-all"
                  >
                    Voir les communes sur la carte
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
