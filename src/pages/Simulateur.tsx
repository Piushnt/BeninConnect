import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, Info, ArrowRight, Coins, Building2, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTenant } from '../contexts/TenantContext';

export const Simulateur: React.FC = () => {
  const { tenant } = useTenant();
  const [taxType, setTaxType] = useState<'tfu' | 'patente'>('tfu');
  const [baseValue, setBaseValue] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);

  const taxSettings = tenant?.site_config?.tax_settings || {
    tfu_rate: 0.001,
    patente_base: 5000,
    patente_rate: 0.1
  };

  const calculate = () => {
    const val = parseFloat(baseValue);
    if (isNaN(val)) return;

    if (taxType === 'tfu') {
      setResult(val * taxSettings.tfu_rate);
    } else {
      setResult(taxSettings.patente_base + (val * taxSettings.patente_rate));
    }
  };

  return (
    <div className="py-12 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] min-h-screen transition-colors relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Simulateur Fiscal</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs">
            Estimez vos taxes municipales en quelques clics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="bento-card p-8">
              <div className="space-y-8">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTaxType('tfu')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group",
                      taxType === 'tfu' 
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                        : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                    )}
                  >
                    <Building2 className={cn("w-8 h-8 transition-transform group-hover:scale-110", taxType === 'tfu' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400")} />
                    <span className={cn("text-xs font-bold uppercase tracking-widest", taxType === 'tfu' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400")}>TFU</span>
                  </button>
                  <button 
                    onClick={() => setTaxType('patente')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group",
                      taxType === 'patente' 
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                        : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10"
                    )}
                  >
                    <User className={cn("w-8 h-8 transition-transform group-hover:scale-110", taxType === 'patente' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400")} />
                    <span className={cn("text-xs font-bold uppercase tracking-widest", taxType === 'patente' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400")}>Patente</span>
                  </button>
                </div>

                {/* Input */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {taxType === 'tfu' ? "Valeur locative du bien (FCFA)" : "Chiffre d'affaires annuel estimé (FCFA)"}
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input 
                      type="number"
                      placeholder="Ex: 500000"
                      className="w-full pl-14 pr-4 py-6 bg-gray-50 dark:bg-white/5 rounded-2xl text-2xl font-display font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white border border-transparent focus:border-emerald-500/30"
                      value={baseValue}
                      onChange={(e) => setBaseValue(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={calculate}
                  className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Calculator className="w-6 h-6" />
                  Calculer l'estimation
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-4">
              <Info className="w-6 h-6 text-blue-500 dark:text-blue-400 shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                Les taux utilisés sont basés sur la loi de finances en vigueur. Pour un calcul définitif, veuillez vous rapprocher du service des impôts de la mairie.
              </p>
            </div>
          </motion.div>

          {/* Result */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bento-card p-8 h-full flex flex-col justify-center text-center">
              {result !== null ? (
                <div className="space-y-6">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estimation de la taxe</p>
                  <div className="text-5xl font-display font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {result.toLocaleString()} <span className="text-xl">FCFA</span>
                  </div>
                  <div className="pt-8 border-t border-gray-100 dark:border-white/5">
                    <button className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                      Payer en ligne
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 opacity-30">
                  <Calculator className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" />
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">En attente de calcul</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
