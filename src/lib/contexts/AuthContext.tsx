"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { initializeUserCredits } from "../credits";

// Add new types for provider status
interface ProviderStatus {
  github: 'operational' | 'degraded' | 'down';
  google: 'operational' | 'degraded' | 'down';
}

interface BanInfo {
  reason: string;
  bannedUntil: Date | null;
  isPermanent: boolean;
}

interface LockInfo {
  reason: string;
  lockedUntil: Date | null;
  canRequest: boolean;
  lastRequestDate?: Date;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isBanned: boolean;
  banInfo: BanInfo | null;
  isLocked: boolean;
  lockInfo: LockInfo | null;
  providerStatus: ProviderStatus;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<void>;
};

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    github: 'operational',
    google: 'operational'
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    try {
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await checkBanStatus(session.user.id);
            await checkLockStatus(session.user.id);
          }
          
          setLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error in auth state change:', error);
      setLoading(false);
    }
  }, []);

  // Add error boundaries to auth functions
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const checkBanStatus = async (userId: string) => {
    const { data: banData, error } = await supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (banData && !error) {
      const isBanActive = banData.is_permanent || 
        (banData.banned_until && new Date(banData.banned_until) > new Date());

      setIsBanned(isBanActive);
      if (isBanActive) {
        setBanInfo({
          reason: banData.reason,
          bannedUntil: banData.banned_until ? new Date(banData.banned_until) : null,
          isPermanent: banData.is_permanent
        });
      }
    }
  };

  const checkLockStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('account_locks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      const isCurrentlyLocked = data.locked_until ? new Date(data.locked_until) > new Date() : true;
      setIsLocked(isCurrentlyLocked);
      if (isCurrentlyLocked) {
        setLockInfo({
          reason: data.reason,
          lockedUntil: data.locked_until ? new Date(data.locked_until) : null,
          canRequest: data.can_request_reactivation,
          lastRequestDate: data.last_request_date ? new Date(data.last_request_date) : undefined
        });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isBanned,
        banInfo,
        isLocked,
        lockInfo,
        providerStatus,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
