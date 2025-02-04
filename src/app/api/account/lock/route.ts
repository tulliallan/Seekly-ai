import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId, reason, lockedUntil, canRequestReactivation } = await request.json();

    const { data: adminCheck } = await supabase.auth.getUser();
    // Check if user is admin - implement proper admin check
    if (!adminCheck?.user?.email?.endsWith('@yourdomain.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('account_locks')
      .insert({
        user_id: userId,
        reason,
        locked_until: lockedUntil,
        can_request_reactivation: canRequestReactivation
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create notification for the user
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: `Your account has been locked. Reason: ${reason}`,
        type: 'error'
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error locking account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 