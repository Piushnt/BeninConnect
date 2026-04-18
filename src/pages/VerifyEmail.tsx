import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, ArrowLeft, Loader2, Send } from 'lucide-react';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button 
          onClick={() => navigate('/auth/login')}
          className="mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-emerald-600 transition-all uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card py-10 px-6 sm:px-12 text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-8">
            <Mail className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>

          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-4 uppercase tracking-tighter">
            Vérifiez votre boîte mail
          </h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Pour accéder à la plateforme, vous devez d'abord confirmer votre adresse email. 
              Un lien a été envoyé à :
            </p>
            <div className="py-2 px-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 break-all">
                {email}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              Vérifiez également vos courriers indésirables (Spams).
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleResend}
              disabled={loading || resent}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : resent ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {resent ? "Lien renvoyé avec succès !" : "Renvoyer le lien de confirmation"}
            </button>

            {error && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
            )}

            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pt-4">
              Après avoir cliqué sur le lien reçu, revenez ici pour vous connecter.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
