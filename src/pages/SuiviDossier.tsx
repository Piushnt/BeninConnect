import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Search, Loader2, CheckCircle2, Clock, AlertCircle, FileSearch } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const SuiviDossier: React.FC = () => {
  const { tenant } = useTenant();
  const [code, setCode] = useState('');
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNpiSearch, setShowNpiSearch] = useState(false);
  const [npi, setNpi] = useState('');
  const [npiLoading, setNpiLoading] = useState(false);

  const handleNpiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!npi.trim()) return;

    setNpiLoading(true);
    setError(null);
    try {
      // 1. Find citizen by NPI
      const { data: citizen, error: citizenError } = await supabase
        .from('citizen_profiles')
        .select('id')
        .eq('npi', npi.trim())
        .single();

      if (citizenError || !citizen) throw new Error("Aucun citoyen trouvé avec ce NPI.");

      // 2. Find most recent dossier for this citizen in this tenant
      const { data: latestDossier, error: dossierError } = await supabase
        .from('dossiers')
        .select('tracking_code')
        .eq('citizen_id', citizen.id)
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dossierError || !latestDossier) throw new Error("Aucun dossier trouvé pour ce citoyen.");

      setCode(latestDossier.tracking_code);
      setShowNpiSearch(false);
      // Auto-trigger search
      setTimeout(() => {
        const searchBtn = document.getElementById('search-submit-btn');
        searchBtn?.click();
      }, 100);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setNpiLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setDossier(null);

    try {
      const { data, error } = await supabase
        .from('dossiers')
        .select(`
          *,
          tenant_service:tenant_services!service_id(*, service:public_services(*))
        `)
        .eq('tenant_id', tenant?.id)
        .eq('tracking_code', code.toUpperCase())
        .single();

      if (error) throw new Error("Code de suivi invalide ou dossier introuvable.");
      setDossier(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, any> = {
    BROUILLON: { label: 'Brouillon', color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock },
    SOUMIS: { label: 'Soumis', color: 'text-blue-600', bg: 'bg-blue-50', icon: Loader2 },
    EN_INSTRUCTION: { label: 'En cours d\'instruction', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Loader2 },
    ATTENTE_PAIEMENT: { label: 'Attente de paiement', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
    PAYÉ: { label: 'Payé', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    TERMINÉ: { label: 'Terminé', color: 'text-[#008751]', bg: 'bg-green-50', icon: CheckCircle2 },
  };

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Suivi de Dossier</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Entrez votre code de suivi pour connaître l'état d'avancement de votre demande administrative.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 p-8 rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 mb-12"
        >
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <FileSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input 
                type="text"
                placeholder="Ex: ABC-123-XYZ"
                className="w-full pl-14 pr-4 py-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xl font-black uppercase tracking-widest focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all placeholder:text-gray-300 dark:text-white"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button 
              id="search-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#008751]/20 hover:bg-[#006b40] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Vérifier l'état"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setShowNpiSearch(!showNpiSearch)}
              className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-widest hover:underline"
            >
              Obtenir mon code
            </button>
          </div>

          {showNpiSearch && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700"
            >
              <form onSubmit={handleNpiSearch} className="space-y-4">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Entrez votre NPI pour retrouver votre dernier dossier</p>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    placeholder="Votre NPI"
                    className="flex-grow px-6 py-4 bg-white dark:bg-gray-900 rounded-xl text-sm font-bold outline-none border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-[#008751]/20 dark:text-white"
                    value={npi}
                    onChange={(e) => setNpi(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={npiLoading}
                    className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                  >
                    {npiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rechercher"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 flex items-center gap-4 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}
        </motion.div>

        {dossier && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden"
          >
            <div className="bg-[#008751] p-8 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-1">Service</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{dossier.tenant_service?.service?.name}</h3>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2",
                  statusConfig[dossier.status_id]?.bg || 'bg-gray-50',
                  statusConfig[dossier.status_id]?.color || 'text-gray-600'
                )}>
                  {React.createElement(statusConfig[dossier.status_id]?.icon || Clock, { className: "w-4 h-4" })}
                  {statusConfig[dossier.status_id]?.label || dossier.status_id}
                </div>
              </div>
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-1">Code</p>
                  <p className="font-black tracking-widest">{dossier.tracking_code}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-1">Date de dépôt</p>
                  <p className="font-black tracking-widest">{formatDate(dossier.created_at)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Historique & Notes</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-px bg-gray-100 dark:bg-gray-800 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#008751]" />
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">{formatDate(dossier.updated_at)}</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{dossier.notes || "Dossier en cours de traitement par les services municipaux."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
