import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion } from 'motion/react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  link: string;
}

export const PartnerTicker: React.FC = () => {
  const { tenant } = useTenant();
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    if (tenant) {
      fetchPartners();
    }
  }, [tenant]);

  const fetchPartners = async () => {
    const { data } = await supabase
      .from('partners')
      .select('*')
      .eq('tenant_id', tenant?.id)
      .eq('is_active', true)
      .order('order', { ascending: true });
    
    if (data) setPartners(data);
  };

  if (partners.length === 0) return null;

  // Duplicate partners to create seamless loop
  const displayPartners = [...partners, ...partners, ...partners];

  return (
    <section className="py-20 bg-white dark:bg-gray-950 overflow-hidden border-t border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EBB700]" />
          Nos Partenaires Stratégiques
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
          Ils nous font confiance
        </h2>
      </div>

      <div className="relative flex">
        <motion.div
          animate={{
            x: [0, -100 * partners.length],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
          className="flex gap-12 items-center whitespace-nowrap"
        >
          {displayPartners.map((partner, idx) => (
            <div 
              key={`${partner.id}-${idx}`}
              className="flex-shrink-0 w-48 h-24 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all flex items-center justify-center p-4"
            >
              <img 
                src={partner.logo_url} 
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
