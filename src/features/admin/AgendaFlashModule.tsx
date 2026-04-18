import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useTenant } from '../../contexts/TenantContext';
import { motion } from 'motion/react';
import { Zap, Calendar, Trash2, Plus, Edit2, Compass, X } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const AgendaFlashModule = () => {
  const { tenant } = useTenant();
  const [flashNews, setFlashNews] = useState<any[]>([]);
  const [agendaEvents, setAgendaEvents] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  
  const [newFlash, setNewFlash] = useState('');
  const [newEvent, setNewEvent] = useState({ title: '', description: '', event_date: '', location: '' });

  useEffect(() => {
    if (tenant) {
      fetchFlashNews();
      fetchAgenda();
      fetchLocations();
    }
  }, [tenant]);

  const fetchFlashNews = async () => {
    const { data } = await supabase.from('flash_news').select('*').eq('tenant_id', tenant?.id).order('created_at', { ascending: false });
    if (data) setFlashNews(data);
  };

  const fetchAgenda = async () => {
    const { data } = await supabase.from('agenda_events').select('*').eq('tenant_id', tenant?.id).order('event_date', { ascending: true });
    if (data) setAgendaEvents(data);
  };

  const fetchLocations = async () => {
    const { data } = await supabase.from('locations').select('*').eq('tenant_id', tenant?.id).eq('category', 'tourisme');
    if (data) setLocations(data);
  };

  const handleAddFlash = async () => {
    if (!newFlash.trim()) return;
    await supabase.from('flash_news').insert({ tenant_id: tenant?.id, content: newFlash, is_active: true });
    setNewFlash('');
    setIsFlashModalOpen(false);
    fetchFlashNews();
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) return;
    await supabase.from('agenda_events').insert({ 
      tenant_id: tenant?.id, 
      title: newEvent.title,
      description: newEvent.description,
      event_date: newEvent.event_date,
      location: newEvent.location
    });
    setNewEvent({ title: '', description: '', event_date: '', location: '' });
    setIsAgendaModalOpen(false);
    fetchAgenda();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-black text-gray-900 dark:text-white uppercase tracking-tight">Communication Express</h2>
        <div className="flex gap-4">
            <button className="btn-primary" onClick={() => setIsFlashModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Flash</button>
            <button className="btn-primary" onClick={() => setIsAgendaModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Événement</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-glass p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Fil d'Infos Flash
            </h3>
            <div className="space-y-4">
                {flashNews.map((f: any) => (
                  <div key={f.id} className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl flex justify-between items-center group">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{f.content}</p>
                    <button onClick={async () => {
                        await supabase.from('flash_news').delete().eq('id', f.id);
                        fetchFlashNews();
                    }} className="text-gray-300 hover:text-red-500 hover:scale-110 transition-transform hidden group-hover:block"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {flashNews.length === 0 && <p className="text-gray-400 text-xs text-center font-bold italic">Aucune information flash active.</p>}
            </div>
          </div>

          <div className="card-glass p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Agenda Municipal
            </h3>
            <div className="space-y-4">
                {agendaEvents.map((e: any) => (
                  <div key={e.id} className="p-4 bg-white/50 dark:bg-white/5 rounded-2xl flex justify-between items-center group">
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{e.title}</p>
                      <p className="text-[10px] text-gray-500 font-bold">{formatDate(e.event_date)} • {e.location}</p>
                    </div>
                    <button onClick={async () => {
                        await supabase.from('agenda_events').delete().eq('id', e.id);
                        fetchAgenda();
                    }} className="text-gray-300 hover:text-red-500 hover:scale-110 transition-transform hidden group-hover:block"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {agendaEvents.length === 0 && <p className="text-gray-400 text-xs text-center font-bold italic">L'agenda municipal est vide.</p>}
            </div>
          </div>
      </div>

      <div className="card-glass p-8 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Guide Touristique (Mise en avant)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {locations.length > 0 ? locations.map((loc: any) => (
              <div key={loc.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-3">
                  <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-xl overflow-hidden relative">
                    {loc.image_url ? <img src={loc.image_url} alt="" className="w-full h-full object-cover" /> : <Compass className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                  </div>
                  <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white truncate">{loc.name}</h4>
              </div>
            )) : <p className="text-gray-400 text-xs italic">Aucun lieu touristique ajouté.</p>}
          </div>
      </div>

      {isFlashModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setIsFlashModalOpen(false)} className="absolute top-4 right-4"><X /></button>
            <h3 className="text-xl font-bold mb-4">Nouveau Flash Info</h3>
            <textarea 
              rows={3} 
              className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-white/5 mb-4 outline-none" 
              placeholder="Texte défilant..."
              value={newFlash}
              onChange={e => setNewFlash(e.target.value)}
            />
            <button onClick={handleAddFlash} className="btn-primary w-full">Publier</button>
          </motion.div>
        </div>
      )}

      {isAgendaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={() => setIsAgendaModalOpen(false)} className="absolute top-4 right-4"><X /></button>
            <h3 className="text-xl font-bold mb-4">Nouvel Événement Agenda</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Titre de l'événement" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-white/5 outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <input type="date" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-white/5 outline-none" value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})} />
              <input type="text" placeholder="Lieu (Ex: Stade municipal)" className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-white/5 outline-none" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
              <textarea placeholder="Description" rows={3} className="w-full border rounded-xl p-3 bg-gray-50 dark:bg-white/5 outline-none" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <button onClick={handleAddEvent} className="btn-primary w-full">Ajouter à l'agenda</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
