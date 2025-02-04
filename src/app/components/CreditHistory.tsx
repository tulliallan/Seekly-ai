'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  created_at: string;
}

interface CreditHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditHistory({ isOpen, onClose }: CreditHistoryProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching credit history:', error);
        return;
      }

      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [isOpen]);

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
            className="w-full max-w-lg bg-gray-900 rounded-xl border border-white/10 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <FiCreditCard className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Credit History
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'credit' 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <FiArrowUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <FiArrowDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        transaction.type === 'credit'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 