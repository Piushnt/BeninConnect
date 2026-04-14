import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const RendezVous: React.FC = () => {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    preferred_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('audiences')
        .insert({
          tenant_id: tenant?.id,
          ...formData,
          status: 'pending'
        });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Error booking audience:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 p-12 rounded-[48px] shadow-2xl text-center space-y-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-[#008751] dark:text-green-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Demande Envoyée</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Votre demande d'audience a été transmise au secrétariat. Vous recevrez une confirmation par téléphone ou email prochainement.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#008751]/20"
          >
            Retour
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Audiences & Rendez-vous</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Prenez rendez-vous avec les autorités municipales ou les services techniques pour vos dossiers personnels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input 
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all border-none dark:text-white"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input 
                      required
                      type="tel"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all border-none dark:text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email (Optionnel)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input 
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all border-none dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Objet de la demande</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <textarea 
                    required
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all border-none dark:text-white"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date souhaitée</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input 
                    required
                    type="date"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all border-none dark:text-white"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({...formData, preferred_date: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#008751]/20 hover:bg-[#006b40] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Envoyer la demande"}
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <div className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Horaires d'accueil</h3>
              <div className="space-y-4">
                {[
                  { day: 'Lundi - Jeudi', hours: '08:00 - 12:30 | 14:00 - 17:30' },
                  { day: 'Vendredi', hours: '08:00 - 12:30 | 15:00 - 17:30' },
                  { day: 'Samedi - Dimanche', hours: 'Fermé' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{item.day}</span>
                    <span className="text-xs font-bold text-[#008751] dark:text-green-400 uppercase tracking-widest">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 dark:bg-black p-10 rounded-[48px] text-white shadow-2xl border border-white/5">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                <Clock className="w-8 h-8 text-[#EBB700]" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight mb-4">Délai de réponse</h4>
              <p className="text-gray-400 font-medium leading-relaxed">
                Toute demande d'audience est traitée sous 48 heures ouvrables. Vous serez contacté pour confirmer l'heure exacte du rendez-vous.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
