import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let subscription: any;

    async function setupSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // First try to get existing record
        const { data: existingData, error: fetchError } = await supabase
          .from('user_credits')
          .select('credits_remaining')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError || !existingData) {
          // If no record exists, create one
          const { data: newData, error: insertError } = await supabase
            .from('user_credits')
            .insert([
              { 
                user_id: user.id, 
                credits_remaining: 100, // Give new users 100 credits
                is_premium: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select('credits_remaining')
            .single();

          if (!insertError && newData) {
            setCredits(newData.credits_remaining);
          }
        } else {
          setCredits(existingData.credits_remaining ?? 0);
        }

        // Set up real-time subscription
        subscription = supabase
          .channel('credits_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'user_credits',
              filter: `user_id=eq.${user.id}`,
            },
            (payload: any) => {
              if (payload.new) {
                setCredits(payload.new.credits_remaining ?? 0);
              }
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Error in credits setup:', error);
        setCredits(0); // Fallback to 0 credits on error
      } finally {
        setLoading(false);
      }
    }

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [supabase]);

  return { credits, loading };
} 