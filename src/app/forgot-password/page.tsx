'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { LoadingAnimation } from '../components/LoadingAnimation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to send password reset email' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Password reset instructions have been sent to your email' 
        });
        // Clear the email input on success
        setEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <AnimatedBackground />
      
      {/* Enhanced background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        
        {/* Additional animated background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">
                  Forgot Password
                </h2>
                <p className="mt-2 text-gray-400">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 block w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                {message && (
                  <div 
                    className={`p-4 rounded-lg ${
                      message.type === 'success' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                    role="alert"
                  >
                    {message.text}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full flex justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <LoadingAnimation message="Sending..." /> : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    disabled={loading}
                    className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 