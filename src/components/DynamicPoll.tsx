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
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    if (tenant) {
      fetchLatestPoll();
      
      // Subscribe to real-time vote updates
      const channel = supabase
        .channel('poll_votes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'poll_votes',
          },
          () => {
            fetchLatestPoll();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [tenant, user]);

  const fetchLatestPoll = async () => {
    try {
      // Get latest active poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (pollError || !pollData) {
        setLoading(false);
        return;
      }

      // Get options
      const { data: optionsData } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollData.id);

      // Get vote counts and check if user voted
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
        options: (optionsData || []).map(opt => ({
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
          poll_id: poll?.id,
          option_id: optionId,
          user_id: user.id
        });

      if (error) throw error;

      // Refresh poll data to show real-time results
      await fetchLatestPoll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
    </div>
  );

  if (!poll) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[48px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="space-y-4 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-[#008751] dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Vote className="w-3 h-3" />
          Sondage Citoyen
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
          {poll.question}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {poll.description}
        </p>
      </div>

      <div className="space-y-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes_count || 0) / totalVotes * 100) : 0;
          
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || voting}
              className={cn(
                "w-full relative overflow-hidden group transition-all",
                hasVoted ? "cursor-default" : "hover:scale-[1.02] active:scale-95"
              )}
            >
              <div className={cn(
                "relative z-10 flex items-center justify-between p-5 rounded-2xl border-2 transition-all",
                hasVoted 
                  ? "bg-gray-50 dark:bg-gray-900/50 border-transparent" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-[#008751] dark:hover:border-green-500"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    hasVoted ? "bg-[#008751] border-[#008751]" : "border-gray-200 dark:border-gray-600 group-hover:border-[#008751]"
                  )}>
                    {hasVoted && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-xs">
                    {option.label}
                  </span>
                </div>
                {hasVoted && (
                  <span className="font-black text-[#008751] dark:text-green-400 text-xs">
                    {percentage}%
                  </span>
                )}
              </div>

              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  className="absolute inset-0 bg-[#008751]/10 dark:bg-green-500/10 z-0"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{totalVotes} Participants</span>
        </div>
        {hasVoted && (
          <p className="text-[10px] font-black text-[#008751] uppercase tracking-widest">
            Vote enregistré
          </p>
        )}
      </div>
    </div>
  );
};
