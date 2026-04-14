import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { FileText, Download, Search, Filter, Info, FileDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export const Formulaires: React.FC = () => {
  const { tenant } = useTenant();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const documents = [
    { title: 'Demande d\'acte de naissance', category: 'État Civil', size: '245 KB', type: 'PDF' },
    { title: 'Déclaration de mariage', category: 'État Civil', size: '180 KB', type: 'PDF' },
    { title: 'Permis de construire (Cerfa)', category: 'Urbanisme', size: '1.2 MB', type: 'PDF' },
    { title: 'Certificat de résidence', category: 'Administratif', size: '150 KB', type: 'PDF' },
    { title: 'Demande d\'occupation du domaine public', category: 'Urbanisme', size: '320 KB', type: 'PDF' },
    { title: 'Fiche de recensement artisan', category: 'Économie', size: '210 KB', type: 'PDF' },
  ];

  const categories = ['all', 'État Civil', 'Urbanisme', 'Administratif', 'Économie'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Guichet Documentaire</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Formulaires & Démarches</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Téléchargez les formulaires officiels pour préparer vos dossiers à distance. Gagnez du temps en remplissant vos documents avant de vous rendre en mairie.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Rechercher un formulaire (ex: Naissance, Permis...)"
                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all font-bold text-xs dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 px-6 py-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
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
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400">
                  <FileText className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                  {doc.type}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight leading-tight group-hover:text-[#008751] transition-colors">
                {doc.title}
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{doc.category}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Info className="w-4 h-4" />
                  {doc.size}
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#008751] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006b40] shadow-lg shadow-[#008751]/20 transition-all active:scale-95">
                  TÉLÉCHARGER
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <FileDown className="w-10 h-10" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Aucun formulaire trouvé pour votre recherche</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-24 p-10 bg-[#004d2c] rounded-[48px] text-white flex flex-col lg:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
            <Info className="w-10 h-10 text-[#EBB700]" />
          </div>
          <div className="space-y-2 flex-grow">
            <h3 className="text-2xl font-black uppercase tracking-tight">Besoin d'un service en ligne ?</h3>
            <p className="text-green-50/80 font-medium">
              Certains actes peuvent être demandés directement en ligne sans téléchargement de formulaire papier. Consultez notre catalogue de e-services.
            </p>
          </div>
          <button className="px-10 py-5 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl shrink-0">
            Voir les e-services
            <ChevronRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
