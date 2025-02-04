export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!;
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!;
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN!;
export const DISCORD_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`;

export const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=2048&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20bot%20messages.read%20dm_channels`; 