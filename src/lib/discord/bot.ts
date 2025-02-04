import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { DISCORD_BOT_TOKEN } from '@/lib/discord';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let isInitialized = false;

client.once('ready', () => {
  console.log(`Bot logged in as ${client.user?.tag}`);
  
  // Set the bot's presence
  client.user?.setPresence({
    activities: [{
      name: 'Generating responses on Seekly AI',
      type: ActivityType.Playing
    }],
    status: 'online'
  });
});

// Handle errors
client.on('error', (error) => {
  console.error('Discord bot error:', error);
});

// Start the bot
export async function startBot() {
  if (isInitialized) {
    return;
  }

  try {
    await client.login(DISCORD_BOT_TOKEN);
    isInitialized = true;
    console.log('Discord bot started successfully');
  } catch (error) {
    console.error('Failed to start Discord bot:', error);
    isInitialized = false;
  }
}

export default client; 