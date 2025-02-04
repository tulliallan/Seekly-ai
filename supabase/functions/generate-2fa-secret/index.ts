import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { generateSecret } from 'https://esm.sh/speakeasy@2.0.0'

serve(async (req) => {
  try {
    const { userId } = await req.json()
    
    // Generate new TOTP secret
    const secret = generateSecret({
      name: 'Seekly',
      issuer: 'Seekly'
    })

    // Store the secret temporarily (you might want to encrypt this)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('temp_2fa_secrets')
      .upsert({ 
        user_id: userId,
        secret: secret.base32,
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ secret: secret.base32 }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
}) 