'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface UserProfile {
  username: string;
  avatar_url: string;
}

export function TopBar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-white/10">
      <div className="flex items-center gap-6">
        {/* Logo section */}
      </div>

      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-3">
            <span className="text-white">{profile.username}</span>
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 