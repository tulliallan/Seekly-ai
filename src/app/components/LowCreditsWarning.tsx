'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';

export function LowCreditsWarning() {
  const [show, setShow] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkCredits = async () => {
      const { data } = await supabase
        .from('user_credits')
        .select('credits_remaining, is_premium')
        .eq('user_id', user.id)
        .single();

      if (data && !data.is_premium && data.credits_remaining <= 3) {
        setCreditsRemaining(data.credits_remaining);
        setShow(true);
      }
    };

    checkCredits();

    // Subscribe to credit changes
    const subscription = supabase
      .channel('credits')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${user.id}`,
        },
        checkCredits
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (!show || creditsRemaining === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50 w-80 bg-yellow-500/10 backdrop-blur-xl rounded-lg border border-yellow-500/20 p-4"
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <FiAlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">
              Low Credits Warning
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              You have {creditsRemaining} credit{creditsRemaining === 1 ? '' : 's'} remaining.
              Upgrade to premium for unlimited access!
            </p>
            <button
              onClick={() => {
                // Show premium modal
                window.dispatchEvent(new CustomEvent('showPremiumModal'));
              }}
              className="mt-3 px-4 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 