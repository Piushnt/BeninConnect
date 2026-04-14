import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { useAuth } from '../contexts/AuthContext';
import { usePageContent } from '../hooks/usePageContent';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Share2, 
  Heart, 
  MessageCircle, 
  ChevronRight, 
  Tag, 
  Send, 
  User, 
  X,
  Facebook,
  Twitter,
  Mail,
  Link as LinkIcon,
  ArrowRight,
  Bookmark,
  Search,
  MapPin
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { News, NewsComment } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const SimilarNews: React.FC<{ currentNews: News }> = ({ currentNews }) => {
  const { tenant } = useTenant();
  const [similar, setSimilar] = useState<News[]>([]);

  useEffect(() => {
    if (tenant && currentNews.category) {
      fetchSimilar();
    }
  }, [tenant, currentNews]);

  const fetchSimilar = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('tenant_id', tenant?.id)
      .eq('category', currentNews.category)
      .neq('id', currentNews.id)
      .limit(3);
    
    setSimilar(data || []);
  };

  if (similar.length === 0) return null;

  return (
    <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-black uppercase tracking-tight mb-8 dark:text-white">Actualités Similaires</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {similar.map((item) => (
          <Link 
            key={item.id} 
            to={`/${tenant?.slug}/actualites?id=${item.id}`}
            className="group block space-y-4"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="aspect-video rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <img 
                src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-[8px] font-black text-[#008751] uppercase tracking-widest mb-1">{item.category}</p>
              <h4 className="text-sm font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[#008751] transition-colors">
                {item.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const CommentSection: React.FC<{ newsId: string; isOpen: boolean; onClose: () => void }> = ({ newsId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, newsId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('news_comments')
      .select('*, user:user_profiles(*)')
      .eq('news_id', newsId)
      .order('created_at', { ascending: true });

    if (!error) setComments(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('news_comments')
      .insert({
        news_id: newsId,
        user_id: user.id,
        content: newComment.trim()
      });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-100 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden"
        >
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Commentaires ({comments.length})</h4>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 font-medium italic">Aucun commentaire pour le moment. Soyez le premier à réagir !</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {comment.user?.avatar_url ? (
                        <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-black text-[#008751] uppercase tracking-tight mb-1">
                          {comment.user?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                      </div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 ml-2">
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {user ? (
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrire un commentaire..."
                  className="w-full pl-6 pr-12 py-3 bg-white dark:bg-gray-900 rounded-xl text-xs font-medium border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#008751] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center py-2">
                Connectez-vous pour laisser un commentaire
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const Actualites: React.FC = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const { sections } = usePageContent('news');
  const newsContent = sections.hero;
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(new URLSearchParams(window.location.search).get('id'));

  useEffect(() => {
    const handlePopState = () => {
      setSelectedNewsId(new URLSearchParams(window.location.search).get('id'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    setSelectedNewsId(new URLSearchParams(window.location.search).get('id'));
  }, [window.location.search]);

  useEffect(() => {
    fetchNews();
  }, [tenant, user]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Fetch news with likes count and check if current user liked it
      let query = supabase
        .from('news')
        .select(`
          *,
          tenants(name, slug),
          news_likes(user_id),
          news_bookmarks(user_id),
          news_comments(id)
        `);

      if (tenant) {
        query = query.eq('tenant_id', tenant.id);
      }

      const { data, error } = await query.order('published_at', { ascending: false });

      if (error) throw error;

      const processedNews = data.map((item: any) => ({
        ...item,
        likes_count: item.news_likes?.length || 0,
        comments_count: item.news_comments?.length || 0,
        is_liked: item.news_likes?.some((l: any) => l.user_id === user?.id),
        is_bookmarked: item.news_bookmarks?.some((b: any) => b.user_id === user?.id)
      }));

      setNews(processedNews);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (newsId: string) => {
    if (!user) return;

    const item = news.find(n => n.id === newsId);
    if (!item) return;

    try {
      if (item.is_liked) {
        await supabase
          .from('news_likes')
          .delete()
          .match({ news_id: newsId, user_id: user.id });
      } else {
        await supabase
          .from('news_likes')
          .insert({ news_id: newsId, user_id: user.id });
      }
      
      // Optimistic update
      setNews(news.map(n => {
        if (n.id === newsId) {
          return {
            ...n,
            is_liked: !n.is_liked,
            likes_count: (n.likes_count || 0) + (n.is_liked ? -1 : 1)
          };
        }
        return n;
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async (newsId: string) => {
    if (!user) return;

    const item = news.find(n => n.id === newsId);
    if (!item) return;

    try {
      if (item.is_bookmarked) {
        await supabase
          .from('news_bookmarks')
          .delete()
          .match({ news_id: newsId, user_id: user.id });
      } else {
        await supabase
          .from('news_bookmarks')
          .insert({ news_id: newsId, user_id: user.id });
      }
      
      // Optimistic update
      setNews(news.map(n => {
        if (n.id === newsId) {
          return {
            ...n,
            is_bookmarked: !n.is_bookmarked
          };
        }
        return n;
      }));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleShare = (item: News) => {
    const url = window.location.href;
    const text = `${item.title} - Mairie de ${tenant?.name}`;
    
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: text,
        url: url,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard or show options
      navigator.clipboard.writeText(url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const categories = Array.from(new Set(news.map(n => n.category).filter(Boolean)));
  const filteredNews = news.filter(n => {
    const matchesCategory = !selectedCategory || n.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedNews = news.find(n => n.id === selectedNewsId);

  if (selectedNews) {
    return (
      <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => {
              navigate(`/${tenant?.slug}/actualites`);
              setSelectedNewsId(null);
            }}
            className="mb-12 flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#008751] uppercase tracking-widest transition-all group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Retour aux actualités
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-8 space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-[#008751] text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    {selectedNews.category || 'Information'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedNews.published_at || selectedNews.created_at)}
                  </div>
                </div>
                
                <h1 className="text-5xl font-black text-gray-900 dark:text-white leading-[1.1] uppercase tracking-tight">
                  {selectedNews.title}
                </h1>

                <div className="flex items-center gap-4 py-6 border-y border-gray-100 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-full bg-[#008751]/10 flex items-center justify-center text-[#008751]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Publié par</p>
                    <p className="font-black text-gray-900 dark:text-white">Mairie de {tenant?.name}</p>
                  </div>
                </div>
              </div>

              <div className="aspect-[16/9] rounded-[48px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                <img 
                  src={selectedNews.image_url || `https://picsum.photos/seed/${selectedNews.id}/1200/800`} 
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="prose prose-xl dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 leading-[1.8] font-medium whitespace-pre-wrap first-letter:text-5xl first-letter:font-black first-letter:text-[#008751] first-letter:mr-3 first-letter:float-left">
                  {selectedNews.content}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[48px] p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-8">
                  <MessageCircle className="w-6 h-6 text-[#008751]" />
                  <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Discussion Citoyenne</h3>
                </div>
                <CommentSection 
                  newsId={selectedNews.id} 
                  isOpen={true} 
                  onClose={() => {}} 
                />
              </div>
            </motion.article>

            {/* Sidebar Actions */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white dark:bg-gray-900 rounded-[40px] p-8 shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 dark:border-gray-800 pb-4">Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleLike(selectedNews.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border-2",
                        selectedNews.is_liked 
                          ? "bg-red-50 border-red-100 text-red-500" 
                          : "bg-gray-50 border-transparent text-gray-400 hover:border-red-100 hover:text-red-500"
                      )}
                    >
                      <Heart className={cn("w-6 h-6", selectedNews.is_liked && "fill-current")} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{selectedNews.likes_count || 0} J'aime</span>
                    </button>

                    <button 
                      onClick={() => handleBookmark(selectedNews.id)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-3xl transition-all border-2",
                        selectedNews.is_bookmarked 
                          ? "bg-yellow-50 border-yellow-100 text-[#EBB700]" 
                          : "bg-gray-50 border-transparent text-gray-400 hover:border-yellow-100 hover:text-[#EBB700]"
                      )}
                    >
                      <Bookmark className={cn("w-6 h-6", selectedNews.is_bookmarked && "fill-current")} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sauvegarder</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => handleShare(selectedNews)}
                    className="w-full py-5 bg-gray-900 dark:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager l'article
                  </button>

                  <div className="flex justify-center gap-6 pt-4">
                    <Facebook className="w-5 h-5 text-gray-400 hover:text-[#1877F2] cursor-pointer transition-colors" />
                    <Twitter className="w-5 h-5 text-gray-400 hover:text-[#1DA1F2] cursor-pointer transition-colors" />
                    <Mail className="w-5 h-5 text-gray-400 hover:text-[#EA4335] cursor-pointer transition-colors" />
                    <LinkIcon className="w-5 h-5 text-gray-400 hover:text-[#008751] cursor-pointer transition-colors" />
                  </div>
                </div>

                {/* Newsletter or CTA */}
                <div className="bg-[#008751] rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10 space-y-4">
                    <h4 className="text-lg font-black uppercase tracking-tight">Restez informé</h4>
                    <p className="text-white/80 text-xs font-medium leading-relaxed">
                      Recevez les dernières actualités de la commune directement dans votre boîte mail.
                    </p>
                    <div className="pt-4">
                      <input 
                        type="email" 
                        placeholder="votre@email.com"
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-xs font-medium placeholder:text-white/40 focus:ring-2 focus:ring-white/20 outline-none transition-all mb-3"
                      />
                      <button className="w-full py-4 bg-[#EBB700] text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 transition-all">
                        S'abonner
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <SimilarNews currentNews={selectedNews} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            {newsContent?.title || 'E-Actualités'}
          </h1>
          <div className="w-24 h-1.5 bg-[#EBB700] mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {newsContent?.subtitle || `Suivez l'actualité et les grands projets de la commune de ${tenant?.name || 'votre mairie'}.`}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto mt-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#008751] transition-colors" />
            <input 
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm focus:ring-4 focus:ring-[#008751]/10 outline-none transition-all text-sm font-medium dark:text-white"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              !selectedCategory 
                ? "bg-[#008751] text-white shadow-lg shadow-[#008751]/20" 
                : "bg-white dark:bg-gray-900 text-gray-400 hover:text-[#008751] border border-gray-100 dark:border-gray-800"
            )}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                selectedCategory === cat 
                  ? "bg-[#008751] text-white shadow-lg shadow-[#008751]/20" 
                  : "bg-white dark:bg-gray-900 text-gray-400 hover:text-[#008751] border border-gray-100 dark:border-gray-800"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3].map(i => <div key={i} className="h-[450px] bg-gray-200 dark:bg-gray-800 rounded-[48px] animate-pulse" />)}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Aucun article dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredNews.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-[48px] overflow-hidden shadow-sm hover:shadow-2xl transition-all group border border-gray-100 dark:border-gray-800 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image_url || `https://picsum.photos/seed/${item.id}/800/600`} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <button 
                      onClick={() => setSelectedCategory(item.category)}
                      className="px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-[#008751] dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform"
                    >
                      {item.category || 'Information'}
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.published_at || item.created_at)}
                      </div>
                      {!tenant && item.tenants && (
                        <div className="flex items-center gap-2 text-[#008751]">
                          <MapPin className="w-3 h-3" />
                          {item.tenants.name}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleBookmark(item.id)}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          item.is_bookmarked ? "bg-yellow-50 text-[#EBB700]" : "text-gray-400 hover:text-[#EBB700]"
                        )}
                      >
                        <Bookmark className={cn("w-4 h-4", item.is_bookmarked && "fill-current")} />
                      </button>
                      <button 
                        onClick={() => handleLike(item.id)}
                        className={cn(
                          "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all",
                          item.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", item.is_liked && "fill-current")} />
                        {item.likes_count || 0}
                      </button>
                      <button 
                        onClick={() => setActiveComments(activeComments === item.id ? null : item.id)}
                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#008751] transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {item.comments_count || 0}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-[#008751] dark:group-hover:text-green-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.category && (
                      <button 
                        onClick={() => setSelectedCategory(item.category)}
                        className="flex items-center gap-1.5 text-[8px] font-black text-[#008751] dark:text-green-400 uppercase tracking-widest hover:underline"
                      >
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </button>
                    )}
                  </div>

                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {item.content}
                  </p>

                  <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                    <button 
                      onClick={() => {
                        const slug = tenant?.slug || (item as any).tenants?.slug;
                        navigate(`/${slug}/actualites?id=${item.id}`);
                        setSelectedNewsId(item.id);
                        window.scrollTo(0, 0);
                      }}
                      className="flex items-center gap-2 text-xs font-black text-[#008751] dark:text-green-400 uppercase tracking-widest hover:gap-4 transition-all"
                    >
                      Lire la suite
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleShare(item)}
                      className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-[#008751] dark:hover:text-green-400 rounded-xl transition-all hover:scale-110"
                    >
                      <Share2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <CommentSection 
                  newsId={item.id} 
                  isOpen={activeComments === item.id} 
                  onClose={() => setActiveComments(null)} 
                />
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
