import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { usePageContent } from '../hooks/usePageContent';
import { motion } from 'motion/react';
import { MapPin, Camera, Utensils, Hotel, ChevronRight, Star, Compass } from 'lucide-react';
import { cn } from '../lib/utils';

import { InteractiveMap } from '../components/InteractiveMap';

export const Tourisme: React.FC = () => {
  const { tenant } = useTenant();
  const { sections } = usePageContent('tourisme');

  const heroContent = sections.hero || {
    title: "Explorez la Perle du Bénin",
    subtitle: "Entre traditions ancestrales et paysages à couper le souffle, laissez-vous séduire par l'authenticité de notre territoire.",
    image_url: "https://picsum.photos/seed/tourism-hero/1920/1080"
  };

  const attractions = sections.attractions || [
    { 
      title: 'La Place Centrale', 
      desc: 'Cœur battant de la commune, entourée d\'arbres centenaires et de bâtiments coloniaux.',
      image: 'https://picsum.photos/seed/square/800/600',
      category: 'Patrimoine'
    },
    { 
      title: 'Le Marché Artisanal', 
      desc: 'Découvrez le savoir-faire local : poterie, tissage et sculptures traditionnelles.',
      image: 'https://picsum.photos/seed/market/800/600',
      category: 'Culture'
    },
    { 
      title: 'Les Chutes Naturelles', 
      desc: 'Un havre de paix à quelques kilomètres du centre-ville, idéal pour les randonnées.',
      image: 'https://picsum.photos/seed/nature/800/600',
      category: 'Nature'
    },
  ];

  const recommendations = sections.recommendations || [
    { name: 'Hôtel de la Mairie', type: 'Hébergement', rating: 4.5, icon: 'Hotel' },
    { name: 'Le Gourmet Local', type: 'Restaurant', rating: 4.8, icon: 'Utensils' },
    { name: 'Gîte du Voyageur', type: 'Hébergement', rating: 4.2, icon: 'Hotel' },
    { name: 'Saveurs du Bénin', type: 'Restaurant', rating: 4.6, icon: 'Utensils' },
  ];

  const iconMap: Record<string, any> = {
    'Hotel': Hotel,
    'Utensils': Utensils
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroContent.image_url} 
            className="w-full h-full object-cover"
            alt="Tourisme"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-[#EBB700]" />
              Destination {tenant?.name}
            </div>
            <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              {heroContent.title.split(' ').slice(0, -3).join(' ')} <br />
              <span className="text-[#EBB700]">{heroContent.title.split(' ').slice(-3).join(' ')}</span>
            </h1>
            <p className="text-xl text-white/80 font-medium leading-relaxed max-w-xl">
              {heroContent.subtitle}
            </p>
            <div className="flex gap-4 pt-4">
              <button className="px-8 py-4 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl">
                Découvrir les sites
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all border border-white/20">
                Guide PDF
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <div className="text-[10px] font-black text-[#008751] uppercase tracking-[0.3em]">Incontournables</div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Sites à Visiter</h2>
            <div className="w-20 h-1.5 bg-[#EBB700]" />
          </div>
          <button className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#008751] transition-colors">
            Voir tout
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {attractions.map((site: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden mb-6 shadow-lg">
                <img 
                  src={site.image} 
                  alt={site.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-6 left-6">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-[#008751] rounded-full text-[8px] font-black uppercase tracking-widest">
                    {site.category}
                  </span>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{site.title}</h3>
                  <p className="text-white/70 text-sm font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    {site.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-12">
          <div className="text-[10px] font-black text-[#008751] uppercase tracking-[0.3em]">Exploration</div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Carte Interactive</h2>
          <div className="w-20 h-1.5 bg-[#EBB700]" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
            Localisez précisément les sites touristiques, les restaurants et les hébergements de notre commune.
          </p>
        </div>
        <InteractiveMap initialCategory="tourisme" />
      </section>

      {/* Recommendations Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-[#008751] uppercase tracking-[0.3em]">Où manger & dormir</div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nos Recommandations</h2>
                <div className="w-20 h-1.5 bg-[#EBB700]" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                Profitez de l'hospitalité légendaire de {tenant?.name}. Nous avons sélectionné pour vous les meilleurs établissements pour un séjour inoubliable.
              </p>
              <button className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-3">
                <MapPin className="w-4 h-4" />
                Voir sur la carte
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recommendations.map((item: any, i: number) => {
                const Icon = iconMap[item.icon] || Hotel;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white dark:bg-gray-800 rounded-[32px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-[#008751] dark:text-green-400">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Star className="w-3 h-3 text-[#EBB700] fill-current" />
                        <span className="text-[10px] font-black text-[#EBB700]">{item.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-[#008751] transition-colors">{item.name}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.type}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

