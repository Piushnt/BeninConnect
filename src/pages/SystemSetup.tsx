import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Settings, CheckCircle2, AlertCircle, Loader2, Database, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const SystemSetup: React.FC = () => {
  const { tenant } = useTenant();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string }>({});

  const applyUpdates = async () => {
    if (!tenant) return;
    setLoading(true);
    setStatus({});

    try {
      // 1. Enable Marketplace Feature
      const { data: featureData } = await supabase
        .from('features')
        .select('id')
        .eq('key', 'marketplace')
        .single();

      if (featureData) {
        await supabase
          .from('tenant_features')
          .upsert({
            tenant_id: tenant.id,
            feature_id: featureData.id,
            is_enabled: true
          });
      }

      // 2. Add 'Certificat de résidence' Service
      const { data: publicService } = await supabase
        .from('public_services')
        .select('id')
        .eq('name', 'Certificat de résidence')
        .single();

      if (publicService) {
        await supabase
          .from('tenant_services')
          .upsert({
            tenant_id: tenant.id,
            service_id: publicService.id,
            is_active: true,
            is_visible: true
          });
      }

      // 3. Update Theme Config
      const { error: themeError } = await supabase
        .from('tenants')
        .update({
          theme_config: {
            primaryColor: '#004d2c',
            secondaryColor: '#EBB700',
            accentColor: '#E30613'
          }
        })
        .eq('id', tenant.id);

      if (themeError) throw themeError;

      // 4. Add Initial Notifications
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([
          {
            tenant_id: tenant.id,
            title: 'Bienvenue sur Mairie Connect',
            body: 'Votre plateforme d\'e-gouvernance est désormais active. Découvrez nos nouveaux services en ligne.',
            priority: 'info'
          },
          {
            tenant_id: tenant.id,
            title: 'Alerte Travaux',
            body: 'Des travaux de voirie sont prévus sur l\'axe principal la semaine prochaine. Prévoyez vos déplacements.',
            priority: 'alert'
          }
        ]);

      if (notifError && !notifError.message.includes('duplicate')) {
        console.warn('Notifications error:', notifError);
      }

      // 5. Initialize Departments
      const departments = [
        {
          name: 'Littoral',
          history: 'Le département du Littoral est le plus petit mais le plus peuplé du Bénin. Il est constitué de la seule ville de Cotonou, capitale économique du pays.',
          images: [
            'https://i.ibb.co/v4m0LzZ/cotonou1.jpg',
            'https://i.ibb.co/v4m0LzZ/cotonou2.jpg',
            'https://i.ibb.co/v4m0LzZ/cotonou3.jpg',
            'https://i.ibb.co/v4m0LzZ/cotonou4.jpg'
          ],
          communes: ['Cotonou']
        },
        {
          name: 'Atlantique',
          history: 'L\'Atlantique est un département stratégique bordant l\'océan. Il abrite Ouidah, ville historique de la traite négrière, et Abomey-Calavi, pôle universitaire.',
          images: [
            'https://i.ibb.co/v4m0LzZ/ouidah1.jpg',
            'https://i.ibb.co/v4m0LzZ/ouidah2.jpg',
            'https://i.ibb.co/v4m0LzZ/ouidah3.jpg',
            'https://i.ibb.co/v4m0LzZ/ouidah4.jpg'
          ],
          communes: ['Abomey-Calavi', 'Allada', 'Kpomassè', 'Ouidah', 'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè']
        },
        {
          name: 'Zou',
          history: 'Le Zou est le berceau de l\'ancien royaume de Dahomey. Abomey, sa ville principale, est célèbre pour ses palais royaux classés au patrimoine mondial de l\'UNESCO.',
          images: [
            'https://i.ibb.co/v4m0LzZ/abomey1.jpg',
            'https://i.ibb.co/v4m0LzZ/abomey2.jpg',
            'https://i.ibb.co/v4m0LzZ/abomey3.jpg',
            'https://i.ibb.co/v4m0LzZ/abomey4.jpg'
          ],
          communes: ['Abomey', 'Agbangnizoun', 'Bohicon', 'Covè', 'Djidja', 'Ouinhi', 'Za-Kpota', 'Zagnanado', 'Zogbodomey']
        }
      ];

      const { error: deptError } = await supabase
        .from('departments')
        .upsert(departments, { onConflict: 'name' });

      if (deptError) throw deptError;
      
      // 6. Add Sample POIs
      const { data: existingPois } = await supabase.from('locations').select('id').eq('tenant_id', tenant.id).limit(1);
      if (!existingPois || existingPois.length === 0) {
        await supabase.from('locations').insert([
          {
            tenant_id: tenant.id,
            name: 'Mairie Centrale',
            category: 'mairie',
            description: 'Siège administratif de la commune.',
            latitude: 6.4911,
            longitude: 2.3614,
            image_url: 'https://picsum.photos/seed/mairie/800/600'
          },
          {
            tenant_id: tenant.id,
            name: 'Palais Royal',
            category: 'tourisme',
            description: 'Site historique et culturel majeur.',
            latitude: 6.4950,
            longitude: 2.3650,
            image_url: 'https://picsum.photos/seed/palace/800/600'
          },
          {
            tenant_id: tenant.id,
            name: 'Marché Central',
            category: 'marche',
            description: 'Le plus grand marché de la région.',
            latitude: 6.4880,
            longitude: 2.3580,
            image_url: 'https://picsum.photos/seed/market-poi/800/600'
          }
        ]);
      }

      // 7. Add Sample Budget Projects
      const { data: existingProjects } = await supabase.from('budget_projects').select('id').eq('tenant_id', tenant.id).limit(1);
      if (!existingProjects || existingProjects.length === 0) {
        await supabase.from('budget_projects').insert([
          {
            tenant_id: tenant.id,
            title: 'Éclairage Solaire des Rues',
            description: 'Installation de lampadaires solaires dans les zones rurales pour améliorer la sécurité nocturne.',
            estimated_cost: 15000000,
            status: 'proposed',
            image_url: 'https://picsum.photos/seed/solar/800/600'
          },
          {
            tenant_id: tenant.id,
            title: 'Réhabilitation du Centre de Santé',
            description: 'Rénovation complète du bâtiment et achat de nouveaux équipements médicaux.',
            estimated_cost: 25000000,
            status: 'selected',
            image_url: 'https://picsum.photos/seed/health/800/600'
          }
        ]);
      }

      setStatus({ success: 'Toutes les mises à jour ont été appliquées avec succès !' });
      
      // Refresh page to apply theme
      setTimeout(() => window.location.reload(), 2000);

    } catch (err: any) {
      console.error('Setup error:', err);
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 space-y-8 relative z-10">
        {/* Promotion Section */}
        <div className="bento-card p-8 md:p-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/5">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Privilèges Administrateur</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Élevez votre compte au rang de Super Administrateur</p>
            </div>
          </div>

          <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/20 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-widest">Mode Développeur Actif</p>
                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                  Cette action modifiera votre profil pour vous donner accès à la Console Globale et au Tableau de Bord Ministériel.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              if (!profile) return;
              setLoading(true);
              try {
                // Use RPC for elevation to bypass RLS restrictions on self-update of role
                const { error } = await supabase.rpc('bootstrap_super_admin');
                if (error) throw error;
                alert('Vous êtes maintenant Super Administrateur ! Rechargez la page.');
                window.location.reload();
              } catch (err: any) {
                alert('Erreur: ' + err.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || profile?.role === 'super_admin'}
            className={cn(
              "w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3",
              profile?.role === 'super_admin' 
                ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white shadow-xl shadow-purple-600/20 hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {profile?.role === 'super_admin' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Déjà Super Administrateur
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Devenir Super Administrateur
              </>
            )}
          </button>
        </div>

        {profile?.role === 'super_admin' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card p-8 md:p-10 space-y-10"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/5">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Configuration Système</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Mise à jour de la commune : {tenant?.name}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Actions à effectuer :</h3>
              <ul className="grid grid-cols-1 gap-4">
                {[
                  'Activer le module Marketplace',
                  'Ajouter le service "Certificat de résidence"',
                  'Mettre à jour la charte graphique (Vert Za-Kpota)',
                  'Initialiser les paramètres par défaut',
                  'Initialiser les données des 12 Départements'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {status.success && (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-4 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest">{status.success}</p>
              </div>
            )}

            {status.error && (
              <div className="p-6 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 flex items-center gap-4 text-red-700 dark:text-red-400">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest">{status.error}</p>
              </div>
            )}

            <button 
              onClick={applyUpdates}
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Settings className="w-6 h-6" />}
              Appliquer les mises à jour
            </button>
          </motion.div>
        ) : (
          <div className="bento-card p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Accès Restreint</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Devenez Super Admin pour accéder aux outils de configuration.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
