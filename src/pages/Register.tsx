import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, Shield, Loader2, ArrowLeft, LogIn } from 'lucide-react';

import { BRANDING } from '../constants';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [npi, setNpi] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create profile with role based on PIN
        const role = adminPin === '1234' ? 'admin' : 'citizen';
        // Citizens are approved by default to avoid manual intervention as requested
        const isApproved = true; 

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            tenant_id: tenant?.id,
            full_name: fullName,
            role: role,
            is_approved: isApproved
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error(`Erreur lors de la création du profil: ${profileError.message}`);
        }

        // 3. Create citizen profile if role is citizen
        if (role === 'citizen') {
          const { error: citizenError } = await supabase
            .from('citizen_profiles')
            .insert({
              id: authData.user.id,
              npi: npi.trim()
            });
          if (citizenError) {
            console.error('Citizen profile creation error:', citizenError);
            throw new Error(`Erreur lors de la création du profil citoyen: ${citizenError.message}`);
          }
        }
        
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-8 relative z-10">
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <Mail className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Vérifiez vos emails</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              Un lien de confirmation a été envoyé à <span className="text-emerald-600 dark:text-emerald-400">{email}</span>.<br />
              Veuillez cliquer sur le lien pour activer votre compte.
            </p>
          </div>
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full py-4 px-4 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }

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
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Rejoignez la plateforme citoyenne
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card py-10 px-6 sm:px-12"
        >
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Nom Complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all dark:text-white"
                  placeholder="Jean DOSSOU"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Numéro NPI (Citoyen)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required={adminPin === ''}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all dark:text-white"
                  placeholder="Votre NPI à 10 chiffres"
                  value={npi}
                  onChange={(e) => setNpi(e.target.value)}
                />
              </div>
            </div>

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

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Code PIN Admin (Optionnel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-emerald-500/30 rounded-xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all dark:text-white"
                  placeholder="PIN réservé aux agents"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                Créer mon compte
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-xs font-medium text-gray-500">
              Déjà un compte ? 
              <button 
                onClick={() => navigate('/auth/login')}
                className="ml-2 text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-widest text-[10px]"
              >
                Connectez-vous
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
