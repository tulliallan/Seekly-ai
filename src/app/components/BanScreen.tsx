'use client';

import { motion } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '@/lib/contexts/AuthContext';

interface BanScreenProps {
  banInfo: {
    reason: string;
    bannedUntil: Date | null;
    isPermanent: boolean;
  };
}

export function BanScreen({ banInfo }: BanScreenProps) {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-red-500/20"
      >
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full">
          <FiAlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Account Suspended
        </h1>
        
        <p className="text-gray-300 text-center mb-6">
          {banInfo.reason || "Your account has been banned for violating our terms of service."}
        </p>
        
        {!banInfo.isPermanent && banInfo.bannedUntil && (
          <p className="text-gray-400">
            Ban expires: {new Date(banInfo.bannedUntil).toLocaleDateString()}
          </p>
        )}
        
        {banInfo.isPermanent && (
          <p className="text-red-400">
            This is a permanent ban.
          </p>
        )}

        <div className="text-center">
          <button
            onClick={signOut}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
          
          <p className="mt-4 text-sm text-gray-400">
            If you believe this is a mistake, please contact support at{' '}
            <a href="mailto:support@example.com" className="text-blue-400 hover:text-blue-300">
              support@example.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
} 