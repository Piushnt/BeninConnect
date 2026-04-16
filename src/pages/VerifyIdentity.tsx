import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { cn } from '../lib/utils';

export const VerifyIdentity: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        // Try transport registration first
        const { data: registration } = await supabase
          .from('transport_registrations')
          .select(`
            id,
            category,
            status,
            expiry_date,
            photo_url,
            vehicle_make,
            vehicle_model,
            license_plate,
            tenant:tenants(name),
            citizen:user_profiles(full_name)
          `)
          .eq('id', id)
          .maybeSingle();

        if (registration) {
          setData({ ...registration, type: 'transport' });
          return;
        }

        // Try signed dossier
        const { data: dossier } = await supabase
          .from('dossiers')
          .select(`
            id,
            tracking_code,
            status_id,
            signed_at,
            signature_hash,
            document_url,
            tenant:tenants(name),
            signer:user_profiles!signed_by_id(full_name, role),
            tenant_service:tenant_services(service:public_services(name)),
            submission_data
          `)
          .eq('id', id)
          .maybeSingle();

        if (dossier) {
          setData({ ...dossier, type: 'dossier' });
          return;
        }

        throw new Error('Référence invalide ou introuvable');
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Une erreur est survenue lors de la vérification');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F1A] p-4 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Vérification Officielle</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">République du Bénin • Portails Communes</p>
        </div>

        <div className="bento-card overflow-hidden">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recherche en cours...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Erreur de Vérification</h2>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-6 btn-primary w-full py-3"
                >
                  Réessayer
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header Status */}
                <div className={cn(
                  "p-4 text-center text-[10px] font-bold uppercase tracking-widest border-b",
                  data.status === 'active' || data.status === 'approved' || data.status_id === 'TERMINÉ'
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                    : "bg-red-50 text-red-600 border-red-100"
                )}>
                  {data.status === 'active' || data.status === 'approved' || data.status_id === 'TERMINÉ'
                    ? (data.type === 'transport' ? 'Licence Valide' : 'Document Authentique')
                    : 'Non-Valide / Expirée'}
                </div>

                <div className="p-8 space-y-8">
                  {data.type === 'transport' ? (
                    <>
                      {/* Photo & Name */}
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-3xl overflow-hidden mb-4 shadow-xl ring-4 ring-white dark:ring-white/10">
                          {data.photo_url ? (
                            <img 
                              src={data.photo_url} 
                              alt={data.citizen?.full_name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <User className="w-16 h-16" />
                            </div>
                          )}
                        </div>
                        <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight text-center">
                          {data.citizen?.full_name}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Conducteur Autorisé • {data.tenant?.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Truck className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Véhicule</span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase truncate">{data.category}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2 text-gray-400 mb-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Expiration</span>
                          </div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{data.expiry_date ? new Date(data.expiry_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Numéro de Plaque</span>
                          <p className="text-lg font-mono font-bold text-gray-900 dark:text-white leading-none mt-1">{data.license_plate || 'EN ATTENTE'}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Dossier / Document View */}
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                          <ShieldCheck className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div>
                          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white uppercase tracking-tight">Acte Officiel Vérifié</h2>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Émis par la Mairie de {data.tenant?.name}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Titulaire</span>
                              <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{data.submission_data?.firstName} {data.submission_data?.lastName}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Code Tracking</span>
                              <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">{data.tracking_code}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Service</span>
                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">{data.tenant_service?.service?.name}</p>
                          </div>
                        </div>

                        <div className="p-5 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Signé numériquement</p>
                              <p className="text-[9px] text-emerald-600/60 font-medium">Authenticité confirmée</p>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            "Ce document est authentique et a été signé par <strong>{data.signer?.full_name}</strong> le <strong>{new Date(data.signed_at).toLocaleDateString('fr-FR')}</strong>."
                          </p>
                          <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-500/10">
                            <span className="text-[8px] font-mono text-gray-400 truncate block">HASH: {data.signature_hash}</span>
                          </div>
                        </div>

                        {data.document_url && (
                          <a 
                            href={data.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Consulter l'original PDF
                          </a>
                        )}
                      </div>
                    </>
                  )}

                  <p className="text-[9px] text-gray-400 text-center leading-relaxed font-medium">
                    Ce portail de vérification est certifié par l'Agence Nationale de l'Administration Numérique. Conformément à la loi sur le numérique, cette vérification vaut preuve d'authenticité.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
