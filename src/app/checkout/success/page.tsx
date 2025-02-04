'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  useEffect(() => {
    if (!paymentIntent) {
      setLoading(false);
      return;
    }

    // Verify the payment was successful
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntent }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.success) {
          // Payment was successful
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      })
      .catch((err) => {
        console.error('Error verifying payment:', err);
        setLoading(false);
      });
  }, [paymentIntent, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-xl border border-green-500/20 p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="w-8 h-8 text-green-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-400 mb-6">
          Your premium subscription is now active. Enjoy your 500 monthly credits!
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400"
        >
          Redirecting you back to the app...
        </motion.div>
      </motion.div>
    </div>
  );
} 