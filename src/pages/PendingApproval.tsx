import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-8 relative z-10">
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10 border border-amber-100 dark:border-amber-500/20">
          <ShieldAlert className="w-12 h-12 text-amber-600 dark:text-amber-400" />
        </div>
        
        <div className="space-y-4 px-4">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Compte en attente</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
            Votre compte administratif a été créé avec succès, mais il <strong className="text-amber-600 dark:text-amber-400">nécessite l'approbation</strong> du Maire ou de l'Administrateur de votre commune pour accéder au portail métier.
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-4">
            Veuillez contacter votre supérieur hiérarchique.
          </p>
        </div>

        <div className="pt-8 px-4">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Retourner à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};
