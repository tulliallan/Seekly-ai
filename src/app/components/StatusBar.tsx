'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCheckCircle } from 'react-icons/fi';

export function StatusBar() {
  const [systemStatus, setSystemStatus] = useState<string>('operational');
  const [loading, setLoading] = useState(true);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setSystemStatus(data.overallStatus);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || systemStatus === 'operational') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-b-lg">
        <FiCheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-sm text-green-400">All systems operational</span>
      </div>
    </motion.div>
  );
} 