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
  created_at: string;
  updated_at: string;
}

interface Props {
  children: React.ReactNode;
}

export function BanCheck({ children }: Props) {
  const [banStatus, setBanStatus] = useState<BanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkBanStatus() {
      console.log('BanCheck: Starting check with user:', user);
      
      if (!user?.id) {
        console.log('BanCheck: No user ID found');
        setLoading(false);
        return;
      }

      try {
        console.log('BanCheck: Querying ban status for user ID:', user.id);
        
        const { data, error } = await supabase
          .from('user_bans') // ✅ Corrected table name
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('BanCheck: Query result:', { data, error });

        if (error) {
          console.error('BanCheck: Error fetching ban status:', error);
          setLoading(false);
          return;
        }

        setBanStatus(data);
        
        if (data?.is_banned) {
          console.log('BanCheck: User is banned:', data);
        } else {
          console.log('BanCheck: User is not banned');
        }
      } catch (err) {
        console.error('BanCheck: Error in ban check:', err);
      } finally {
        setLoading(false);
      }
    }

    checkBanStatus();
  }, [user?.id, supabase]);

  if (loading) {
    return <LoadingAnimation message="Loading..." />;
  }

  if (banStatus?.is_banned) {
    const bannedUntil = banStatus.banned_until ? new Date(banStatus.banned_until) : null;
    const now = new Date();

    console.log('BanCheck: Evaluating ban status:', {
      userId: user?.id,
      isBanned: banStatus.is_banned,
      banStatus,
      bannedUntil,
      now,
      isStillBanned: !bannedUntil || bannedUntil > now
    });

    if (!bannedUntil || bannedUntil > now) {
      console.log('BanCheck: Rendering ban screen');
      return (
        <BanScreen 
          banReason={banStatus.ban_reason || undefined} 
          bannedUntil={banStatus.banned_until || undefined}
        />
      );
    }
  }

  console.log('BanCheck: Rendering children');
  return <>{children}</>;
}
