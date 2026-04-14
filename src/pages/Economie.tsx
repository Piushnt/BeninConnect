import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Briefcase, ShoppingBag, TrendingUp, Users, Calendar, MapPin, ChevronRight, Coins } from 'lucide-react';
import { cn } from '../lib/utils';

export const Economie: React.FC = () => {
  const { tenant } = useTenant();

  const defaultMarketDays = [
    { day: 'Lundi', status: 'Petit Marché', time: '07:00 - 18:00' },
    { day: 'Mercredi', status: 'Grand Marché', time: '06:00 - 19:00', highlight: true },
    { day: 'Samedi', status: 'Grand Marché', time: '06:00 - 19:00', highlight: true },
  ];

  const marketDays = tenant?.site_config?.market_config?.days || defaultMarketDays;

  const initiatives = [
    { 
      title: 'Appui aux Artisans', 
      desc: 'Programme de micro-crédit communal pour l\'achat d\'équipements professionnels.',
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      title: 'Zone Industrielle', 
      desc: 'Aménagement d\'un espace dédié aux PME avec exonération de taxes la première année.',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600'
    },
    { 
      title: 'Formation Jeunes', 
      desc: 'Ateliers de formation aux métiers du numérique et de l\'agrobusiness.',
      icon: Users,
      color: 'bg-orange-50 text-orange-600'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">
              <TrendingUp className="w-3.5 h-3.5 text-[#EBB700]" />
              Développement Local
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Économie & <br />
              <span className="text-[#EBB700]">Opportunités</span>
            </h1>
            <p className="text-lg text-gray-400 font-medium leading-relaxed">
              La mairie de {tenant?.name} s'engage pour le dynamisme économique de son territoire. Découvrez nos infrastructures marchandes et nos dispositifs d'aide aux entreprises.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#008751] to-transparent rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Market Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="text-[10px] font-black text-[#008751] uppercase tracking-[0.3em]">Vie Marchande</div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Le Grand Marché de {tenant?.name}</h2>
              <div className="w-20 h-1.5 bg-[#EBB700]" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Véritable poumon économique de la région, notre marché accueille chaque semaine des milliers de commerçants et d'acheteurs venus de tout le département.
            </p>
            <div className="space-y-4">
              {marketDays.map((m, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between p-6 rounded-3xl border transition-all",
                  m.highlight 
                    ? "bg-green-50 dark:bg-green-900/20 border-[#008751]/30 shadow-lg shadow-green-900/5" 
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      m.highlight ? "bg-[#008751] text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    )}>
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{m.day}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-gray-900 dark:text-white">{m.time}</div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Horaires d'ouverture</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-[64px] overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/market-vibe/1000/1000" 
                className="w-full h-full object-cover"
                alt="Marché"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Stats Overlay */}
            <div className="absolute -bottom-10 -left-10 p-8 bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4 max-w-[240px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center text-[#EBB700]">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">500+</div>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Places de marché disponibles pour les commerçants</p>
            </div>
          </div>
        </div>
      </section>

      {/* Initiatives Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Soutien à l'Entrepreneuriat</h2>
            <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initiatives.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 p-10 rounded-[48px] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", item.color)}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight leading-tight group-hover:text-[#008751] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                  {item.desc}
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-widest hover:gap-4 transition-all">
                  En savoir plus
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#004d2c] rounded-[48px] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6 max-w-xl">
            <h2 className="text-4xl font-black uppercase tracking-tight leading-tight">Investissez à <br /> <span className="text-[#EBB700]">{tenant?.name}</span></h2>
            <p className="text-green-50/80 font-medium text-lg">
              Notre service de promotion économique vous accompagne dans toutes vos démarches d'installation et de développement.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl">
                Prendre rendez-vous
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all border border-white/20">
                Guide de l'investisseur
              </button>
            </div>
          </div>
          <div className="relative z-10 w-full lg:w-1/3 aspect-video bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/20 p-8 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#EBB700]" />
              <span className="text-xs font-black uppercase tracking-widest">Guichet Unique</span>
            </div>
            <div className="text-sm font-medium text-green-50/70">
              Ouvert du Lundi au Vendredi <br />
              08:00 - 12:30 | 15:00 - 18:30
            </div>
            <div className="pt-4 text-xl font-black text-white">
              +229 01 00 00 00
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
