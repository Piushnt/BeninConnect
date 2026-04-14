import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { usePageContent } from '../hooks/usePageContent';
import { motion } from 'motion/react';
import { Quote, Calendar, Award, Target, MessageSquare, Users } from 'lucide-react';

export const Maire: React.FC = () => {
  const { tenant } = useTenant();
  const { sections } = usePageContent('maire');
  const [maire, setMaire] = useState<any>(null);

  useEffect(() => {
    if (tenant) fetchMaire();
  }, [tenant]);

  const fetchMaire = async () => {
    // Fetch the member with the highest rank role (usually the Maire)
    const { data } = await supabase
      .from('council_members')
      .select('*, council_roles(*)')
      .eq('tenant_id', tenant?.id)
      .order('rank', { foreignTable: 'council_roles', ascending: true })
      .limit(1)
      .single();
    setMaire(data);
  };

  const bioContent = sections.biography || {
    name: maire?.full_name || "Le Maire",
    bio: maire?.bio || "Ma vision pour notre commune est celle d'un territoire moderne, solidaire et prospère. Ensemble, nous bâtissons l'avenir de nos enfants à travers des services publics de qualité et une gestion transparente.",
    photo_url: maire?.photo_url || "https://picsum.photos/seed/mayor/1920/1080"
  };

  const visionContent = sections.vision || {
    title: "Le Mot du Maire",
    content: bioContent.bio
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src={bioContent.photo_url} 
            className="w-full h-full object-cover"
            alt="Le Maire"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#EBB700] text-black rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <Award className="w-4 h-4" />
              L'Autorité Municipale
            </div>
            <h1 className="text-7xl font-black text-white uppercase tracking-tight leading-none">
              {bioContent.name}
            </h1>
            <p className="text-2xl font-bold text-green-400 uppercase tracking-widest">
              Maire de la commune de {tenant?.name}
            </p>
            <div className="flex gap-6">
              <button className="px-8 py-4 bg-[#008751] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#006b40] transition-all flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                Contacter le cabinet
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vision Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -top-12 -left-12 text-gray-100 dark:text-gray-900">
              <Quote className="w-48 h-48" />
            </div>
            <div className="relative space-y-8">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{visionContent.title}</h2>
              <div className="w-24 h-1.5 bg-[#008751]" />
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
                "{visionContent.content}"
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: 'Vision 2030', desc: 'Modernisation des infrastructures et digitalisation.' },
              { icon: Users, title: 'Proximité', desc: 'Une mairie à l\'écoute de chaque citoyen.' },
              { icon: Award, title: 'Excellence', desc: 'Rigueur et transparence dans la gestion publique.' },
              { icon: Calendar, title: 'Mandat', desc: '2020 - 2026 : Un engagement pour le progrès.' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 space-y-4 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-[#008751] dark:text-green-400 shadow-sm">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
