'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function SettingsModal({ isOpen, onClose, userId }: SettingsModalProps) {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string>('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const generate2FASecret = async () => {
    try {
      setError(''); // Clear any previous errors
      console.log('Generating 2FA secret for user:', userId);

      const response = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      console.log('2FA generation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate 2FA secret');
      }

      if (!data.secret) {
        throw new Error('No secret received from server');
      }

      setSecret(data.secret);
      setStep('setup');
    } catch (err) {
      console.error('2FA Generation Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate 2FA secret');
    }
  };

  const verify2FACode = async () => {
    try {
      setError(''); // Clear any previous errors
      if (!verificationCode.trim()) {
        setError('Please enter a verification code');
        return;
      }

      console.log('Verifying 2FA code for user:', userId);

      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          token: verificationCode.trim(),
          secret // Include the secret for verification
        })
      });

      const data = await response.json();
      console.log('2FA verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      if (data.verified) {
        setIs2FAEnabled(true);
        setStep('initial');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      console.error('2FA Verification Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    }
  };

  // Add useEffect to check initial 2FA status
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await fetch('/api/auth/2fa/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });

        const data = await response.json();
        if (response.ok && data.enabled) {
          setIs2FAEnabled(true);
        }
      } catch (err) {
        console.error('Failed to check 2FA status:', err);
      }
    };

    if (isOpen) {
      check2FAStatus();
    }
  }, [isOpen, userId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-xl border border-white/10 shadow-xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Security Settings</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'initial' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <FiShield className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-400">
                          {is2FAEnabled 
                            ? 'Your account is protected with 2FA'
                            : 'Add an extra layer of security'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={generate2FASecret}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                    >
                      {is2FAEnabled ? 'Reconfigure' : 'Enable'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'setup' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Scan QR Code
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      Scan this QR code with your authenticator app
                    </p>
                    <div className="bg-white p-4 rounded-lg inline-block mb-6">
                      <QRCodeSVG 
                        value={`otpauth://totp/Seekly:${userId}?secret=${secret}&issuer=Seekly`}
                        size={200}
                      />
                    </div>
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter verification code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                      {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                      )}
                      <button
                        onClick={verify2FACode}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 