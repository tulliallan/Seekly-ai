'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const logoUrl = "https://seekly.ai/logo.png";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
      <div className="relative">
        {/* Animated rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-500/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.75, opacity: 0.5 }}
          transition={{ duration: 2, delay: 0.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0.5 }}
          transition={{ duration: 2, delay: 0.4, repeat: Infinity }}
        />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-50" />
          <Image 
            src={logoUrl}
            alt="Seekly Logo" 
            className="relative h-20 w-20 rounded-full ring-4 ring-white/20 shadow-2xl"
            width={80}
            height={80}
          />
        </motion.div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/80 text-sm"
        >
          Loading your experience...
        </motion.p>
      </div>
    </div>
  );
} 