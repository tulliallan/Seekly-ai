'use client';

import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import Image from 'next/image';

const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png";

export function ErrorScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="relative w-20 h-20 mx-auto">
          <Image
            src={logoUrl}
            alt="Seekly Logo"
            fill
            className="rounded-full"
          />
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">
            We'll Be Right Back
          </h1>
          
          <p className="text-gray-400 text-lg">
            We're currently experiencing some technical difficulties. Our team is working hard to get everything back to normal.
          </p>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
              <FiAlertTriangle className="w-5 h-5" />
              <span className="font-medium">System Status</span>
            </div>
            <p className="text-yellow-400/80 text-sm">
              Maintenance in Progress
            </p>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors mx-auto"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh Page
        </button>
      </motion.div>
    </div>
  );
} 