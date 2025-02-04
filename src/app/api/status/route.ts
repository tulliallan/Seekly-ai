import { NextResponse } from 'next/server';

async function checkEndpoint(url: string, apiKey?: string, timeout = 5000): Promise<{
  status: 'operational' | 'degraded' | 'outage';
  latency: number;
}> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latency = Date.now() - start;
    
    if (!response.ok) {
      return { status: 'degraded', latency };
    }

    return {
      status: latency > 1000 ? 'degraded' : 'operational',
      latency
    };
  } catch (error) {
    return { status: 'outage', latency: Date.now() - start };
  }
}

export async function GET() {
  try {
    // Simulate service statuses
    const services = [
      {
        name: 'Search API (Tavily)',
        status: 'operational',
        latency: 120,
        uptime: 99.99,
        lastIncident: 'No recent incidents'
      },
      {
        name: 'AI Analysis (Gemini)',
        status: 'degraded', // Set to degraded
        latency: 850, // High latency
        uptime: 95.50,
        lastIncident: new Date().toISOString()
      },
      {
        name: 'Authentication (Supabase)',
        status: 'outage', // Set to outage
        latency: 2000, // Very high latency
        uptime: 92.00,
        lastIncident: new Date().toISOString()
      },
      {
        name: 'Database (Supabase)',
        status: 'degraded',
        latency: 450,
        uptime: 97.50,
        lastIncident: new Date().toISOString()
      }
    ];

    // Add known issues
    const knownIssues = [
      {
        title: 'Authentication System Outage',
        description: 'We are currently experiencing a complete outage of our authentication system. Our team is actively investigating the issue.',
        status: 'investigating',
        lastUpdate: new Date().toISOString()
      },
      {
        title: 'Login Session Persistence',
        description: 'Some users are experiencing issues with login sessions not being saved between browser sessions. Our team is working on a fix.',
        status: 'identified',
        lastUpdate: new Date().toISOString()
      },
      {
        title: 'Database Performance',
        description: 'Users may experience slower response times due to database performance issues.',
        status: 'monitoring',
        lastUpdate: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      services,
      knownIssues,
      overallStatus: 'outage',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check services' },
      { status: 500 }
    );
  }
} 