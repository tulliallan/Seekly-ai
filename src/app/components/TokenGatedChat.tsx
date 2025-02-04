'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/lib/hooks/useAuth';

interface TokenBalance {
  tokens: number;
  user_id: string;
}

export default function TokenGatedChat() {
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getTokenBalance() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('token_balances')
        .select('tokens')
        .eq('user_id', user.uid)
        .single();

      if (error) {
        console.error('Error fetching tokens:', error);
        return;
      }

      setTokens(data?.tokens || 0);
      setLoading(false);
    }

    getTokenBalance();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (tokens === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 rounded-lg">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">No Tokens Available</h2>
          <p className="text-gray-600">
            You need tokens to use the chat feature. Please purchase tokens to continue.
          </p>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => {/* Add your token purchase logic here */}}
          >
            Purchase Tokens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
        <div className="text-sm font-medium text-gray-600">
          Available Tokens: <span className="text-blue-600">{tokens}</span>
        </div>
      </div>
      {/* Your existing chat component here */}
    </div>
  );
} 