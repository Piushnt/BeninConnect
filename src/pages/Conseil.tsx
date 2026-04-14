import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';
import { Users, Shield, Award, ChevronRight } from 'lucide-react';

interface Member {
  id: string;
  full_name: string;
  position: string;
  photo_url: string;
  rank: number;
}

export const Conseil: React.FC = () => {
  const { tenant } = useTenant();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) fetchMembers();
  }, [tenant]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('council_members')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('rank', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Conseil Municipal</h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            Découvrez les élus qui travaillent au quotidien pour le développement de la commune de {tenant?.name}.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-[40px] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group border border-gray-100 dark:border-gray-800"
              >
                <div className="h-64 relative overflow-hidden">
                  <img 
                    src={member.photo_url || `https://picsum.photos/seed/${member.id}/400/600`} 
                    alt={member.full_name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                </div>
                
                <div className="p-6 text-center space-y-2">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                    {member.full_name}
                  </h3>
                  <p className="text-[10px] font-black text-[#008751] dark:text-green-400 uppercase tracking-[0.2em]">
                    {member.position}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  <button className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#008751] dark:hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    Voir le profil
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Transparency Card */}
        <div className="mt-24 bg-gray-900 p-12 rounded-[60px] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
            <Shield className="w-12 h-12 text-[#EBB700]" />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-black uppercase tracking-tight">Transparence Politique</h3>
            <p className="text-gray-400 font-medium max-w-2xl">
              Le conseil municipal se réunit régulièrement pour délibérer sur les affaires de la commune. Tous les rapports de session sont accessibles publiquement.
            </p>
          </div>
          <button className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#EBB700] transition-all shrink-0">
            Consulter les rapports
          </button>
        </div>
      </div>
    </div>
  );
};
