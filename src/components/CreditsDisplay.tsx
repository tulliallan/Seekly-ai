'use client';

import { motion } from 'framer-motion';
import { useCredits } from '@/lib/hooks/useCredits';

export default function CreditsDisplay() {
  const { credits, loading } = useCredits();

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/10"
    >
      <div className="flex items-center space-x-2">
        <span className="text-blue-500">💎</span>
        <span className="text-white font-medium">{credits ?? 0} Credits</span>
      </div>
    </motion.div>
  );
} 