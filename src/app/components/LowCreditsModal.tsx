'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiClock, FiStar } from 'react-icons/fi';

interface LowCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  nextFreeCredit: string;
}

export function LowCreditsModal({ isOpen, onClose, onUpgrade, nextFreeCredit }: LowCreditsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-gray-900 rounded-xl border border-white/10 shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <FiCreditCard className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Out of Credits
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                <FiClock className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-white">Next Free Credit</p>
                  <p className="text-xs text-gray-400">{nextFreeCredit}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={onUpgrade}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg transition-colors"
                >
                  <FiStar className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
                >
                  Wait for Free Credit
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 