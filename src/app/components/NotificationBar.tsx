'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // You'll need to create this
import { FiX, FiBell, FiInfo } from 'react-icons/fi';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read: boolean;
}

export function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Fetch existing notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && !error) {
        setNotifications(data);
      }
    };

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    fetchNotifications();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .match({ id });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-96 space-y-2">
      <AnimatePresence>
        {notifications.slice(0, showAll ? undefined : 3).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`relative p-4 rounded-lg shadow-lg border ${
              notification.read ? 'opacity-75' : ''
            } ${
              notification.type === 'info'
                ? 'bg-blue-500/10 border-blue-500/20'
                : notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/20'
                : notification.type === 'warning'
                ? 'bg-yellow-500/10 border-yellow-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-full ${
                  notification.type === 'info'
                    ? 'bg-blue-500/20'
                    : notification.type === 'success'
                    ? 'bg-green-500/20'
                    : notification.type === 'warning'
                    ? 'bg-yellow-500/20'
                    : 'bg-red-500/20'
                }`}
              >
                <FiBell className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {!notification.read && (
              <button
                onClick={() => markAsRead(notification.id)}
                className="absolute bottom-2 right-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark as read
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {notifications.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          {showAll ? 'Show less' : `Show ${notifications.length - 3} more`}
        </button>
      )}
    </div>
  );
} 