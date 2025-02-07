'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ServiceIssuePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkClaimStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_credits')
        .select('last_free_credit_date')
        .eq('user_id', user.id)
        .single();

      // Show popup if they haven't claimed in the last hour
      setShowPopup(!data?.last_free_credit_date || 
        new Date(data.last_free_credit_date).getTime() < Date.now() - 3600000);
    };

    checkClaimStatus();
  }, [supabase]);

  const handleClaim = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_credits')
        .update({ 
          credits_remaining: supabase.sql`credits_remaining + 150`,
          last_free_credit_date: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setHasClaimed(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error('Error claiming credits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gray-800/90 backdrop-blur-xl p-6 rounded-xl border border-white/10 shadow-2xl max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-semibold text-white">Service Notice</h3>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <p className="text-gray-300 mb-4">
              We're currently experiencing issues with our service. We've disabled our API temporarily.
              {!hasClaimed && " All credits taken in the last hour can be claimed back."}
            </p>

            {!hasClaimed ? (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Claiming...</span>
                  </>
                ) : (
                  <span>Claim Credits Back</span>
                )}
              </button>
            ) : (
              <div className="text-green-400 text-center">
                Credits successfully claimed! ✨
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 