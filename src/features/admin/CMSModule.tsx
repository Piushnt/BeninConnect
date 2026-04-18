import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, ShieldCheck, Users, Map, FileText, ArrowRight, Save, X } from 'lucide-react';

export const CMSModule = () => {
   const [selectedPage, setSelectedPage] = useState<string | null>(null);

   const pages = [
    { id: 'history', label: 'Histoire & Vision', icon: Eye, content: "L'histoire de notre commune..." },
    { id: 'transparency', label: 'Transparence Municipale', icon: ShieldCheck, content: "Budget 2026 en détails..." },
    { id: 'council', label: 'Conseil Municipal', icon: Users, content: "Membres du conseil..." },
    { id: 'arrondissements', label: 'Détails Arrondissements', icon: Map, content: "Carte administrative..." },
    { id: 'reports', label: 'Rapports & Comptes Rendus', icon: FileText, content: "Session ordinaire du mois..." }
   ];

   return (
      <div className="space-y-12 animate-in fade-in duration-700 relative">
        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase">Gestion du Contenu (CMS)</h2>
        
        {/* Grille des Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pages.map(item => (
            <button 
              key={item.id} 
              onClick={() => setSelectedPage(item.id)}
              className="card-glass p-10 text-center space-y-6 group border-2 border-transparent hover:border-primary/50 transition-all shadow-xl hover:shadow-2xl"
            >
                <div className="w-16 h-16 bg-primary/10 rounded-[28px] mx-auto flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{item.label}</h3>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 px-4 py-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all inline-flex items-center gap-2">
                    Éditer le contenu <ArrowRight className="w-3 h-3"/>
                </div>
            </button>
            ))}
        </div>

        {/* Éditeur Modal */}
        {selectedPage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
              
              <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5"/>
                    </div>
                    <div>
                        <h3 className="text-xl font-display font-black text-gray-900 dark:text-white uppercase">Éditeur de Page</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{pages.find(p => p.id === selectedPage)?.label}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedPage(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"><X/></button>
              </div>

              <div className="flex-grow p-6 bg-gray-50 dark:bg-[#0A0D14]">
                 <textarea 
                    className="w-full h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none shadow-sm"
                    defaultValue={pages.find(p => p.id === selectedPage)?.content}
                 />
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-gray-900 flex justify-end gap-4">
                 <button onClick={() => setSelectedPage(null)} className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/5">Annuler</button>
                 <button onClick={() => {
                     alert("Contenu sauvegardé avec succès ! (Démo)");
                     setSelectedPage(null);
                 }} className="btn-primary py-3 px-8 flex items-center gap-2 shadow-xl"><Save className="w-4 h-4"/> Publier les modifications</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
   );
};
