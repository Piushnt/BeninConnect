import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, Plus, Info, CheckCircle2, TrendingUp, Users, Wallet } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  estimated_cost: number;
  status: string;
  image_url: string;
  votes_count: number;
  has_voted: boolean;
}

export const BudgetParticipatif: React.FC = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);

  useEffect(() => {
    if (tenant) {
      fetchProjects();
    }
  }, [tenant, user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data: projectsData, error: projectsError } = await supabase
        .from('budget_projects')
        .select(`
          *,
          budget_votes(count)
        `)
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      let userVotes: string[] = [];
      if (user) {
        const { data: votesData } = await supabase
          .from('budget_votes')
          .select('project_id')
          .eq('user_id', user.id);
        userVotes = votesData?.map(v => v.project_id) || [];
      }

      const formattedProjects = (projectsData || []).map(p => ({
        ...p,
        votes_count: p.budget_votes?.[0]?.count || 0,
        has_voted: userVotes.includes(p.id)
      }));

      setProjects(formattedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (projectId: string, hasVoted: boolean) => {
    if (!user) {
      alert('Veuillez vous connecter pour voter.');
      return;
    }

    try {
      if (hasVoted) {
        await supabase
          .from('budget_votes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('budget_votes')
          .insert({ project_id: projectId, user_id: user.id });
      }
      fetchProjects();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EBB700]/10 text-[#EBB700] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <TrendingUp className="w-3.5 h-3.5" />
              Démocratie Participative
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Budget <br />
              <span className="text-[#EBB700]">Participatif</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl font-medium">
              Proposez des projets pour votre quartier et votez pour ceux qui amélioreront le quotidien de tous les citoyens de {tenant?.name}.
            </p>
          </div>

          <button 
            onClick={() => setShowProposalModal(true)}
            className="px-8 py-5 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#008751]/20 hover:bg-[#006b40] transition-all flex items-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Proposer un projet
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">50M FCFA</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget Alloué</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center gap-6">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">1,250</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Participants</div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 flex items-center gap-6">
            <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center text-yellow-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 dark:text-white">12</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Projets Réalisés</div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-96 bg-gray-100 dark:bg-gray-800 rounded-[40px] animate-pulse" />
            ))
          ) : (
            projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={project.image_url || `https://picsum.photos/seed/${project.id}/800/600`} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md ${
                      project.status === 'selected' ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-900'
                    }`}>
                      {project.status === 'proposed' ? 'En attente' : project.status}
                    </span>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight group-hover:text-[#008751] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{project.votes_count} votes</span>
                    </div>
                    <button 
                      onClick={() => handleVote(project.id, project.has_voted)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        project.has_voted 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-gray-900 text-white hover:bg-[#008751]'
                      }`}
                    >
                      <Vote className="w-4 h-4" />
                      {project.has_voted ? 'Voté' : 'Voter'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
