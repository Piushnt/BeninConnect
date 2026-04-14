import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { AlertTriangle, Camera, MapPin, Send, Loader2, CheckCircle2, Info, Clock, AlertCircle } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { Signalement as SignalementType } from '../types';

export const Signalement: React.FC = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSignalement, setLastSignalement] = useState<any>(null);
  const [mySignalements, setMySignalements] = useState<SignalementType[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (user && tenant) {
      fetchHistory();
    }
  }, [user, tenant]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from('signalements')
        .select('*')
        .eq('citizen_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMySignalements(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const categories = [
    'Éclairage public',
    'Voirie (Nids de poule)',
    'Déchets / Salubrité',
    'Eau / Assainissement',
    'Sécurité',
    'Autre'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('signalements')
        .insert({
          tenant_id: tenant?.id,
          citizen_id: user?.id,
          category: formData.category,
          description: formData.description,
          location: formData.location,
          latitude: 6.365, // Default for Cotonou for demo
          longitude: 2.418,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      setLastSignalement(data);
      setSubmitted(true);
      fetchHistory();
    } catch (err) {
      console.error('Error submitting signalement:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 p-12 rounded-[48px] shadow-2xl text-center space-y-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-[#008751] dark:text-green-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Signalement Reçu</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Merci pour votre vigilance. Nos services techniques ont été informés et traiteront votre demande dans les plus brefs délais.
          </p>

          {lastSignalement && lastSignalement.latitude && (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Localisation du signalement</p>
              <div className="h-48 rounded-3xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Mock Map for demo purposes since we don't have a map library installed yet */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+008751(2.418,6.365)/2.418,6.365,13/400x200@2x?access_token=pk.eyJ1IjoiYWlzdHVkaW8iLCJhIjoiY2x4eHh4eHh4eHh4eHh4eHh4eHh4In0')] bg-cover bg-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#008751] rounded-full border-4 border-white shadow-xl animate-bounce flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg text-[8px] font-bold text-gray-500">
                  {lastSignalement.latitude.toFixed(4)}, {lastSignalement.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#008751]/20"
          >
            Faire un autre signalement
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Signalement Citoyen</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Aidez-nous à améliorer votre cadre de vie en signalant tout problème sur la voie publique.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-xl border border-gray-100 dark:border-gray-800"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Catégorie du problème</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat})}
                        className={cn(
                          "px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                          formData.category === cat 
                            ? "border-[#008751] bg-green-50 dark:bg-green-900/20 text-[#008751] dark:text-green-400" 
                            : "border-gray-50 dark:border-gray-800 text-gray-400 hover:border-gray-100 dark:hover:border-gray-700"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Description précise</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Décrivez le problème constaté..."
                    className="w-full p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all border-none dark:text-white"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      required
                      type="text"
                      placeholder="Quartier, rue ou point de repère..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all border-none dark:text-white"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Photo (Optionnel)</label>
                  <button type="button" className="w-full p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center gap-3 text-gray-400 hover:border-[#008751] hover:text-[#008751] transition-all group">
                    <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Prendre ou joindre une photo</span>
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !formData.category}
                  className="w-full py-6 bg-gray-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  Envoyer le signalement
                </button>
              </form>
            </motion.div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#EBB700] p-10 rounded-[48px] text-black shadow-xl">
              <AlertTriangle className="w-10 h-10 mb-6" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Urgence ?</h3>
              <p className="text-sm font-bold leading-relaxed opacity-80 mb-8">
                Pour tout danger immédiat (incendie, accident grave, agression), contactez directement les numéros d'urgence nationaux.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-black/10">
                  <span className="text-xs font-black uppercase tracking-widest">Police</span>
                  <span className="text-xl font-black">117</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-black/10">
                  <span className="text-xs font-black uppercase tracking-widest">Pompiers</span>
                  <span className="text-xl font-black">118</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-black uppercase tracking-widest">SAMU</span>
                  <span className="text-xl font-black">112</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-lg font-black uppercase tracking-tight mb-6 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#008751]" />
                Historique
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {loadingHistory ? (
                  [1,2].map(i => <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800 rounded-2xl animate-pulse" />)
                ) : mySignalements.length === 0 ? (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-8">Aucun signalement</p>
                ) : (
                  mySignalements.map(sig => (
                    <div key={sig.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black uppercase tracking-tight dark:text-white">{sig.category}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest",
                          sig.status === 'resolved' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                          {sig.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{sig.description}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(sig.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
