import { supabase } from '@/lib/supabase';

export async function checkAndUpdateCredits(userId: string): Promise<boolean> {
  try {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking credits:', error);
      return false;
    }

    if (!credits) {
      await initializeUserCredits(userId);
      return true;
    }

    // Check if user has any credits remaining
    if (credits.credits_remaining <= 0) {
      // Check if user should get a free credit today
      const lastCreditDate = new Date(credits.last_free_credit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (lastCreditDate.getTime() < today.getTime()) {
        // Give free credit and update date
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            credits_remaining: 1,
            last_free_credit_date: today.toISOString().split('T')[0]
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating credits:', updateError);
          return false;
        }
        return true;
      }
      return false;
    }

    // Deduct one credit and log transaction
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: credits.credits_remaining - 1
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return false;
    }

    // Log the transaction
    await deductCredit(userId);

    return true;
  } catch (error) {
    console.error('Error in checkAndUpdateCredits:', error);
    return false;
  }
}

export async function initializeUserCredits(userId: string) {
  try {
    // First check if credits already exist
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingCredits) {
      return; // Credits already initialized
    }

    // Initialize credits in a transaction
    const { error: creditsError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: 10,
        monthly_usage: 0,
        total_credits_used: 0,
        is_premium: false,
        last_free_credit_date: new Date().toISOString().split('T')[0]
      });

    if (creditsError) throw creditsError;

    // Add initial credit history entry
    const { error: historyError } = await supabase
      .from('credit_history')
      .insert({
        user_id: userId,
        amount: 10,
        type: 'add',
        description: 'Welcome bonus - 10 free credits'
      });

    if (historyError) throw historyError;

  } catch (error) {
    console.error('Error initializing credits:', error);
    throw error;
  }
}

const deductCredit = async (userId: string) => {
  const { error: updateError } = await supabase.rpc('log_credit_transaction', {
    p_user_id: userId,
    p_amount: 1,
    p_type: 'debit',
    p_description: 'Chat message sent'
  });

  if (updateError) {
    console.error('Error logging transaction:', updateError);
  }
};

export async function addCreditsToUser(userId: string, amount: number, reason: string) {
  try {
    // Get current credits in a transaction
    const { data: currentCredits, error: fetchError } = await supabase
      .from('user_credits')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Update credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: (currentCredits?.credits_remaining || 0) + amount
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Add to credit history
    const { error: historyError } = await supabase
      .from('credit_history')
      .insert({
        user_id: userId,
        amount,
        type: 'add',
        description: reason
      });

    if (historyError) throw historyError;

    return true;
  } catch (error) {
    console.error('Error adding credits:', error);
    return false;
  }
}

export async function getCreditHistory(userId: string) {
  const { data, error } = await supabase
    .from('credit_history')
    .select(`
      *,
      admin:admin_id (
        profile:user_profiles (
          username
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching credit history:', error);
    throw error;
  }

  return data;
}

export async function getSystemStatus() {
  const { data, error } = await supabase
    .from('system_status')
    .select('*')
    .single();

  if (error) {
    console.error('Error fetching system status:', error);
    throw error;
  }

  return data;
}

// Add real-time subscription for credits
export function subscribeToCredits(userId: string, onUpdate: (credits: any) => void) {
  return supabase
    .channel('credits-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_credits',
        filter: `user_id=eq.${userId}`
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
}

// Add real-time subscription for system status
export function subscribeToSystemStatus(onUpdate: (status: any) => void) {
  return supabase
    .channel('system-status')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'system_status'
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
} 