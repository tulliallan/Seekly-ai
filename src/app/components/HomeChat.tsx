'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useServiceStatus } from '@/lib/hooks/useServiceStatus';

export default function HomeChat() {
  const [prompt, setPrompt] = useState('');
  const { setShowServiceIssue } = useServiceStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show service issue popup instead of sending message
    setShowServiceIssue(true);
    setPrompt(''); // Clear input
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
} 