import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { Bell, Check, Clock, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';

import { NotificationTarget } from '../types';

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [notifications, setNotifications] = useState<NotificationTarget[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Real-time subscription for new notifications
      const channel = supabase
        .channel('notifications_changes')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notification_targets'
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, tenant]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_targets')
        .select(`
          *,
          notification:notifications(*)
        `)
        .or(`user_id.eq.${user.id},and(user_id.is.null,tenant_id.eq.${tenant?.id || ''}),and(user_id.is.null,tenant_id.is.null)`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data as NotificationTarget[] || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_targets')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notification_targets')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', unreadIds);

      if (error) throw error;
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'normal': return <Info className="w-4 h-4 text-blue-500" />;
      case 'low': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-[#008751] dark:text-gray-400 dark:hover:text-green-400 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-white dark:bg-gray-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight dark:text-white">Notifications</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Vous avez {unreadCount} messages non lus</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[9px] font-black text-[#008751] hover:underline uppercase tracking-widest"
                  >
                    Tout lire
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <Bell className="w-12 h-12 text-gray-100 dark:text-gray-800 mx-auto" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-5 flex gap-3 transition-colors group relative",
                          !n.is_read ? "bg-green-50/30 dark:bg-green-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                      >
                        <div className="shrink-0 mt-1">
                          {getIcon(n.notification?.priority || 'info')}
                        </div>
                        <div className="flex-grow space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <p className={cn(
                              "text-xs leading-relaxed",
                              !n.is_read ? "font-black text-gray-900 dark:text-white" : "font-bold text-gray-600 dark:text-gray-400"
                            )}>
                              {n.notification?.title}
                            </p>
                            {!n.is_read && (
                              <button 
                                onClick={() => markAsRead(n.id)}
                                className="shrink-0 p-1 text-gray-300 hover:text-[#008751] transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">
                            {n.notification?.body}
                          </p>
                          {n.notification?.image_url && (
                            <img 
                              src={n.notification.image_url} 
                              alt="" 
                              className="w-full h-24 object-cover rounded-xl mt-2"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              {formatDate(n.created_at)}
                            </div>
                            {n.notification?.action_url && (
                              <a 
                                href={n.notification.action_url}
                                className="text-[10px] font-black text-[#008751] uppercase tracking-widest hover:underline"
                              >
                                En savoir plus
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 text-center">
                <button className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest">
                  Voir tout l'historique
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
