'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from './AnimatedBackground';

interface BanInfo {
  reason: string;
  banned_until: string | null;
  banned_at: string;
}

export function BanScreen({ banInfo }: { banInfo: BanInfo }) {
  const router = useRouter();

  useEffect(() => {
    // Prevent navigation away from ban screen
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      return (e.returnValue = 'You are banned from this service.');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-8 border border-red-500/20 max-w-md w-full"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Account Banned</h1>
              <p className="text-red-400">Access to Seekly has been restricted</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-red-500/10 rounded-lg p-4">
              <h2 className="text-white font-medium mb-2">Reason for Ban:</h2>
              <p className="text-gray-300">{banInfo.reason}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-white font-medium mb-2">Ban Details:</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Banned on: {new Date(banInfo.banned_at).toLocaleDateString()}</p>
                {banInfo.banned_until && (
                  <p>Ban expires: {new Date(banInfo.banned_until).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-400 mt-6">
              If you believe this is a mistake, please contact support for assistance.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 