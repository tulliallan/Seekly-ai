'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheck, FiLogIn, FiLogOut } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

interface Strike {
  id: string;
  reason: string;
  severity: 'warning' | 'strike' | 'final_warning' | 'ban';
  created_at: string;
  acknowledged: boolean;
  strike_count: number;
  warning_message: string;
  ban_duration?: string;
}

export function StrikeWarning() {
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStrikes = async () => {
      const { data, error } = await supabase
        .from('user_strikes')
        .select('*')
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setStrikes(data);
        if (data.length > 0) {
          setShowWarning(true);
        }
      }
    };

    fetchStrikes();

    // Subscribe to new strikes
    const subscription = supabase
      .channel('strikes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_strikes',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchStrikes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const acknowledgeStrike = async (strikeId: string) => {
    try {
      const { error } = await supabase
        .from('user_strikes')
        .update({ acknowledged: true })
        .eq('id', strikeId);

      if (!error) {
        setStrikes(prev => prev.filter(strike => strike.id !== strikeId));
        if (strikes.length <= 1) {
          setShowWarning(false);
        }
      }
    } catch (error) {
      console.error('Error acknowledging strike:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <AnimatePresence>
      {showWarning && strikes.map((strike) => (
        <motion.div
          key={strike.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Semi-transparent backdrop */}
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" />

          <div className="relative z-10 max-w-2xl w-full">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden">
              <div className="p-8 bg-gradient-to-b from-red-500/10 to-transparent">
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500 blur-2xl opacity-20 animate-pulse"></div>
                    <div className="p-5 rounded-full bg-red-500/20 relative">
                      <FiAlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">
                      Account Banned
                    </h3>
                    {strike.ban_duration && (
                      <p className="text-xl text-red-400">
                        Duration: {strike.ban_duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Reason for Ban</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-white text-lg">{strike.reason}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Important Notice</h4>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300">
                      Your account has been banned for violating our community guidelines. 
                      This decision has been carefully reviewed by our moderation team. 
                      {strike.warning_message && (
                        <span className="block mt-2">{strike.warning_message}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full px-6 py-4 rounded-lg flex items-center justify-center gap-2 text-base font-medium
                    bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                    text-white transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle animated particles in the modal */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-500/20 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${10 + Math.random() * 20}s linear infinite`,
                  animationDelay: `-${Math.random() * 20}s`,
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
} 