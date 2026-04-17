import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Vote, Users, Calendar, CheckCircle2, BarChart3, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const Sondages: React.FC = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedMap, setVotedMap] = useState<Record<string, string>>({}); // pollId -> optionId
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      fetchPolls();
      if (user) fetchUserVotes();
    }
  }, [tenant, user]);

  const fetchUserVotes = async () => {
    if (!user || !tenant) return;
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('poll_id, option_id')
        .eq('user_id', user.id);

      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach(v => {
        map[v.poll_id] = v.option_id;
      });
      setVotedMap(map);
    } catch (err) {
      console.error('Error fetching user votes:', err);
    }
  };

  const fetchPolls = async () => {
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (*)
        `)
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Get vote counts per option
      const { data: votesData, error: votesError } = await supabase
        .from('poll_votes')
        .select('poll_id, option_id');

      if (votesError) throw votesError;

      const counts: Record<string, number> = {};
      const totalCounts: Record<string, number> = {};

      votesData?.forEach(v => {
        counts[v.option_id] = (counts[v.option_id] || 0) + 1;
        totalCounts[v.poll_id] = (totalCounts[v.poll_id] || 0) + 1;
      });

      setPolls((pollsData || []).map(p => ({
        ...p,
        total_votes: totalCounts[p.id] || 0,
        options: (p.poll_options || []).map((o: any) => ({
          ...o,
          votes_count: counts[o.id] || 0
        }))
      })));
    } catch (err) {
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour voter.');
      return;
    }
    if (votedMap[pollId] || voting) return;

    setVoting(pollId);
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          tenant_id: tenant?.id,
          poll_id: pollId,
          option_id: optionId,
          user_id: user.id
        });

      if (error) throw error;
      
      setVotedMap(prev => ({ ...prev, [pollId]: optionId }));
      await fetchPolls();
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="py-12 bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] min-h-screen transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 mb-20 text-center md:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center md:justify-start gap-3 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] bg-emerald-50 dark:bg-emerald-500/10 w-fit mx-auto md:mx-0 px-5 py-2.5 rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            Voix Citoyenne
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-[1.1]"
          >
            Sondages <br className="hidden md:block" />
            <span className="text-emerald-600 dark:text-emerald-400">Communaux</span>
          </motion.h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-2 bg-[#EBB700] rounded-full mx-auto md:mx-0" 
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 font-bold max-w-2xl text-lg leading-relaxed mx-auto md:mx-0"
          >
            Participez activement à la vie de votre cité. Vos réponses orientent les décisions de votre conseil municipal.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {loading ? (
            [1,2].map(i => <div key={i} className="h-[500px] card-glass animate-pulse" />)
          ) : polls.length === 0 ? (
            <div className="col-span-full py-32 text-center card-glass">
              <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Vote className="w-12 h-12 text-gray-200 dark:text-gray-700" />
              </div>
              <h3 className="text-xl font-display font-black text-gray-400 uppercase tracking-widest">Aucun sondage disponible</h3>
              <p className="text-gray-500 mt-2">Revenez bientôt pour donner votre avis.</p>
            </div>
          ) : (
            polls.map((poll, i) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="card-glass p-10 flex flex-col group relative overflow-hidden h-full border-none"
              >
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-700 shadow-xl shadow-emerald-500/5">
                    <Vote className="w-10 h-10" />
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="px-4 py-2 bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center gap-2.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest backdrop-blur-md">
                      <Clock className="w-4 h-4" />
                      Expire le {new Date(poll.expires_at).toLocaleDateString()}
                    </div>
                    <span className="text-[10px] font-black text-emerald-600/40 dark:text-emerald-400/30 uppercase tracking-[0.3em]">REF: {poll.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-tight relative z-10">
                  {poll.question || poll.title}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold tracking-tight leading-relaxed mb-12 flex-grow relative z-10">
                  {poll.description}
                </p>

                {votedMap[poll.id] ? (
                  <div className="space-y-10 relative z-10">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-8 bg-emerald-50/80 dark:bg-emerald-500/10 rounded-[32px] border border-emerald-100 dark:border-emerald-500/20 flex flex-col items-center justify-center gap-4 text-emerald-700 dark:text-emerald-400 shadow-2xl shadow-emerald-500/10 text-center"
                    >
                      <CheckCircle2 className="w-12 h-12 mb-2" />
                      <p className="text-sm font-black uppercase tracking-[0.2em]">MERCI POUR VOTRE PARTICIPATION !</p>
                      <p className="text-[10px] font-bold opacity-70 uppercase">Résultats calculés en temps réel</p>
                    </motion.div>
                    
                    <div className="space-y-6">
                      {poll.options?.map((opt: any) => {
                        const isThisMyVote = votedMap[poll.id] === opt.id;
                        const percentage = poll.total_votes > 0 ? Math.round((opt.votes_count || 0) / poll.total_votes * 100) : 0;
                        return (
                          <div key={opt.id} className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <div className="flex items-center gap-2">
                                <span className={cn(isThisMyVote ? "text-emerald-600 dark:text-emerald-400 font-black" : "text-gray-500")}>
                                  {opt.label}
                                </span>
                                {isThisMyVote && (
                                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] rounded-full">MON CHOIX</span>
                                )}
                              </div>
                              <span className="text-[#008751] dark:text-green-400 text-sm">{percentage}%</span>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden relative border border-gray-100/50 dark:border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className={cn(
                                  "h-full rounded-full transition-all duration-700",
                                  isThisMyVote 
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                                    : "bg-gray-300 dark:bg-gray-700"
                                )}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 relative z-10">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Choisissez une option :</p>
                    {poll.options?.map((option: any) => (
                      <button 
                        key={option.id}
                        onClick={() => handleVote(poll.id, option.id)}
                        disabled={voting === poll.id}
                        className="w-full p-6 rounded-[28px] border border-gray-100 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-white/5 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-all duration-500 text-left font-black text-gray-700 dark:text-gray-300 flex justify-between items-center group/btn shadow-sm hover:shadow-2xl hover:-translate-y-1.5 active:scale-95"
                      >
                        <span className="uppercase tracking-tight text-xs group-hover/btn:text-emerald-600 dark:group-hover/btn:text-emerald-400 transition-colors">{option.label}</span>
                        <div className="w-12 h-12 bg-gray-50 dark:bg-white/10 rounded-2xl flex items-center justify-center group-hover/btn:bg-emerald-500 group-hover/btn:text-white transition-all duration-500">
                           <ChevronRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2.5 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      <Users className="w-4 h-4" />
                      {poll.total_votes || 0} Participants
                    </div>
                    <div className="flex items-center gap-2.5 text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      <BarChart3 className="w-4 h-4" />
                      Statistiques Live
                    </div>
                  </div>
                  {votedMap[poll.id] && (
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                       <CheckCircle2 className="w-3.5 h-3.5" />
                       Vote Validé
                    </div>
                  )}
                </div>

                {/* Glassmorphism Background Shapes */}
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />
                <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/10 transition-all duration-1000" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
