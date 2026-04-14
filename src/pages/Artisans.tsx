import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Search, MapPin, Phone, Star, ShieldCheck, Filter, Hammer } from 'lucide-react';
import { cn } from '../lib/utils';

interface Artisan {
  id: string;
  full_name: string;
  trade: string;
  arrondissement: string;
  phone: string;
  is_verified: boolean;
}

export const Artisans: React.FC = () => {
  const { tenant } = useTenant();
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tenant) fetchArtisans();
  }, [tenant]);

  const fetchArtisans = async () => {
    try {
      const { data, error } = await supabase
        .from('artisans')
        .select('*')
        .eq('tenant_id', tenant?.id);

      if (error) throw error;
      setArtisans(data || []);
    } catch (err) {
      console.error('Error fetching artisans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtisans = artisans.filter(a => 
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.trade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Annuaire des Artisans</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Soutenez l'économie locale. Trouvez des artisans qualifiés et vérifiés par la mairie de {tenant?.name}.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Rechercher par métier ou nom (ex: Menuisier, Maçon...)"
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-[#008751]/20 transition-all font-bold text-sm dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Filter className="w-4 h-4" />
            Arrondissement
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-[40px] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtisans.map((artisan, i) => (
              <motion.div
                key={artisan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                {artisan.is_verified && (
                  <div className="absolute top-0 right-0 p-6">
                    <div className="bg-green-50 dark:bg-green-900/20 text-[#008751] dark:text-green-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Vérifié
                    </div>
                  </div>
                )}

                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 mb-8 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors">
                  <Hammer className="w-8 h-8" />
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{artisan.full_name}</h3>
                  <p className="text-xs font-black text-[#008751] dark:text-green-400 uppercase tracking-widest">{artisan.trade}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <MapPin className="w-4 h-4" />
                    {artisan.arrondissement || 'Za-Kpota Centre'}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <Star className="w-4 h-4 text-[#EBB700]" />
                    4.8 / 5 (12 avis)
                  </div>
                </div>

                <button className="w-full py-4 bg-gray-900 dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95">
                  <Phone className="w-4 h-4" />
                  Appeler : {artisan.phone || '+229 00 00 00 00'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Register CTA */}
        <div className="mt-24 bg-[#008751] p-12 rounded-[60px] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center shrink-0 backdrop-blur-md">
            <Hammer className="w-12 h-12" />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-black uppercase tracking-tight">Vous êtes artisan ?</h3>
            <p className="text-green-100 font-medium max-w-2xl">
              Rejoignez l'annuaire officiel de la mairie pour gagner en visibilité et rassurer vos clients grâce au badge de vérification.
            </p>
          </div>
          <button className="px-10 py-5 bg-white text-[#008751] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#EBB700] hover:text-black transition-all shrink-0">
            S'inscrire gratuitement
          </button>
        </div>
      </div>
    </div>
  );
};
