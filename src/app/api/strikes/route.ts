import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { userId, reason, severity, warning_message } = await request.json();

    const { data: adminCheck } = await supabase.auth.getUser();
    // Check if user is admin - implement proper admin check
    if (!adminCheck?.user?.email?.endsWith('@yourdomain.com')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current strike count
    const { data: existingStrikes } = await supabase
      .from('user_strikes')
      .select('strike_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const currentStrikeCount = (existingStrikes?.[0]?.strike_count || 0) + 1;

    const { data, error } = await supabase
      .from('user_strikes')
      .insert({
        user_id: userId,
        reason,
        severity,
        warning_message,
        strike_count: currentStrikeCount
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
        message: `You have received a new ${severity}. Please check your warnings.`,
        type: 'error'
      });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating strike:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 