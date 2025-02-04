import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { totp } from 'https://esm.sh/speakeasy@2.0.0'

serve(async (req) => {
  try {
    const { userId, secret, token } = await req.json()
    
    // Verify the token
    const verified = totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1
    })

    if (!verified) {
      throw new Error('Invalid verification code')
    }

    // Store the verified secret
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('user_2fa')
      .upsert({ 
        user_id: userId,
        secret,
        enabled: true,
        updated_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ verified: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 