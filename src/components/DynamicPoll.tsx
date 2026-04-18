import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, CheckCircle2, Loader2, BarChart3, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface PollOption {
  id: string;
  label: string;
  votes_count?: number;
}

interface Poll {
  id: string;
  question: string;
  description: string;
  options: PollOption[];
}

export const DynamicPoll: React.FC = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [poll, setPoll] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (tenant) {
      fetchLatestPoll();
      
      const channel = supabase
        .channel(`poll_votes_${tenant.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'poll_votes' },
          () => fetchLatestPoll()
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [tenant, user]);

  const fetchLatestPoll = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*, poll_options(*)')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // maybeSingle() évite le 406 si aucun sondage n'existe encore

      if (pollError || !pollData) {
        setLoading(false);
        return;
      }

      const { data: votesData } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', pollData.id);

      const votesCountMap = (votesData || []).reduce((acc: any, vote: any) => {
        acc[vote.option_id] = (acc[vote.option_id] || 0) + 1;
        return acc;
      }, {});

      const userVoted = user ? (votesData || []).some(v => v.user_id === user.id) : false;

      setPoll({
        ...pollData,
        options: (pollData.poll_options || []).map((opt: any) => ({
          ...opt,
          votes_count: votesCountMap[opt.id] || 0
        }))
      });
      setTotalVotes(votesData?.length || 0);
      setHasVoted(userVoted);
    } catch (err) {
      console.error('Error fetching poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!user) {
      alert('Veuillez vous connecter pour voter.');
      return;
    }
    if (hasVoted || voting) return;

    setVoting(true);
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          tenant_id: tenant?.id,
          poll_id: poll?.id,
          option_id: optionId,
          user_id: user.id
        });

      if (error) throw error;
      await fetchLatestPoll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return (
    <div className="card-glass p-12 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!poll) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-glass p-8 md:p-12 space-y-8 relative overflow-hidden group"
    >
      <div className="space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
          <Vote className="w-3.5 h-3.5" />
          Sondage en cours
        </div>
        <h3 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
          {poll.question || poll.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-xl">
          {poll.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 relative z-10">
        {poll.options.map((option: any) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes_count || 0) / totalVotes * 100) : 0;
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || voting}
              className={cn(
                "w-full relative overflow-hidden group/btn transition-all duration-500 rounded-[24px]",
                hasVoted ? "cursor-default" : "hover:scale-[1.02] active:scale-95"
              )}
            >
              <div className={cn(
                "relative z-10 flex items-center justify-between p-6 border-2 transition-all duration-500 backdrop-blur-md",
                hasVoted 
                  ? "bg-white/50 dark:bg-white/5 border-transparent" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl group-hover/btn:bg-emerald-50/30 dark:group-hover/btn:bg-emerald-500/5"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-500",
                    hasVoted ? "bg-emerald-500 border-emerald-500" : "border-gray-200 dark:border-white/10 group-hover/btn:border-emerald-500"
                  )}>
                    {hasVoted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">
                    {option.label}
                  </span>
                </div>
                {hasVoted && (
                  <div className="flex flex-col items-end">
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                      {percentage}%
                    </span>
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{option.votes_count} voix</span>
                  </div>
                )}
              </div>

              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="absolute inset-y-0 left-0 bg-emerald-500/10 dark:bg-emerald-500/20 z-0"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <img key={i} src={`https://picsum.photos/seed/${i * 10}/32/32`} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" alt="avatar" />
            ))}
          </div>
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {totalVotes} Participants actifs
          </span>
        </div>
        {hasVoted ? (
          <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            VOTÉ
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
             <BarChart3 className="w-3.5 h-3.5" />
             RÉSULTATS LIVE
          </div>
        )}
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-all duration-1000" />
      <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-[#EBB700]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#EBB700]/8 transition-all duration-1000" />
    </motion.div>
  );
};
