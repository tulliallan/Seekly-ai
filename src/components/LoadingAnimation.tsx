'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { FiLoader, FiLogOut } from 'react-icons/fi';

interface LoadingAnimationProps {
  message: string;
}

export function LoadingAnimation({ message }: LoadingAnimationProps) {
  const [showLogout, setShowLogout] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogout(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">{message}</h2>
          <p className="text-blue-400/80 text-sm animate-pulse">Please wait...</p>
        </div>

        {/* Logout Option */}
        {showLogout && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-yellow-400/90 text-sm">
                Having trouble loading? You might be experiencing connection issues.
              </p>
            </div>
            
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Log Out and Try Again</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 