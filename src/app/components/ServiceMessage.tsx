'use client';

import { motion } from 'framer-motion';

export const ServiceMessage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 text-center max-w-lg mx-auto"
    >
      <div className="mb-4">
        <span className="text-4xl">👋</span>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">
        Goodbye For Now!
      </h2>
      
      <p className="text-gray-300 mb-4">
        We're taking a break to make Jieny even more amazing
      </p>
      
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="text-3xl font-bold text-blue-400">
          See You On Feb 6, 2025
        </div>
        <div className="text-sm text-gray-400 mt-1">
          We'll be back stronger! 💪
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        Thanks for being an awesome part of our journey! 🚀
      </div>
    </motion.div>
  );
}; 