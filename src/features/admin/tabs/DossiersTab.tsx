import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTenant } from '../../../contexts/TenantContext';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Search, FileText, ShieldCheck } from 'lucide-react';
import { Pagination } from '../../../components/Pagination';
import { SignaturePad } from '../../../components/SignaturePad';
import { generateOfficialPDF } from '../../../lib/pdfGenerator';
import { generateSignatureHash } from '../../../lib/cryptoUtils';
import { cn, formatDate } from '../../../lib/utils';

export const DossiersTab: React.FC = () => {
  const { tenant } = useTenant();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [dossierNote, setDossierNote] = useState('');
  const [isSignMode, setIsSignMode] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['dossiers', tenant?.id, currentPage, pageSize],
    queryFn: async () => {
      if (!tenant) return { data: [], count: 0 };
      const { data, count } = await supabase
        .from('dossiers')
        .select('*, tenant_service:tenant_services(service:public_services(*)), citizen:user_profiles(*)', { count: 'exact' })
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);
      return { data: data || [], count: count || 0 };
    },
    enabled: !!tenant
  });

  const dossiers = data?.data || [];
  const totalItems = data?.count || 0;

  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['dossier_history', selectedDossier?.id],
    queryFn: async () => {
      if (!selectedDossier) return [];
      const { data } = await supabase
        .from('dossier_history')
        .select('*, agent:user_profiles(*)')
        .eq('dossier_id', selectedDossier.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!selectedDossier
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string, newStatus: string }) => {
      const prevStatus = selectedDossier?.status_id;
      const { error } = await supabase.from('dossiers').update({ status_id: newStatus }).eq('id', id);
      if (error) throw error;
      
      await supabase.from('dossier_history').insert({
        tenant_id: tenant?.id,
        dossier_id: id,
        status_id: newStatus,
        agent_id: user?.id,
        notes: `Passage de ${prevStatus || 'NR'} à ${newStatus}`
      });

      if (selectedDossier?.citizen_id) {
        await supabase.from('notifications').insert({
          user_id: selectedDossier.citizen_id,
          title: 'Mise à jour de votre dossier',
          content: `Le statut de votre dossier ${selectedDossier.tracking_code} est passé à ${newStatus}.`,
          type: 'dossier_status',
          is_read: false
        });
      }

      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      refetchHistory();
      setSelectedDossier((prev: any) => ({ ...prev, status_id: newStatus }));
      setFeedback({ type: 'success', msg: 'Statut mis à jour.' });
    },
    onError: (err: any) => setFeedback({ type: 'error', msg: err.message })
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const { error } = await supabase.from('dossier_history').insert({
        tenant_id: tenant?.id,
        dossier_id: selectedDossier.id,
        agent_id: user?.id,
        status_id: selectedDossier.status_id,
        notes: note
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDossierNote('');
      refetchHistory();
    }
  });

  const handleSignAndGenerate = async (signatureDataUrl: string) => {
    if (!selectedDossier || !tenant || !user) return;
    setIsGeneratingPDF(true);
    setIsSignMode(false);
    
    try {
      const hash = await generateSignatureHash(selectedDossier.submission_data || {}, user.id);
      const pdfData = {
        tracking_code: selectedDossier.tracking_code,
        citizen_name: `${selectedDossier.submission_data?.firstName || ''} ${selectedDossier.submission_data?.lastName || ''}`,
        service_name: selectedDossier.tenant_service?.service?.name || "Service Administratif",
        municipality_name: tenant.name.toUpperCase(),
        submission_date: new Date().toLocaleDateString('fr-FR'),
        signature_hash: hash,
        signer_name: profile?.full_name || "L'Autorité Municipale",
        qr_code_data: `${window.location.origin}/verify/${selectedDossier.id}`
      };

      const pdfBlob = await generateOfficialPDF(pdfData);
      const year = new Date().getFullYear();
      const filePath = `officiel-documents/${tenant.id}/${year}/${selectedDossier.tracking_code}.pdf`;
      
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('dossiers').update({
        status_id: 'TERMINÉ',
        document_url: publicUrl,
        signature_hash: hash,
        signed_at: new Date().toISOString(),
        signed_by_id: user.id
      }).eq('id', selectedDossier.id);

      if (updateError) throw updateError;

      if (selectedDossier.citizen_id) {
        await supabase.from('notifications').insert({
          user_id: selectedDossier.citizen_id,
          title: 'Document Officiel Disponible',
          content: `L'acte officiel pour votre dossier ${selectedDossier.tracking_code} a été signé et est prêt au téléchargement.`,
          type: 'document_ready',
          is_read: false
        });
      }

      setFeedback({ type: 'success', msg: 'Document signé et archivé avec succès' });
      setSelectedDossier((prev: any) => ({ ...prev, status_id: 'TERMINÉ', document_url: publicUrl, signature_hash: hash }));
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    } catch (err: any) {
      setFeedback({ type: 'error', msg: `Erreur de signature: ${err.message}` });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Gestion des Dossiers</h2>
          <div className="h-1 w-12 bg-primary rounded-full" />
        </div>
      </div>

      <div className="card-glass overflow-hidden border-none shadow-2xl">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Code Suivi</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Citoyen</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Type de Service</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Statut</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                  [1,2,3].map(i => <tr key={i}><td colSpan={5} className="px-8 py-8 animate-pulse bg-gray-50/20 dark:bg-white/5 h-16" /></tr>)
              ) : dossiers.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center font-black text-gray-400 uppercase tracking-widest text-xs">Aucun dossier trouvé</td></tr>
              ) : dossiers.map((d: any, i: number) => (
                <motion.tr 
                  key={d.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300 group"
                >
                  <td className="px-8 py-8">
                    <span className="font-mono text-[10px] font-black text-primary px-3 py-1.5 bg-primary/10 rounded-lg">{d.tracking_code}</span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {d.submission_data?.firstName} {d.submission_data?.lastName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold tracking-widest">{d.submission_data?.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{d.tenant_service?.service?.name}</span>
                  </td>
                  <td className="px-8 py-8">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                      d.status_id === 'TERMINÉ' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                      d.status_id === 'REJETÉ' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
                      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    )}>
                      {d.status_id}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <button 
                      onClick={() => setSelectedDossier(d)} 
                      className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-[10px] font-black text-gray-400 hover:text-primary hover:border-primary/30 uppercase tracking-widest transition-all shadow-sm"
                    >
                      Détails
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-gray-100 dark:border-white/5">
          <Pagination total={totalItems} current={currentPage} pageSize={pageSize} onChange={setCurrentPage} onPageSizeChange={setPageSize} />
        </div>
      </div>

      {feedback && (
         <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         className="fixed bottom-8 right-8 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-xl flex items-center gap-3 z-50">
           {feedback.msg}
           <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
         </motion.div>
      )}

      {selectedDossier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Détails Dossier {selectedDossier.tracking_code}</h3>
              <button onClick={() => setSelectedDossier(null)}><X /></button>
            </div>
            <div className="p-6 overflow-y-auto">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                        <p className="text-xs uppercase font-bold text-gray-500">Citoyen</p>
                        <p className="font-bold">{selectedDossier.submission_data?.firstName} {selectedDossier.submission_data?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase font-bold text-gray-500">Statut Actuel</p>
                        <p className="font-bold text-emerald-600">{selectedDossier.status_id}</p>
                    </div>

                    {selectedDossier.document_url && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 rounded-2xl">
                        <a href={selectedDossier.document_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                          <FileText className="w-4 h-4" /> Voir l'Acte
                        </a>
                      </div>
                    )}

                    {selectedDossier.status_id === 'APPROUVÉ' && !selectedDossier.document_url && (
                      <button onClick={() => setIsSignMode(true)} disabled={isGeneratingPDF} className="w-full btn-primary py-4 flex justify-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        {isGeneratingPDF ? 'Génération...' : 'Signer l\'Acte'}
                      </button>
                    )}
                    
                    <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-gray-500">Mettre à jour</p>
                        <div className="flex flex-wrap gap-2">
                           {['SOUMIS', 'EN_REVISION', 'APPROUVÉ', 'REJETÉ', 'TERMINÉ'].map(s => (
                             <button 
                               key={s} 
                               onClick={() => updateStatusMutation.mutate({ id: selectedDossier.id, newStatus: s })}
                               className={cn("px-3 py-1 rounded-full text-[10px] font-bold", selectedDossier.status_id === s ? "bg-emerald-600 text-white" : "border")}
                             >
                               {s}
                             </button>
                           ))}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <p className="text-xs uppercase font-bold text-gray-500">Notes & Historique</p>
                        <div className="flex gap-2">
                           <input value={dossierNote} onChange={e => setDossierNote(e.target.value)} className="flex-grow border rounded-lg px-3 py-2 text-sm" placeholder="Note..." />
                           <button onClick={() => addNoteMutation.mutate(dossierNote)} className="btn-primary py-1 px-4">Ajouter</button>
                        </div>
                        <div className="space-y-4 pt-4">
                           {history.map((h: any) => (
                             <div key={h.id} className="p-3 border rounded-xl text-xs bg-gray-50">
                                <p className="font-black mb-1">{h.agent?.full_name || 'Système'}</p>
                                <p className="text-gray-600 italic">"{h.notes}"</p>
                                <p className="text-[9px] font-black text-gray-400 mt-2">{formatDate(h.created_at)}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {isSignMode && (
        <SignaturePad onSave={handleSignAndGenerate} onCancel={() => setIsSignMode(false)} />
      )}
    </div>
  );
};
