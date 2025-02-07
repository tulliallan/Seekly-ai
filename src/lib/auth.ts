export const initializeUserCredits = async (userId: string) => {
  try {
    // Check if user already has credits initialized
    const { data: existing } = await supabase
      .from('user_credits')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existing) {
      // Initialize with 10 default credits
      await supabase
        .from('user_credits')
        .insert([
          {
            user_id: userId,
            credits_remaining: 10, // Changed from 100 to 10
            monthly_usage: 0,
            total_credits_used: 0,
            is_premium: false,
            last_free_credit_date: new Date().toISOString().split('T')[0]
          }
        ]);

      // Add initial credit history entry
      await supabase
        .from('credit_history')
        .insert([
          {
            user_id: userId,
            amount: 10, // Changed from 100 to 10
            type: 'add',
            description: 'Welcome bonus - 10 free credits'
          }
        ]);
    }
  } catch (error) {
    console.error('Error initializing user credits:', error);
  }
}; 