'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiCheck } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'An error occurred');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
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
            <FiLock className="w-5 h-5" />
            Pay £5/month
          </>
        )}
      </button>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <FiLock className="w-4 h-4" />
        <span>Payments are secure and encrypted</span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create a payment intent when the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        console.error('Error creating payment intent:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-400">
            Subscribe to Premium and get 500 credits monthly
          </p>
        </div>

        {/* Checkout Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
          {/* Plan Summary */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">
                  Premium Plan
                </h2>
                <p className="text-sm text-gray-400">Monthly subscription</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">£5</div>
                <p className="text-sm text-gray-400">per month</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FiCheck className="w-4 h-4 text-green-400" />
                <span>500 credits monthly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FiCheck className="w-4 h-4 text-green-400" />
                <span>No daily limits</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FiCheck className="w-4 h-4 text-green-400" />
                <span>Priority support</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#4F46E5',
                      colorBackground: '#1F2937',
                      colorText: '#F9FAFB',
                      colorDanger: '#EF4444',
                    },
                  },
                }}
              >
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="flex justify-center p-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 