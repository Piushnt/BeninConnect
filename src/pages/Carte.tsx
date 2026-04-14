import React from 'react';
import { InteractiveMap } from '../components/InteractiveMap';
import { motion } from 'motion/react';
import { Map as MapIcon, Compass, Search } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

export const Carte: React.FC = () => {
  const { tenant } = useTenant();

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#008751]/10 text-[#008751] rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Compass className="w-3.5 h-3.5" />
              Exploration Locale
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none"
            >
              Carte Interactive <br />
              <span className="text-[#008751]">de {tenant?.name}</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-500 dark:text-gray-400 max-w-xl font-medium"
            >
              Découvrez les points d'intérêt, les services publics et les trésors touristiques de notre commune sur une carte interactive simplifiée.
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mise à jour</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">Avril 2024</span>
            </div>
            <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center text-[#008751] shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800">
              <MapIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Map Component */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InteractiveMap />
        </motion.div>

        {/* Legend / Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight dark:text-white">Recherche Facile</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Utilisez les filtres par catégorie pour trouver rapidement ce que vous cherchez : mairies, écoles, centres de santé ou sites touristiques.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight dark:text-white">Navigation</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Cliquez sur un marqueur pour afficher les détails, les photos et les descriptions de chaque lieu d'intérêt.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600">
              <MapIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-tight dark:text-white">Précision</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Les données sont régulièrement mises à jour par les services techniques de la mairie pour garantir une information fiable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
