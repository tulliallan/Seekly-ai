import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Configure the runtime to use edge for better streaming support
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Check authentication
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { messages } = await req.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY is not set in environment variables');
    }

    // Get the latest message content which contains our analysis prompt
    const latestMessage = messages[messages.length - 1].content;

    // Create a streaming encoder
    const encoder = new TextEncoder();
    const customStream = new TransformStream();
    const writer = customStream.writable.getWriter();

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful research assistant. Analyze the provided information and create detailed reports following the exact format specified in the user\'s prompt.'
          },
          {
            role: 'user',
            content: latestMessage
          }
        ],
        stream: true,
        temperature: 0.3, // Lower temperature for more focused analysis
        max_tokens: 4000, // Increased for detailed analysis
        top_p: 0.1,      // More focused sampling
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    // Process the stream
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await writer.close();
            break;
          }

          // Parse the chunks and format them like the original response
          const text = new TextDecoder().decode(value);
          const lines = text.split('\n').filter(line => line.trim() && line.startsWith('data: '));

          for (const line of lines) {
            try {
              const jsonData = JSON.parse(line.replace('data: ', ''));
              if (jsonData.choices?.[0]?.delta?.content) {
                const chunk = {
                  choices: [{
                    delta: {
                      content: jsonData.choices[0].delta.content
                    }
                  }]
                };
                await writer.write(encoder.encode(JSON.stringify(chunk) + '\n'));
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      } catch (error) {
        console.error('Stream processing error:', error);
        await writer.abort(error);
      }
    })();

    return new Response(customStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
} 