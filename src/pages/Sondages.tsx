import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Vote, Users, Calendar, CheckCircle2, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  end_date: string;
}

export const Sondages: React.FC = () => {
  const { tenant } = useTenant();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<string[]>([]);

  useEffect(() => {
    if (tenant) fetchPolls();
  }, [tenant]);

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .eq('is_active', true);

      if (error) throw error;
      setPolls(data || []);
    } catch (err) {
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (pollId: string) => {
    setVoted([...voted, pollId]);
  };

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Démocratie Participative</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Votre avis compte. Participez aux décisions de la commune en votant pour les projets qui vous tiennent à cœur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {loading ? (
            [1,2].map(i => <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-[48px] animate-pulse" />)
          ) : (
            polls.map((poll, i) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-900 p-10 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-colors"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400">
                    <Vote className="w-7 h-7" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <Calendar className="w-4 h-4" />
                    Expire le {new Date(poll.end_date).toLocaleDateString()}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight leading-tight">
                  {poll.title}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 flex-grow">
                  {poll.description}
                </p>

                {voted.includes(poll.id) ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-3xl border border-green-100 dark:border-green-800 flex items-center gap-4 text-[#008751] dark:text-green-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <p className="text-sm font-bold uppercase tracking-widest">Merci pour votre vote !</p>
                    </div>
                    <div className="space-y-4">
                      {poll.options.map((opt, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                            <span className="text-gray-600 dark:text-gray-400">{opt}</span>
                            <span className="text-[#008751] dark:text-green-400">{[45, 30, 25][idx] || 10}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${[45, 30, 25][idx] || 10}%` }}
                              className="h-full bg-[#008751] dark:bg-green-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {poll.options.map((option, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleVote(poll.id)}
                        className="w-full p-6 rounded-2xl border-2 border-gray-50 dark:border-gray-800 hover:border-[#008751] dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left font-bold text-gray-700 dark:text-gray-300 flex justify-between items-center group"
                      >
                        {option}
                        <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-[#008751] dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-800 flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <Users className="w-4 h-4" />
                    1,240 Participants
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <BarChart3 className="w-4 h-4" />
                    Résultats en direct
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
