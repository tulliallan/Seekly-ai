"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { initializeUserCredits } from "../credits";

// Add new types for provider status
interface ProviderStatus {
  github: 'operational' | 'degraded' | 'outage';
  google: 'operational' | 'degraded' | 'outage';
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
  providerStatus: ProviderStatus;
  isLocked: boolean;
  lockInfo: LockInfo | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ 
    data: { user: User | null } | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<void>;
};

// Create and export the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    github: 'operational',
    google: 'operational'
  });
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const supabase = createClientComponentClient();

  // Add function to check provider status
  const checkProviderStatus = async () => {
    try {
      const response = await fetch('/api/auth/provider-status');
      const data = await response.json();
      setProviderStatus(data);
    } catch (error) {
      console.error('Failed to check provider status:', error);
    }
  };

  useEffect(() => {
    // Check provider status periodically
    checkProviderStatus();
    const interval = setInterval(checkProviderStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          console.log('Initial session check:', session?.user?.email);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          // Initialize credits for new users
          await initializeUserCredits(session.user.id);
          await Promise.all([
            checkBanStatus(session.user.id),
            checkLockStatus(session.user.id)
          ]);
        } else {
          setUser(null);
          setIsBanned(false);
          setBanInfo(null);
          setIsLocked(false);
          setLockInfo(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      // Check ban status immediately after successful login
      if (data.user) {
        await checkBanStatus(data.user.id);
      }

      console.log('Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;

      if (data.user) {
        // Initialize credits for new user
        await initializeUserCredits(data.user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsBanned(false);
    setBanInfo(null);
    setIsLocked(false);
    setLockInfo(null);
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isBanned, 
      banInfo, 
      providerStatus,
      isLocked,
      lockInfo,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
