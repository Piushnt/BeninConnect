import React from 'react';
import { motion } from 'motion/react';
import { Shield, Globe, Users, Building2, ChevronRight, CheckCircle2, Target, Heart } from 'lucide-react';
import { BRANDING } from '../constants';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751]/10 border border-[#008751]/20 rounded-full text-[#008751] text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Shield className="w-4 h-4" />
              Notre Mission
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 leading-none"
            >
              Digitaliser le <span className="text-[#008751]">Bénin</span> au service des citoyens
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed"
            >
              MairieConnect est le portail national de référence pour la dématérialisation des services publics communaux au Bénin. 
              Notre ambition est de rapprocher l'administration des citoyens grâce à l'innovation technologique.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Communes', value: '77', icon: Building2 },
              { label: 'Utilisateurs', value: '2M+', icon: Users },
              { label: 'Services', value: '150+', icon: Globe },
              { label: 'Satisfaction', value: '98%', icon: Heart },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-4"
              >
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-[#008751]">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">Nos Valeurs Fondamentales</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                  Chaque ligne de code que nous écrivons est guidée par des principes stricts pour garantir un service public d'excellence.
                </p>
              </div>

              <div className="grid gap-8">
                {[
                  { title: 'Transparence', desc: 'Une gestion claire et accessible de toutes les données publiques.', icon: Target },
                  { title: 'Inclusion', desc: 'Un portail conçu pour être utilisé par tous les citoyens, partout au Bénin.', icon: Users },
                  { title: 'Sécurité', desc: 'Une protection maximale de vos données personnelles et transactions.', icon: Shield },
                ].map((val, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#008751] group-hover:bg-[#008751] group-hover:text-white transition-all">
                      <val.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{val.title}</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">{val.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-[64px] overflow-hidden relative group">
                <img 
                  src="https://picsum.photos/seed/benin/1000/1000" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt="Benin"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={BRANDING.NATIONAL.COAT_OF_ARMS} className="h-12 w-auto brightness-0 invert" alt="" />
                    <div className="h-10 w-px bg-white/20" />
                    <span className="text-white font-black uppercase tracking-widest text-xs">République du Bénin</span>
                  </div>
                  <p className="text-white/80 font-medium italic">"Fraternité - Justice - Travail"</p>
                </div>
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#008751]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#EBB700]/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-8 max-w-3xl mx-auto leading-none">
            Prêt à découvrir les services de votre <span className="text-[#008751]">Commune</span> ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-10 py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#006b40] transition-all shadow-2xl shadow-[#008751]/20">
              Explorer les Communes
            </button>
            <button className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all">
              Créer mon Espace Citoyen
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
