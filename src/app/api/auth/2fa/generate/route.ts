import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { kv } from '@vercel/kv';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    // Generate new TOTP secret
    const secret = speakeasy.generateSecret({
      name: 'Seekly',
      issuer: 'Seekly'
    });

    // Store the secret temporarily in KV store (expires in 10 minutes)
    await kv.set(`2fa_temp:${userId}`, secret.base32, { ex: 600 });

    return NextResponse.json({ secret: secret.base32 });
  } catch (error) {
    console.error('2FA Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate 2FA secret' },
      { status: 500 }
    );
  }
} 