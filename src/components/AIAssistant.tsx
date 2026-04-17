import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';
import { useTenant } from '../contexts/TenantContext';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const { tenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [poiContext, setPoiContext] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tenant) {
      fetchPoisForContext();
    }
  }, [tenant]);

  const fetchPoisForContext = async () => {
    try {
      const { data } = await supabase
        .from('locations')
        .select('name, category, description')
        .eq('tenant_id', tenant?.id)
        .limit(10);
      
      if (data && data.length > 0) {
        const context = data.map(p => `- ${p.name} (${p.category}): ${p.description}`).join('\n');
        setPoiContext(context);
      }
    } catch (err) {
      console.error('Error fetching context:', err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const models = [
      "gemini-3-flash-preview",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];

    const systemInstruction = `
      Tu es l'assistant IA officiel "Guide de l'Administration" de la plateforme Bénin Commune Connect.
      Actuellement, tu aides un citoyen sur le portail de la commune de : ${tenant?.name || 'Bénin (Portail National)'}.
      
      Tes missions :
      1. Répondre aux questions sur les services municipaux (état civil, urbanisme, taxes, etc.) en te basant sur le Code de l'administration territoriale du Bénin.
      2. Guider l'utilisateur étape par étape dans ses démarches administratives.
      3. Expliquer les pièces à fournir pour chaque dossier (acte de naissance, certificat de résidence, etc.).
      4. Devenir un véritable ambassadeur de ton terroir : suggère activement des lieux à visiter, des restaurants locaux, des marchés et des festivités culturelles.
      5. Si une information spécifique à la commune est manquante, propose des alternatives ou redirige vers le contact de la mairie.
      6. Utilise un ton professionnel, pédagogique et très serviable (accueil chaleureux béninois).
      
      Points d'intérêt et richesses de la commune :
      ${poiContext || "Richesses locales en cours d'exploration..."}
      
      Encouragement : Pour chaque interaction, essaye d'intégrer une touche culturelle ou touristique propre à la culture locale (Fon, Nago, Bariba, Dendi, etc. selon la région).
    `;

    let assistantMessage = "";
    let success = false;

    for (const modelName of models) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })).concat([{ role: 'user', parts: [{ text: userMessage }] }]),
          config: {
            systemInstruction
          }
        });

        assistantMessage = response.text || "";
        
        if (assistantMessage) {
          success = true;
          break;
        }
      } catch (err) {
        console.error(`Error with model ${modelName}:`, err);
        continue;
      }
    }

    if (success) {
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, je rencontre une difficulté technique. Veuillez réessayer." }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-48px)] h-[600px] bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden transition-colors"
          >
            {/* Header */}
            <div className="bg-[#008751] dark:bg-[#004d2c] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-sm">Guide Administratif</h3>
                  <p className="text-[10px] font-bold text-green-100 uppercase tracking-widest">IA Active • {tenant?.name || 'National'}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/50">
              {messages.length === 0 && (
                <div className="text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-[#008751] dark:text-green-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">Comment puis-je vous guider ?</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 px-8">Je peux vous aider pour l'état civil, les taxes, ou toute démarche administrative locale.</p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group",
                    m.role === 'user' 
                      ? "bg-[#008751] dark:bg-green-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                  )}>
                    {m.content}
                    {m.role === 'assistant' && (
                      <button 
                        onClick={() => speak(m.content)}
                        className="absolute -right-10 top-0 p-2 text-gray-400 hover:text-[#008751] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700">
                    <Loader2 className="w-5 h-5 text-[#008751] dark:text-green-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Écrivez votre message..."
                  className="w-full pl-4 pr-12 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#008751]/20 outline-none transition-all dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#008751] dark:bg-green-600 text-white rounded-xl hover:bg-[#006b40] transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 group",
          isOpen ? "bg-white text-gray-900 rotate-90" : "bg-[#008751] text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#EBB700] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
};
