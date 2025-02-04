'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSystemStatus, subscribeToSystemStatus } from '@/lib/credits';

interface SystemStatus {
  openai_status: boolean;
  anthropic_status: boolean;
  deepgram_status: boolean;
  replicate_status: boolean;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  last_checked: string;
}

export function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    // Initial fetch
    getSystemStatus().then(setStatus);

    // Subscribe to real-time updates
    const subscription = subscribeToSystemStatus((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* OpenAI Status */}
        <StatusCard
          title="OpenAI API"
          status={status.openai_status}
          icon="🤖"
        />

        {/* Anthropic Status */}
        <StatusCard
          title="Anthropic API"
          status={status.anthropic_status}
          icon="🧠"
        />

        {/* Deepgram Status */}
        <StatusCard
          title="Deepgram API"
          status={status.deepgram_status}
          icon="🎤"
        />

        {/* Replicate Status */}
        <StatusCard
          title="Replicate API"
          status={status.replicate_status}
          icon="🖼️"
        />
      </div>

      {status.maintenance_mode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-yellow-400">
            System Maintenance
          </h3>
          <p className="text-gray-400">
            {status.maintenance_message || 'System is currently under maintenance'}
          </p>
        </motion.div>
      )}

      <div className="text-sm text-gray-500">
        Last updated: {new Date(status.last_checked).toLocaleString()}
      </div>
    </div>
  );
}

function StatusCard({ title, status, icon }: { title: string; status: boolean; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-xl border ${
        status 
          ? 'border-green-500/20 bg-green-500/10' 
          : 'border-red-500/20 bg-red-500/10'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className={status ? 'text-green-400' : 'text-red-400'}>
            {status ? 'Operational' : 'Service Disruption'}
          </p>
        </div>
      </div>
    </motion.div>
  );
} 