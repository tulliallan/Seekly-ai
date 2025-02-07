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
    // Simulate service being busy/unavailable
    const isOperational = false; // Set to false to simulate busy service

    return NextResponse.json({
      status: 'unavailable',
      message: 'Service is busy at the moment',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unavailable',
      error: 'Service check failed',
      timestamp: new Date().toISOString(),
    }, { status: 503 }); // Using 503 Service Unavailable status code
  }
} 