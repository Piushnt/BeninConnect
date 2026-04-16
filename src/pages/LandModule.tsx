import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { 
  Building2, 
  Map as MapIcon, 
  FileCheck, 
  Calendar, 
  Search, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileText,
  Camera,
  Download,
  Upload,
  ArrowRight,
  ChevronRight,
  X
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const LandModule: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [dossiers, setDossiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [newDossierType, setNewDossierType] = useState('ADC');

  useEffect(() => {
    if (tenant) {
      fetchData();
    }
  }, [tenant, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('land_dossiers')
        .select(`
          *,
          citizen:citizen_id(full_name),
          field_visits(*)
        `)
        .eq('tenant_id', tenant?.id);
      
      if (!isAdmin) {
        query.eq('citizen_id', user?.id);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setDossiers(data || []);
    } catch (error) {
      console.error('Erreur data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDossier = async () => {
    try {
      const { error } = await supabase
        .from('land_dossiers')
        .insert({
          tenant_id: tenant?.id,
          citizen_id: user?.id,
          dossier_type: newDossierType,
          status: 'SOUMIS'
        });
      
      if (error) throw error;
      alert('Dossier foncier déposé avec succès !');
      setShowSubmissionModal(false);
      fetchData();
    } catch (error) {
      alert('Erreur dépôt');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('land_dossiers')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      setSelectedDossier(prev => ({ ...prev, status: newStatus }));
      fetchData();
    } catch (error) {
      alert('Erreur status');
    }
  };

  const handleCreateVisit = async (dossierId: string) => {
    try {
      const { error } = await supabase
        .from('field_visits')
        .insert({
          tenant_id: tenant?.id,
          land_dossier_id: dossierId,
          scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PROGRAMMÉ'
        });
      
      if (error) throw error;
      alert('Visite de terrain programmée !');
      fetchData();
    } catch (error) {
      alert('Erreur visite');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold tracking-widest text-xs uppercase text-gray-500">Ouverture du Guichet Unique Foncier...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bento-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              {isAdmin ? 'Gestion Foncière' : 'Mon Patrimoine Foncier'}
            </h1>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-[0.2em] mt-1">
              Guichet Unique du Foncier Urbain (GUFU)
            </p>
          </div>
        </div>

        {!isAdmin && (
          <button 
            onClick={() => setShowSubmissionModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau Dossier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Dossier</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Statut</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {dossiers.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {d.citizen?.full_name || 'Anonyme'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap uppercase tracking-tighter">ID: {d.id.slice(0,8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                          {d.dossier_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-medium text-gray-500 whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          d.status === 'APPROUVÉ' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                          d.status === 'SOUMIS' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-gray-50 dark:bg-white/10 text-gray-500"
                        )}>
                          {d.status.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedDossier(d)}
                          className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedDossier ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bento-card p-6 space-y-6"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-display font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Détails de l'unité</h3>
                <button onClick={() => setSelectedDossier(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Visites de Terrain</p>
                  {selectedDossier.field_visits?.length > 0 ? (
                    selectedDossier.field_visits.map((v: any) => (
                      <div key={v.id} className="flex justify-between items-center text-xs font-bold text-gray-700 dark:text-gray-300">
                        <span>{formatDate(v.scheduled_at)}</span>
                        <span className="text-emerald-600">{v.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-[10px] text-gray-400 italic">Aucune visite programmée</p>
                      {isAdmin && (
                        <button 
                          onClick={() => handleCreateVisit(selectedDossier.id)}
                          className="mt-2 text-[10px] text-amber-600 font-bold uppercase hover:underline"
                        >
                          Programmer une visite
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Décision Administration</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(selectedDossier.id, 'APPROUVÉ')}
                        className="btn-primary py-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 border-none"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedDossier.id, 'REJETÉ')}
                        className="btn-primary py-2 text-[10px] bg-red-600 hover:bg-red-700 border-none"
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bento-card p-8 text-center bg-gray-50/50 dark:bg-white/5 border-dashed border-2">
              <MapIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sélectionnez un dossier pour voir les détails</p>
            </div>
          )}

          <div className="bento-card p-6 bg-amber-50/50 dark:bg-amber-500/5 border-amber-100/50 dark:border-amber-500/10">
            <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Rappel Procédure
            </h4>
            <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-relaxed italic">
              "Toute demande d'Attestation de Détention Coutumière (ADC) nécessite obligatoirement une descente de terrain contradictoire avec le Chef de Village et les voisins."
            </p>
          </div>
        </div>
      </div>

      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Nouveau Dossier GUFU</h3>
              <button onClick={() => setShowSubmissionModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type de Document</span>
                <select 
                  value={newDossierType}
                  onChange={(e) => setNewDossierType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-4 py-3 text-sm"
                >
                  <option value="ADC">Attestation de Détention Coutumière (ADC)</option>
                  <option value="PLU">Plan Local d'Urbanisme (Extrait)</option>
                  <option value="PERMIS">Permis de Construire</option>
                  <option value="MORCELLEMENT">Demande de Morcellement</option>
                </select>
              </label>

              <div className="bento-card p-4 border-dashed border-2 flex flex-col items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-500 transition-all cursor-pointer">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Téléverser les pièces justificatives</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowSubmissionModal(false)} className="flex-1 btn-ghost py-4">Annuler</button>
              <button onClick={handleSubmitDossier} className="flex-1 btn-primary py-4 bg-amber-600 hover:bg-amber-700 border-none">Soumettre le Dossier</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
