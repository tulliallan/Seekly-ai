import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId, reason, bannedUntil, isPermanent } = await request.json();

    const { data: adminCheck } = await supabase.auth.getUser();
    // Check if user is admin - you should implement proper admin check
    if (!adminCheck?.user?.email?.endsWith('@yourdomain.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_bans')
      .insert({
        user_id: userId,
        reason,
        banned_until: bannedUntil,
        is_permanent: isPermanent
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create notification for banned user
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: `Your account has been ${isPermanent ? 'permanently' : 'temporarily'} banned. Reason: ${reason}`,
        type: 'error'
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 