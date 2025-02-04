import { createClient } from '@supabase/supabase-js';
import speakeasy from 'speakeasy';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    // Generate new TOTP secret
    const secret = speakeasy.generateSecret({
      name: 'Seekly',
      issuer: 'Seekly'
    });

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Store the secret temporarily
    await supabase
      .from('temp_2fa_secrets')
      .upsert({ 
        user_id: userId,
        secret: secret.base32,
        created_at: new Date().toISOString()
      });

    return NextResponse.json({ secret: secret.base32 });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 400 }
    );
  }
} 