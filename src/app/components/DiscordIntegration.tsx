'use client';

import { useState } from 'react';
import { FaDiscord } from 'react-icons/fa';
import { FiCheck, FiX, FiBell, FiLink } from 'react-icons/fi';
import { DISCORD_OAUTH_URL } from '@/lib/discord';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface DiscordIntegrationProps {
  isConnected?: boolean;
  discordUsername?: string;
}

export function DiscordIntegration({ isConnected, discordUsername }: DiscordIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    window.location.href = DISCORD_OAUTH_URL;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#5865F2]/10 backdrop-blur-xl rounded-xl border border-[#5865F2]/20 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#5865F2]/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#5865F2] rounded-xl">
            <FaDiscord className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Discord Integration</h3>
            <p className="text-[#B9BBBE]">Get notifications directly in Discord</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {isConnected ? (
          <>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center">
                <FaDiscord className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{discordUsername}</p>
                <p className="text-sm text-[#B9BBBE]">Connected</p>
              </div>
              <FiCheck className="w-5 h-5 text-green-400" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[#B9BBBE]">
                <FiBell className="w-4 h-4" />
                <span className="text-sm">Receive notifications via DM</span>
              </div>
              <div className="flex items-center gap-3 text-[#B9BBBE]">
                <FiLink className="w-4 h-4" />
                <span className="text-sm">Access quick commands</span>
              </div>
            </div>

            <button
              onClick={() => {/* Handle disconnect */}}
              className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FiX className="w-4 h-4" />
              Disconnect
            </button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src="/discord-preview.png"
                  alt="Discord Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-medium">Features</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[#B9BBBE]">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    Receive notifications directly in Discord
                  </li>
                  <li className="flex items-center gap-2 text-[#B9BBBE]">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    Quick access to your account status
                  </li>
                  <li className="flex items-center gap-2 text-[#B9BBBE]">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    Use Discord commands to interact
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <FaDiscord className="w-5 h-5" />
                  Connect Discord
                </>
              )}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
} 