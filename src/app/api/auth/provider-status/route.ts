import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/supabase';

export async function GET() {
  try {
    // Check GitHub provider
    const githubStatus = await checkGitHubStatus();
    
    // Check Google provider
    const googleStatus = await checkGoogleStatus();

    return NextResponse.json({
      github: githubStatus,
      google: googleStatus
    });
  } catch (error) {
    console.error('Provider status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check provider status' },
      { status: 500 }
    );
  }
}

async function checkGitHubStatus() {
  try {
    const response = await fetch('https://www.githubstatus.com/api/v2/status.json');
    const data = await response.json();
    
    // Map GitHub's status to our status types
    switch (data.status.indicator) {
      case 'none':
        return 'operational';
      case 'minor':
        return 'degraded';
      default:
        return 'outage';
    }
  } catch {
    return 'degraded';
  }
}

async function checkGoogleStatus() {
  try {
    const response = await fetch('https://www.google.com/generate_204');
    return response.status === 204 ? 'operational' : 'degraded';
  } catch {
    return 'outage';
  }
} 