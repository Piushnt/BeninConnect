import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Download, 
  ExternalLink,
  Info,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Avis' | 'Décret' | 'Recrutement' | 'Information' | 'Urgent';
  image_url: string;
  document_url: string;
  published_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Toutes', icon: Filter },
  { id: 'Avis', label: 'Avis', icon: Megaphone },
  { id: 'Décret', label: 'Décrets', icon: FileText },
  { id: 'Recrutement', label: 'Recrutement', icon: UserPlus },
  { id: 'Information', label: 'Infos', icon: Info },
  { id: 'Urgent', label: 'Urgent', icon: AlertTriangle },
];

export const Annonces: React.FC = () => {
  const { tenant } = useTenant();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (tenant) {
      fetchAnnouncements();
    }
  }, [tenant]);

  useEffect(() => {
    let result = announcements;
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.content.toLowerCase().includes(q)
      );
    }
    setFilteredAnnouncements(result);
  }, [selectedCategory, searchQuery, announcements]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-6 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#008751]/10 text-[#008751] rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Megaphone className="w-4 h-4" />
              Communication Officielle
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none"
            >
              Toutes les <br />
              <span className="text-[#008751]">Annonces Officielles</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed"
            >
              Consultez les derniers avis, décrets et opportunités de recrutement de la mairie de {tenant?.name}.
            </motion.p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="RECHERCHER UNE ANNONCE..."
                className="w-full md:w-[300px] pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-[#008751] rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none dark:text-white shadow-xl shadow-black/5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto pb-8 gap-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl scale-105'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800 hover:border-[#008751]'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Announcements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAnnouncements.map((annonce, index) => (
              <AnnouncementCard key={annonce.id} annonce={annonce} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {!loading && filteredAnnouncements.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 bg-white dark:bg-gray-900 rounded-[48px] border border-dashed border-gray-200 dark:border-gray-700"
          >
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
              <Megaphone className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Aucune annonce trouvée</h3>
            <p className="text-gray-500 text-sm font-medium">Réessayez avec d'autres filtres ou mots-clés.</p>
          </motion.div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] rounded-[48px] bg-white dark:bg-gray-900 animate-pulse border border-gray-100 dark:border-gray-800" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AnnouncementCard = ({ annonce, index }: { annonce: Announcement; index: number }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-3xl hover:shadow-[#008751]/5 transition-all duration-500 flex flex-col h-full"
    >
      {/* Category Tag */}
      <div className="absolute top-8 left-8 z-10">
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md border ${
          annonce.category === 'Urgent' 
            ? 'bg-red-500/10 text-red-500 border-red-500/20' 
            : 'bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-white border-white/20'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${annonce.category === 'Urgent' ? 'bg-red-500' : 'bg-[#008751]'}`} />
          {annonce.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 pt-20 flex-grow space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(annonce.published_at)}
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none group-hover:text-[#008751] transition-colors">
          {annonce.title}
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium line-clamp-4">
          {annonce.content}
        </p>
      </div>

      {/* Footer */}
      <div className="p-8 pt-0 mt-auto">
        <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
          {annonce.document_url ? (
            <a 
              href={annonce.document_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#008751] hover:text-white transition-all group/btn"
            >
              <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              Document Officiel
            </a>
          ) : (
            <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Usage Interne</div>
          )}
          
          <button className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-[#008751] group-hover:text-white transition-all group-hover:rotate-45">
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
