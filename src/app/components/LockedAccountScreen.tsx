'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface LockInfo {
  reason: string;
  lockedUntil: Date | null;
  canRequest: boolean;
  lastRequestDate?: Date;
}

export function LockedAccountScreen({ lockInfo }: { lockInfo: LockInfo }) {
  const { user, signOut } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReactivationRequest = async () => {
    if (!user) return;
    
    setIsRequesting(true);
    setError(null);

    try {
      // Create reactivation request
      const { error: requestError } = await supabase
        .from('reactivation_requests')
        .insert({
          user_id: user.id,
          status: 'pending',
          reason: 'User requested account reactivation'
        });

      if (requestError) throw requestError;

      // Create notification for admins
      await supabase
        .from('admin_notifications')
        .insert({
          type: 'reactivation_request',
          user_id: user.id,
          message: `User ${user.email} has requested account reactivation`
        });

      setRequestSent(true);
    } catch (err) {
      console.error('Error requesting reactivation:', err);
      setError('Failed to submit reactivation request. Please try again later.');
    } finally {
      setIsRequesting(false);
    }
  };

  const canRequestReactivation = lockInfo.canRequest && 
    (!lockInfo.lastRequestDate || 
     new Date().getTime() - new Date(lockInfo.lastRequestDate).getTime() > 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Lock Icon */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center"
          >
            <FiLock className="w-12 h-12 text-red-500" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-red-500/20 overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-red-500/10 border-b border-red-500/20">
            <h1 className="text-2xl font-bold text-white text-center">
              Account Locked
            </h1>
            <p className="mt-2 text-gray-300 text-center">
              Your account has been temporarily locked for security reasons
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Lock Reason */}
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-medium text-white mb-2">
                Reason for Lock
              </h2>
              <p className="text-gray-300">
                {lockInfo.reason}
              </p>
            </div>

            {/* Lock Duration */}
            {lockInfo.lockedUntil && (
              <div className="bg-white/5 rounded-lg p-4">
                <h2 className="text-lg font-medium text-white mb-2">
                  Lock Duration
                </h2>
                <p className="text-gray-300">
                  Your account will be locked until{' '}
                  {new Date(lockInfo.lockedUntil).toLocaleDateString()} at{' '}
                  {new Date(lockInfo.lockedUntil).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Reactivation Request */}
            {canRequestReactivation && !requestSent && (
              <div className="space-y-4">
                <button
                  onClick={handleReactivationRequest}
                  disabled={isRequesting}
                  className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRequesting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiMail className="w-5 h-5" />
                      Request Reactivation
                    </>
                  )}
                </button>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <FiAlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Request Sent Confirmation */}
            {requestSent && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <FiCheck className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-green-400 font-medium">
                      Reactivation Request Sent
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      We&apos;ve received your request. Our team will review it and respond within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Support */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Need immediate assistance? Contact our support team at{' '}
                <a 
                  href="mailto:support@example.com"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  support@example.com
                </a>
              </p>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 