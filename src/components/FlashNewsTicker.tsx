import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, X } from 'lucide-react';

export const FlashNewsTicker: React.FC = () => {
  const { tenant } = useTenant();
  const [news, setNews] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchFlashNews = async () => {
      let query = supabase
        .from('flash_news')
        .select('*')
        .eq('is_active', true);

      if (tenant) {
        query = query.eq('tenant_id', tenant.id);
      } else {
        query = query.is('tenant_id', null);
      }

      const { data } = await query.order('created_at', { ascending: false });
      
      if (data) setNews(data);
    };

    fetchFlashNews();
  }, [tenant]);

  useEffect(() => {
    if (news.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [news]);

  if (!isVisible || news.length === 0) return null;

  return (
    <div className="bg-[#E30613] text-white py-2 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 shrink-0 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Megaphone className="w-3 h-3" />
          Flash Info
        </div>
        
        <div className="flex-grow overflow-hidden relative h-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-0 flex items-center"
            >
              <p className="text-sm font-bold truncate">
                {news[currentIndex].content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="shrink-0 hover:bg-white/20 p-1 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
