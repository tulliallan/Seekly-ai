'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { BanScreen } from './BanScreen';
import { LoadingAnimation } from './LoadingAnimation';

export function BanCheck({ children }: { children: React.ReactNode }) {
  const { loading, isBanned, banInfo } = useAuth();

  if (loading) {
    return <LoadingAnimation message="Loading..." />;
  }

  if (isBanned && banInfo) {
    return <BanScreen banInfo={banInfo} />;
  }

  return <>{children}</>;
} 