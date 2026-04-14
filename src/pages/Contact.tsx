import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const Contact: React.FC = () => {
  const { tenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Lien Direct</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Contactez la Mairie</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Une question, une suggestion ou une demande d'information ? Nos services sont à votre écoute pour vous accompagner dans vos démarches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-gray-50 dark:bg-gray-900 p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 space-y-10">
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Coordonnées</h2>
                <div className="space-y-6">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400 shadow-sm shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adresse Physique</div>
                      <p className="text-gray-900 dark:text-white font-bold">Hôtel de Ville de {tenant?.name}, Place de l'Indépendance</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400 shadow-sm shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Téléphone</div>
                      <p className="text-gray-900 dark:text-white font-bold">+229 01 00 00 00 00</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400 shadow-sm shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Officiel</div>
                      <p className="text-gray-900 dark:text-white font-bold">contact@{tenant?.slug}.bj</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Horaires d'ouverture</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lundi - Vendredi</span>
                    <span className="text-xs font-black text-gray-900 dark:text-white">08:00 - 12:30 | 15:00 - 18:30</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Samedi - Dimanche</span>
                    <span className="text-xs font-black text-red-500 uppercase">Fermé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {['Facebook', 'Twitter', 'LinkedIn'].map(social => (
                <button key={social} className="flex-1 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#008751] hover:bg-green-50 transition-all border border-gray-100 dark:border-gray-800">
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-900 p-10 lg:p-16 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-2xl relative overflow-hidden">
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-12"
                >
                  <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-[#008751] dark:text-green-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Message Envoyé !</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">
                    Merci pour votre message. Nos services reviendront vers vous dans les plus brefs délais.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-10 py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nom Complet</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: Jean Dupont"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all font-bold text-sm dark:text-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email</label>
                      <input 
                        required
                        type="email"
                        placeholder="Ex: jean@email.com"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all font-bold text-sm dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Sujet de votre demande</label>
                    <select className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all font-bold text-sm dark:text-white appearance-none cursor-pointer">
                      <option>Information Générale</option>
                      <option>État Civil</option>
                      <option>Urbanisme & Foncier</option>
                      <option>Signalement de problème</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Votre Message</label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="Comment pouvons-nous vous aider ?"
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all font-bold text-sm dark:text-white resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#008751]/20 hover:bg-[#006b40] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    Envoyer ma demande
                  </button>
                </form>
              )}

              {/* Decorative elements */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#EBB700]/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
