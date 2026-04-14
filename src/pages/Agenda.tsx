import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, ChevronRight, Filter, Search, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

export const Agenda: React.FC = () => {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const events = [
    { 
      title: 'Session du Conseil Municipal', 
      date: '2026-04-20', 
      time: '09:00', 
      location: 'Hôtel de Ville', 
      category: 'Institutionnel',
      desc: 'Délibérations sur le budget primitif de l\'année 2026 et vote des projets d\'investissement.'
    },
    { 
      title: 'Fête de la Jeunesse', 
      date: '2026-05-01', 
      time: '14:00', 
      location: 'Stade Municipal', 
      category: 'Culture',
      desc: 'Célébration annuelle avec concerts, tournois sportifs et stands d\'exposition.'
    },
    { 
      title: 'Campagne de Salubrité', 
      date: '2026-04-27', 
      time: '07:00', 
      location: 'Tous les arrondissements', 
      category: 'Citoyenneté',
      desc: 'Journée de nettoyage collectif pour un environnement plus propre et sain.'
    },
    { 
      title: 'Atelier de Transformation Digitale', 
      date: '2026-05-10', 
      time: '10:00', 
      location: 'Maison du Peuple', 
      category: 'Formation',
      desc: 'Initiation aux services en ligne de la mairie pour les commerçants et artisans.'
    },
  ];

  const categories = ['all', 'Institutionnel', 'Culture', 'Citoyenneté', 'Formation'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Événements & Vie Locale</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Agenda Municipal</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Ne manquez aucun événement important de la commune de {tenant?.name}. Sessions du conseil, fêtes locales et actions citoyennes.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="max-w-4xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher un événement..."
              className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all font-bold text-xs dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 px-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none dark:text-white cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'Toutes catégories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {filteredEvents.map((event, i) => {
            const date = new Date(event.date);
            const day = date.getDate();
            const month = date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col md:flex-row gap-8 bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
              >
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-3xl shrink-0 group-hover:bg-[#008751] group-hover:text-white transition-colors">
                  <span className="text-3xl font-black leading-none">{day}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1">{month}</span>
                </div>

                {/* Content */}
                <div className="flex-grow space-y-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <span className="px-3 py-1 bg-[#008751]/10 text-[#008751] dark:text-green-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                      {event.category}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-[#008751] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {event.desc}
                  </p>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end md:justify-center shrink-0">
                  <button className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#EBB700] group-hover:text-black transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="text-center py-24 space-y-4">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <CalendarIcon className="w-10 h-10" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Aucun événement trouvé</p>
            </div>
          )}
        </div>

        {/* Calendar Subscription */}
        <div className="mt-24 bg-gray-900 rounded-[48px] p-12 lg:p-20 text-center space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Ne manquez rien</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium text-lg">
              Abonnez-vous à l'agenda municipal pour recevoir les notifications des événements directement sur votre smartphone ou ordinateur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#006b40] transition-all shadow-xl">
                S'abonner aux alertes
              </button>
              <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all border border-white/20">
                Exporter vers Google Calendar
              </button>
            </div>
          </div>
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 border-[32px] border-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
