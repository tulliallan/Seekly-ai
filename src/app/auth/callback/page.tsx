'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingAnimation } from '@/app/components/LoadingAnimation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Notify the parent window of successful authentication
    if (user && window.opener) {
      window.opener.dispatchEvent(new Event('supabase.auth.callback'));
      return;
    }

    // If not in popup, redirect to chat
    if (user) {
      router.push('/chat');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingAnimation />
        <p className="text-white mt-4">Completing login...</p>
      </div>
    </div>
  );
} 