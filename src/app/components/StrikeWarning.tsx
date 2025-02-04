'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';

interface Strike {
  id: string;
  reason: string;
  severity: 'warning' | 'strike' | 'final_warning';
  created_at: string;
  acknowledged: boolean;
  strike_count: number;
  warning_message: string;
}

export function StrikeWarning() {
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const { user } = useAuth();

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

  return (
    <AnimatePresence>
      {showWarning && strikes.map((strike) => (
        <motion.div
          key={strike.id}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 inset-x-0 z-50 flex justify-center px-4"
        >
          <div className={`w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl rounded-xl border shadow-xl overflow-hidden ${
            strike.severity === 'warning' ? 'border-yellow-500/50' :
            strike.severity === 'strike' ? 'border-red-500/50' :
            'border-red-700/50'
          }`}>
            <div className={`p-4 ${
              strike.severity === 'warning' ? 'bg-yellow-500/10' :
              strike.severity === 'strike' ? 'bg-red-500/10' :
              'bg-red-700/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    strike.severity === 'warning' ? 'bg-yellow-500/20' :
                    strike.severity === 'strike' ? 'bg-red-500/20' :
                    'bg-red-700/20'
                  }`}>
                    <FiAlertTriangle className={`w-6 h-6 ${
                      strike.severity === 'warning' ? 'text-yellow-500' :
                      strike.severity === 'strike' ? 'text-red-500' :
                      'text-red-700'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {strike.severity === 'warning' ? 'Account Warning' :
                       strike.severity === 'strike' ? 'Account Strike' :
                       'Final Warning'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Strike Count: {strike.strike_count}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => acknowledgeStrike(strike.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Reason</h4>
                <p className="text-white">{strike.reason}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Warning Message</h4>
                <p className="text-gray-300">{strike.warning_message}</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => acknowledgeStrike(strike.id)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                    strike.severity === 'warning' 
                      ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                      : strike.severity === 'strike'
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-red-700/20 hover:bg-red-700/30 text-red-300'
                  }`}
                >
                  <FiCheck className="w-4 h-4" />
                  I Understand and Acknowledge
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
} 