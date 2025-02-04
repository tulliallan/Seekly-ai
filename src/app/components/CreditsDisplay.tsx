'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiStar, FiClock } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/contexts/AuthContext';

interface UserCredits {
  credits_remaining: number;
  is_premium: boolean;
  premium_until: string | null;
  last_free_credit_date: string;
}

export function CreditsDisplay() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchCredits = async () => {
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching credits:', error);
          setError('Error loading credits');
          return;
        }

        setCredits(data);
      } catch (err) {
        console.error('Error:', err);
        setError('Error loading credits');
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();

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
        () => {
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 backdrop-blur-xl rounded-full">
        <span className="text-sm text-red-400">{error}</span>
      </div>
    );
  }

  if (loading || !credits) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading credits...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4"
    >
      {/* Credits Counter */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
        <FiCreditCard className="w-4 h-4 text-blue-400" />
        <span className="text-sm text-white font-medium">
          {credits.credits_remaining} Credits
        </span>
      </div>

      {/* Premium Status */}
      {credits.is_premium && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 backdrop-blur-xl rounded-full border border-yellow-500/20">
          <FiStar className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 font-medium">Premium</span>
          {credits.premium_until && (
            <span className="text-xs text-gray-400">
              ({new Date(credits.premium_until).toLocaleDateString()})
            </span>
          )}
        </div>
      )}

      {/* Next Free Credit */}
      {!credits.is_premium && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-full">
          <FiClock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">
            Next free credit:{' '}
            {new Date(credits.last_free_credit_date).getTime() < new Date().setHours(0, 0, 0, 0)
              ? 'Today'
              : 'Tomorrow'}
          </span>
        </div>
      )}
    </motion.div>
  );
} 