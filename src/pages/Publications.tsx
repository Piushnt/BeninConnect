import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { FileText, Download, Search, Filter, Calendar, FileType } from 'lucide-react';

export const Publications: React.FC = () => {
  const { tenant } = useTenant();

  const documents = [
    { title: 'Rapport Annuel de Performance 2025', date: '15 Mars 2026', type: 'PDF', size: '2.4 MB', category: 'Rapport' },
    { title: 'Compte Rendu Session Conseil Janvier 2026', date: '02 Fév 2026', type: 'PDF', size: '1.1 MB', category: 'Conseil' },
    { title: 'Budget Primitif 2026 - Commune de Za-Kpota', date: '20 Déc 2025', type: 'PDF', size: '4.8 MB', category: 'Finance' },
    { title: 'Plan de Développement Communal (PDC) 2021-2026', date: '10 Jan 2021', type: 'PDF', size: '12.5 MB', category: 'Stratégie' },
    { title: 'Arrêté Municipal sur la Salubrité Publique', date: '05 Nov 2025', type: 'PDF', size: '0.8 MB', category: 'Légal' },
    { title: 'Bulletin d\'Information Municipale N°42', date: '01 Jan 2026', type: 'PDF', size: '3.2 MB', category: 'Presse' },
  ];

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Archives & Publications</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Accédez en toute transparence aux documents officiels, rapports de gestion et publications de la mairie de {tenant?.name}.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher un document..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all dark:text-white"
            />
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <Filter className="w-4 h-4" />
              Catégorie
            </button>
            <button className="px-6 py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <Calendar className="w-4 h-4" />
              Année
            </button>
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc, i) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 dark:text-red-400">
                  <FileType className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {doc.category}
                </span>
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight leading-tight group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors">
                {doc.title}
              </h3>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <Calendar className="w-4 h-4" />
                  {doc.date}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <FileText className="w-4 h-4" />
                  {doc.size}
                </div>
              </div>

              <button className="w-full py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-[#008751]/20 hover:bg-[#006b40] transition-all active:scale-95">
                <Download className="w-4 h-4" />
                Télécharger le document
              </button>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-24 bg-blue-50 dark:bg-blue-900/20 p-10 rounded-[48px] border border-blue-100 dark:border-blue-800 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-sm shrink-0">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">Besoin d'un document spécifique ?</h4>
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              Si vous ne trouvez pas le document que vous recherchez, vous pouvez faire une demande d'accès à l'information auprès du secrétariat général de la mairie.
            </p>
          </div>
          <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shrink-0">
            Faire une demande
          </button>
        </div>
      </div>
    </div>
  );
};
