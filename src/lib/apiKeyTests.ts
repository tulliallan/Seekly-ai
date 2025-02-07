import OpenAI from 'openai';

export async function testApiKey(service: string, apiKey: string) {
  try {
    switch (service) {
      case 'openai':
        const openai = new OpenAI({ apiKey });
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Test message' }],
          max_tokens: 5
        });
        return openaiResponse.choices.length > 0;

      case 'anthropic':
        // Simple fetch request instead of using the SDK
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'Test message' }]
          })
        });
        
        return response.ok;

      default:
        throw new Error('Unsupported service');
    }
  } catch (error) {
    console.error(`Error testing ${service} API key:`, error);
    return false;
  }
} 