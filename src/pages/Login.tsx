import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

import { BRANDING } from '../constants';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate(-1); // Go back to previous page
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
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-emerald-600 transition-all uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au portail
        </button>
        <img 
          className="mx-auto h-20 w-auto rounded-2xl shadow-lg" 
          src={BRANDING.NATIONAL.LOGO_PRIMARY} 
          alt={BRANDING.NATIONAL.NAME} 
          referrerPolicy="no-referrer"
        />
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
          {BRANDING.NATIONAL.GOVERNMENT_NAME}
        </h2>
        <p className="mt-2 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Connectez-vous à votre espace citoyen
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card py-10 px-6 sm:px-12"
        >
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all dark:text-white"
                  placeholder="votre@email.bj"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-bold"
              >
                <LogIn className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                Se Connecter
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-xs font-medium text-gray-500">
              Pas encore de compte ? 
              <Link to="/auth/register" className="ml-2 text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-widest text-[10px]">Inscrivez-vous</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
