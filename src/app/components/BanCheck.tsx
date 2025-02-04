'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/lib/hooks/useAuth';
import { BanScreen } from './BanScreen';
import { LoadingAnimation } from './LoadingAnimation';

interface BanStatus {
  id: string;
  user_id: string;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  banned_until: string | null;
  is_permanent: boolean;
  created_at: string;
  updated_at: string;
}

export function BanCheck({ children }: { children: React.ReactNode }) {
  const [banStatus, setBanStatus] = useState<BanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkBanStatus() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_bans')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setBanStatus(data);
      } catch (err) {
        console.error('Error checking ban status:', err);
      } finally {
        setLoading(false);
      }
    }

    checkBanStatus();
  }, [user, supabase]);

  if (loading) {
    return <LoadingAnimation />;
  }

  if (banStatus?.is_banned) {
    const banInfo = {
      reason: banStatus.ban_reason || "Violation of terms of service",
      bannedUntil: banStatus.banned_until ? new Date(banStatus.banned_until) : null,
      isPermanent: banStatus.is_permanent
    };
    return <BanScreen banInfo={banInfo} />;
  }

  return <>{children}</>;
}
