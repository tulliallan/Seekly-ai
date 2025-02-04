import { NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, DISCORD_BOT_TOKEN } from '@/lib/discord';
import { startBot } from '@/lib/discord/bot';
import client from '@/lib/discord/bot';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    // Start bot if not already running
    await startBot();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const supabase = createClientComponentClient();

    if (!code) {
      console.error('No code provided in callback');
      return NextResponse.redirect('/integrations?error=no_code');
    }

    console.log('Exchanging code for token...');
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData);

    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', tokenData);
      throw new Error('Failed to get access token');
    }

    // Get user info
    console.log('Getting user info...');
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    console.log('User data:', userData);

    if (!userResponse.ok) {
      console.error('Failed to get user info:', userData);
      throw new Error('Failed to get user info');
    }

    // Create DM channel using discord.js client
    console.log('Creating DM channel...');
    try {
      const user = await client.users.fetch(userData.id);
      const dmChannel = await user.createDM();

      // Send welcome message with embed
      console.log('Sending welcome message...');
      await dmChannel.send({
        embeds: [{
          title: '🎉 Welcome to Seekly!',
          description: `Hey ${userData.username}, thanks for connecting your Discord account!\n\nYou'll receive notifications here about important events in your Seekly account.`,
          color: 0x5865F2,
          fields: [
            {
              name: 'Account Details',
              value: `**Username:** ${userData.username}\n**Connected:** ✅`,
              inline: true
            },
            {
              name: '🔔 Notifications',
              value: 'You will receive notifications about:\n• Account updates\n• Important alerts\n• System notifications',
              inline: false
            }
          ],
          footer: {
            text: 'Seekly Bot • Type !help for commands',
            icon_url: 'https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png'
          },
          timestamp: new Date().toISOString(),
          thumbnail: {
            url: userData.avatar 
              ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
              : 'https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png'
          }
        }],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: 'Go to Seekly Dashboard',
                url: APP_URL,
                emoji: '🚀'
              }
            ]
          }
        ]
      });

      // Store Discord info in Supabase
      const { data: userData2, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData2.user) {
        throw new Error('No authenticated user found');
      }

      const { error: updateError } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: userData2.user.id,
          discord_id: userData.id,
          discord_username: userData.username,
          discord_dm_channel: dmChannel.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        throw updateError;
      }

      return NextResponse.redirect('/integrations?success=true');
    } catch (error) {
      console.error('Discord bot error:', error);
      return NextResponse.redirect('/integrations?error=bot_error');
    }
  } catch (error) {
    console.error('Discord integration error:', error);
    return NextResponse.redirect('/integrations?error=integration_failed');
  }
} 