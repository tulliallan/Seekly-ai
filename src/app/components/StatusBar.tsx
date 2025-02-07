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
    <div className="fixed top-0 left-0 right-0 bg-yellow-500/10 border-b border-yellow-500/20 backdrop-blur-sm z-40">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
        <p className="text-sm text-yellow-200 text-center">
          Some users are experiencing API issues, causing credits to show as 0. We are aware and are working on a fix.
        </p>
      </div>
    </div>
  );
} 