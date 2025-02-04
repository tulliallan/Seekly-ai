'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiStar, FiCreditCard, FiClock, FiZap } from 'react-icons/fi';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => Promise<void>;
}

export function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: PremiumUpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });
      
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      // Add error handling UI here
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-gray-900 rounded-xl border border-white/10 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FiStar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
                  <p className="text-white/80">Unlock unlimited possibilities</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-blue-500/20 rounded-lg">
                    <FiCreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">500 Credits Monthly</h3>
                    <p className="text-sm text-gray-400">
                      Get 500 credits every month to use for chat prompts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-purple-500/20 rounded-lg">
                    <FiClock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">No Daily Limits</h3>
                    <p className="text-sm text-gray-400">
                      Use your credits anytime without daily restrictions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 bg-yellow-500/20 rounded-lg">
                    <FiZap className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Priority Support</h3>
                    <p className="text-sm text-gray-400">
                      Get faster responses and premium support
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-white">
                  £5
                  <span className="text-sm font-normal text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Cancel anytime • No commitment
                </p>
              </div>

              {/* Upgrade Button */}
              <button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiStar className="w-5 h-5" />
                    Upgrade Now
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 