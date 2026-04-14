import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Bell, X, Check, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      // For visitors, show prompt after 5 seconds if not dismissed
      const dismissed = localStorage.getItem('subscription_prompt_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, tenant]);

  const checkSubscription = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', tenant?.id || null)
        .single();

      if (data) setIsSubscribed(true);
    } catch (err) {
      // Not found is fine
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login or just show info
      setShowPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          tenant_id: tenant?.id || null,
          preferences: {
            news: true,
            alerts: true,
            events: true,
            services: true
          }
        });

      if (error) throw error;
      setIsSubscribed(true);
      setShowPrompt(false);
    } catch (err) {
      console.error('Error subscribing:', err);
    } finally {
      setLoading(false);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('subscription_prompt_dismissed', 'true');
  };

  if (isSubscribed && !showPrompt) return (
    <button 
      onClick={() => setShowPrompt(true)}
      className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center text-[#008751] hover:scale-110 transition-all"
      title="Gérer mes abonnements"
    >
      <ShieldCheck className="w-6 h-6" />
    </button>
  );

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="relative h-48 bg-[#004d2c] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                </div>
                <Sparkles className="w-24 h-24 text-white/20 absolute -top-4 -right-4" />
                <div className="w-20 h-20 bg-white/10 rounded-3xl backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bell className="w-10 h-10 text-white animate-bounce" />
                </div>
              </div>

              <div className="p-10 text-center space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {isSubscribed ? "Gérer vos alertes" : "Restez informé !"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
                    {isSubscribed 
                      ? "Vous êtes déjà abonné aux notifications de la mairie. Souhaitez-vous modifier vos préférences ?"
                      : "Recevez en temps réel les alertes urgentes, les actualités et les nouveaux services de votre commune."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={dismissPrompt}
                    className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                  >
                    Plus tard
                  </button>
                  <button 
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="px-5 py-3.5 bg-[#008751] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-[#008751]/20 hover:bg-[#006b40] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "..." : (isSubscribed ? "Modifier" : "M'abonner")}
                    {!loading && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {!user && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    * Nécessite un compte citoyen
                  </p>
                )}
              </div>

              <button 
                onClick={() => setShowPrompt(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {!isSubscribed && !showPrompt && (
        <button 
          onClick={() => setShowPrompt(true)}
          className="fixed bottom-24 right-6 z-40 w-16 h-16 bg-[#008751] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 transition-all group"
        >
          <Bell className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EBB700] rounded-full border-2 border-white dark:border-gray-900 animate-ping" />
        </button>
      )}
    </>
  );
};
