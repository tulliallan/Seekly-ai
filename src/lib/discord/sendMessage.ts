import { DISCORD_BOT_TOKEN } from '@/lib/discord';
import { supabase } from '@/lib/supabase';

export async function sendDiscordMessage(userId: string, message: string) {
  try {
    // Get user's Discord integration info
    const { data: integration, error } = await supabase
      .from('user_integrations')
      .select('discord_dm_channel')
      .eq('user_id', userId)
      .single();

    if (error || !integration?.discord_dm_channel) {
      console.error('No Discord integration found for user');
      return;
    }

    // Send message through Discord bot
    const response = await fetch(
      `https://discord.com/api/channels/${integration.discord_dm_channel}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send Discord message');
    }
  } catch (error) {
    console.error('Error sending Discord message:', error);
  }
} 