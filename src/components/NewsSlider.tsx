import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';

interface News {
  id: string;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
}

export const NewsSlider: React.FC = () => {
  const { tenant } = useTenant();
  const [news, setNews] = useState<News[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      fetchLatestNews();
    }
  }, [tenant]);

  const fetchLatestNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('tenant_id', tenant?.id)
      .order('published_at', { ascending: false })
      .limit(4);
    
    if (data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    if (news.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [news]);

  if (loading || news.length === 0) return null;

  const current = news[currentIndex];

  return (
    <div className="relative h-[500px] w-full overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <img 
            src={current.image_url || 'https://picsum.photos/seed/news/1920/1080'} 
            className="w-full h-full object-cover"
            alt={current.title}
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 md:p-16 max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 max-w-2xl"
            >
              <div className="flex items-center gap-3 text-[#EBB700] font-black text-[10px] uppercase tracking-[0.3em]">
                <Calendar className="w-3 h-3" />
                {new Date(current.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <Link to={`/${tenant?.slug}/actualites?id=${current.id}`}>
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none hover:text-[#EBB700] transition-colors">
                  {current.title}
                </h2>
              </Link>
              <p className="text-gray-300 text-sm md:text-base line-clamp-2 font-medium">
                {current.content.replace(/<[^>]*>/g, '')}
              </p>
              <div className="pt-4">
                <Link 
                  to={`/${tenant?.slug}/actualites?id=${current.id}`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#EBB700] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all group"
                >
                  Lire l'article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 z-30 flex gap-2">
        <button 
          onClick={() => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length)}
          className="p-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % news.length)}
          className="p-4 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-8 z-30 flex gap-2">
        {news.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1.5 transition-all rounded-full",
              currentIndex === idx ? "w-8 bg-[#EBB700]" : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
