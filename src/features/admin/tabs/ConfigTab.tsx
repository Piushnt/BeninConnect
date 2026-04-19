import React from 'react';
import { FileMinus, Edit2, Trash2 } from 'lucide-react';

export const ConfigTab: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase">Configuration & Tarifs</h2>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-glass p-8 space-y-8">
             <h3 className="text-sm font-black uppercase text-primary tracking-widest border-b pb-4">Taux & Fiscalité</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase">Taux TFU (Valeur Locative)</span>
                   <input type="text" defaultValue="0.1%" className="bg-gray-50 dark:bg-white/5 border px-4 py-2 rounded-xl text-xs font-black w-24 text-right cursor-not-allowed" disabled />
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase">Patente (Base Minimum)</span>
                   <input type="text" defaultValue="5.000 CFA" className="bg-gray-50 dark:bg-white/5 border px-4 py-2 rounded-xl text-xs font-black w-32 text-right cursor-not-allowed" disabled />
                </div>
             </div>
             <button disabled className="w-full btn-primary py-4 opacity-50 cursor-not-allowed">Enregistrer les Tarifs (Bientôt)</button>
          </div>

          <div className="card-glass p-8 space-y-8">
             <h3 className="text-sm font-black uppercase text-primary tracking-widest border-b pb-4">Gestion des Formulaires PDF</h3>
             <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/5 rounded-2xl">
                     <div className="flex items-center gap-3">
                        <FileMinus className="w-4 h-4 text-rose-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Formulaire_{i}.pdf</span>
                     </div>
                     <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                        <button className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </div>
                ))}
                <button className="w-full border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all">+ Ajouter un PDF officiel</button>
             </div>
          </div>
       </div>
    </div>
  );
};
