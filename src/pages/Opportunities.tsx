import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Briefcase, Gavel, Calendar, Clock, ChevronRight, FileText, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { cn } from '../lib/utils';

export const Opportunities: React.FC = () => {
  const { tenant } = useTenant();

  const jobs = [
    { title: 'Agent de Police Municipale', type: 'CDD', deadline: '2026-05-15', status: 'Ouvert' },
    { title: 'Secrétaire de Mairie', type: 'CDI', deadline: '2026-05-20', status: 'Ouvert' },
    { title: 'Technicien de Voirie', type: 'CDD', deadline: '2026-04-30', status: 'Urgent' },
  ];

  const tenders = [
    { title: 'Réhabilitation du Marché Central', ref: 'AO-2026-001', deadline: '2026-06-01', budget: 'Important' },
    { title: 'Fourniture de mobilier scolaire', ref: 'AO-2026-002', deadline: '2026-05-10', budget: 'Moyen' },
    { title: 'Entretien des espaces verts', ref: 'AO-2026-003', deadline: '2026-05-25', budget: 'Moyen' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.3em]">Carrière & Marchés</div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Opportunités Locales</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Consultez les offres d'emploi de la mairie et les appels d'offres publics en cours. Participez au développement de {tenant?.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Job Offers */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Recrutements</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{jobs.length} Offres</span>
            </div>

            <div className="space-y-4">
              {jobs.map((job, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-[#008751] transition-colors">{job.title}</h3>
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                      job.status === 'Urgent' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <BadgeCheck className="w-4 h-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock className="w-4 h-4" />
                      Limite: {new Date(job.deadline).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#008751] hover:text-white transition-all flex items-center justify-center gap-2">
                    Postuler maintenant
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tenders */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Gavel className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Appels d'Offres</h2>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tenders.length} Marchés</span>
            </div>

            <div className="space-y-4">
              {tenders.map((tender, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-orange-600 transition-colors">{tender.title}</h3>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Réf: {tender.ref}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Calendar className="w-4 h-4" />
                      Clôture: {new Date(tender.deadline).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <BadgeCheck className="w-4 h-4" />
                      Budget: {tender.budget}
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    Dossier de consultation
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Spontaneous Application */}
        <div className="mt-24 p-12 bg-[#004d2c] rounded-[48px] text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Candidature Spontanée</h2>
              <p className="text-green-50/80 font-medium text-lg">
                Aucune offre ne correspond à votre profil ? Envoyez-nous votre CV et une lettre de motivation pour intégrer notre base de données de talents.
              </p>
              <button className="px-10 py-5 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl">
                Envoyer mon dossier
              </button>
            </div>
            <div className="hidden lg:flex justify-end">
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center border border-white/20 animate-pulse">
                <Briefcase className="w-24 h-24 text-[#EBB700]" />
              </div>
            </div>
          </div>
          {/* Decorative background */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};
