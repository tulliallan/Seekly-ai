import { supabase } from './supabase';

export const createAdmin = async (email: string, password: string) => {
  try {
    // First create the user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Then add them to the admins table
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        user_id: authData.user?.id,
        email
      });

    if (adminError) throw adminError;

    return { success: true };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error };
  }
}; 