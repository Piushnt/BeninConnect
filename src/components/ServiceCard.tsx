import React from 'react';
import { motion } from 'motion/react';
import { Clock, Banknote, Calendar, ChevronRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface ServiceCardProps {
  name: string;
  description?: string;
  cost: number;
  delay: string;
  requiredDocuments: string[];
  physicalPresenceRequired: boolean;
  onAction?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  cost,
  delay,
  requiredDocuments,
  physicalPresenceRequired,
  onAction,
  actionLabel = "Prise de RDV",
  icon
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card-glass group overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* Left Side: Info */}
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-emerald-500/10 flex items-center justify-center text-primary dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">
              {icon || <div className="w-6 h-6 border-2 border-current rounded-lg" />}
            </div>
            <h3 className="text-xl lg:text-2xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {name}
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Pièces à fournir :</p>
            <div className="flex flex-wrap gap-3">
              {requiredDocuments.map((doc, i) => (
                <div 
                  key={i} 
                  className="px-4 py-2.5 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl text-[11px] font-bold text-gray-700 dark:text-gray-300"
                >
                  {doc}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Coût</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{cost > 0 ? `${cost} FCFA` : 'Gratuit'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Délai</span>
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{delay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action */}
        <div className="bg-gray-50/50 dark:bg-white/[0.02] p-8 lg:p-10 flex flex-col items-center justify-center text-center border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-white/5">
          <div className="mb-6">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-4">
              {physicalPresenceRequired ? "Présence physique requise" : "100% en ligne"}
            </p>
            <button 
              onClick={onAction}
              className="w-full lg:w-48 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl shadow-gray-900/5 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3 group/btn"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">{actionLabel}</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-[9px] italic text-gray-400 dark:text-gray-500 max-w-[200px]">
            * Les tarifs peuvent être mis à jour selon la loi de finances en vigueur.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
