import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../contexts/TenantContext';
import { motion } from 'motion/react';
import { Vote, Plus, Edit2, Trash2, X, PlusCircle } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const SondageModule = () => {
  const { tenant } = useTenant();
  const [polls, setPolls] = useState<any[]>([]);
  const [budgetProjects, setBudgetProjects] = useState<any[]>([]);
  
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  useEffect(() => {
    if (tenant) {
      fetchPolls();
      fetchBudgets();
    }
  }, [tenant]);

  const fetchPolls = async () => {
    const { data } = await supabase.from('polls').select('*, poll_options(*)').eq('tenant_id', tenant?.id).order('created_at', { ascending: false });
    if (data) setPolls(data);
  };

  const fetchBudgets = async () => {
    const { data } = await supabase.from('budget_projects').select('*, author:author_id(full_name)').eq('tenant_id', tenant?.id).order('created_at', { ascending: false });
    if (data) setBudgetProjects(data);
  };

  const handleCreatePoll = async () => {
    if (!newPollTitle || newPollOptions.filter(o => o).length < 2) return;
    
    const { data: pollData, error: pollError } = await supabase.from('polls').insert({
      tenant_id: tenant?.id,
      title: newPollTitle,
      description: "Sondage communautaire",
      is_active: true
    }).select().single();

    if (pollData) {
      const validOptions = newPollOptions.filter(o => o.trim() !== '');
      const optionsInserts = validOptions.map(opt => ({
        poll_id: pollData.id,
        option_text: opt
      }));
      await supabase.from('poll_options').insert(optionsInserts);
      fetchPolls();
      setIsPollModalOpen(false);
      setNewPollTitle('');
      setNewPollOptions(['', '']);
    }
  };

  const addOptionField = () => setNewPollOptions([...newPollOptions, '']);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Sondages & Démocratie</h2>
        <div className="flex gap-4">
            <button className="btn-primary" onClick={() => setIsPollModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Créer un Sondage</button>
        </div>
      </div>
      
      {/* Liste des Sondages */}
      <div className="card-glass p-8 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Sondages Actifs & Passés
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.map((poll: any) => (
                <div key={poll.id} className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl relative group">
                  <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-lg ${poll.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{poll.is_active ? 'En cours' : 'Terminé'}</span>
                     <button onClick={async () => {
                         await supabase.from('polls').delete().eq('id', poll.id);
                         fetchPolls();
                     }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">{poll.title}</h4>
                  <div className="space-y-2">
                     {poll.poll_options?.map((opt: any) => (
                        <div key={opt.id} className="text-xs bg-white dark:bg-gray-800 p-2 rounded-lg flex justify-between">
                           <span>{opt.option_text}</span>
                           {/* Ici on peut mapper les votes globaux si jointure */}
                        </div>
                     ))}
                  </div>
                </div>
              ))}
              {polls.length === 0 && <p className="text-gray-400 text-xs italic">Aucun sondage publié.</p>}
          </div>
      </div>

      {/* Budgets Participatifs View */}
      <div className="card-glass p-8 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-[#008751] flex items-center gap-2">
            Budget Participatif
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {budgetProjects.map(proj => (
                <div key={proj.id} className="p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">{proj.status}</span>
                    <span className="text-[10px] font-black text-gray-400">{formatDate(proj.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-display font-black text-gray-900 dark:text-white uppercase leading-tight">{proj.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">{proj.description}</p>
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-600 uppercase">Par: {proj.author?.full_name}</span>
                    <button className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700">Supprimer</button>
                    </div>
                </div>
            ))}
            {budgetProjects.length === 0 && <p className="text-gray-400 text-xs italic">Aucun projet budgétaire.</p>}
          </div>
      </div>

      {isPollModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <button onClick={() => setIsPollModalOpen(false)} className="absolute top-4 right-4"><X /></button>
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">Créer un Sondage</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Posez votre question..." className="w-full border-b border-gray-200 dark:border-gray-700 px-2 py-3 bg-transparent text-lg font-bold outline-none mb-4" value={newPollTitle} onChange={e => setNewPollTitle(e.target.value)} />
              
              <div className="space-y-3">
                 <p className="text-xs font-bold text-gray-500 uppercase">Options de réponse</p>
                 {newPollOptions.map((opt, idx) => (
                    <input 
                      key={idx}
                      type="text" 
                      placeholder={`Option ${idx + 1}`} 
                      className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-white/5 outline-none text-sm" 
                      value={opt} 
                      onChange={e => {
                         const n = [...newPollOptions];
                         n[idx] = e.target.value;
                         setNewPollOptions(n);
                      }} 
                    />
                 ))}
                 <button onClick={addOptionField} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline mt-2"><PlusCircle className="w-3 h-3"/> Ajouter option</button>
              </div>

              <button onClick={handleCreatePoll} className="btn-primary w-full mt-6 py-4">Valider & Publier</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
