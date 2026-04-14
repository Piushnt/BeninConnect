import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { History, Landmark, Users, Calendar, ChevronRight } from 'lucide-react';

export const Histoire: React.FC = () => {
  const { tenant } = useTenant();

  const timeline = [
    { year: '1900', event: 'Fondation administrative de la localité.', icon: Calendar },
    { year: '1960', event: 'Érection en commune de plein exercice après l\'indépendance.', icon: Landmark },
    { year: '1990', event: 'Début de la décentralisation et premières élections municipales.', icon: Users },
    { year: '2024', event: 'Lancement de la transformation numérique "Bénin Connect".', icon: History },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-24 bg-[#004d2c] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-sm">
              <History className="w-3.5 h-3.5 text-[#EBB700]" />
              Patrimoine & Mémoire
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              L'Histoire de <br />
              <span className="text-[#EBB700]">{tenant?.name}</span>
            </h1>
            <p className="text-lg text-green-50/80 font-medium leading-relaxed">
              Découvrez les racines, les traditions et les moments clés qui ont façonné l'identité unique de notre commune à travers les âges.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 border-[32px] border-white rounded-full" />
        </div>
      </section>

      {/* Origins Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nos Origines</h2>
              <div className="w-20 h-1.5 bg-[#EBB700]" />
            </div>
            <div className="prose prose-lg dark:prose-invert">
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Située au cœur du département, la commune de {tenant?.name} puise sa force dans une histoire millénaire. Terre de rencontres et d'échanges, elle a su préserver ses coutumes tout en s'ouvrant à la modernité.
              </p>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Les premiers récits oraux évoquent des migrations venues des plateaux environnants, attirées par la fertilité des sols et la proximité des voies de communication naturelles.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800">
                <div className="text-3xl font-black text-[#008751] mb-1">100+</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Années d'histoire moderne</div>
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800">
                <div className="text-3xl font-black text-[#EBB700] mb-1">12</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sites historiques classés</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square rounded-[64px] overflow-hidden shadow-2xl"
          >
            <img 
              src="https://picsum.photos/seed/history/1200/1200" 
              alt="Histoire" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-12 left-12 right-12">
              <p className="text-white font-black text-xl uppercase tracking-tight">Archives de la Mairie</p>
              <p className="text-white/70 text-sm font-medium">Vue aérienne historique de la place centrale</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Frise Chronologique</h2>
            <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          </div>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "relative flex flex-col md:flex-row items-center gap-8",
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  )}
                >
                  <div className="flex-1 md:text-right w-full">
                    <div className={cn(
                      "p-8 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700",
                      i % 2 === 0 ? "md:text-left" : "md:text-right"
                    )}>
                      <div className="text-2xl font-black text-[#008751] mb-2">{item.year}</div>
                      <p className="text-gray-600 dark:text-gray-300 font-medium">{item.event}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-12 h-12 bg-[#EBB700] rounded-full flex items-center justify-center text-white shadow-xl">
                    <item.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#008751] rounded-[48px] p-12 lg:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Contribuez à la Mémoire</h2>
            <p className="text-green-50/80 max-w-2xl mx-auto font-medium text-lg">
              Vous possédez des documents historiques, des photos anciennes ou des récits sur la commune ? Partagez-les avec nos services culturels.
            </p>
            <button className="px-10 py-5 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl active:scale-95">
              Nous contacter
            </button>
          </div>
          
          {/* Decorative background */}
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-black/5 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
};

import { cn } from '../lib/utils';
