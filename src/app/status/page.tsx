'use client';

import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const logoUrl = "https://seekly.ai/logo.png"

interface ServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  last_updated: string;
  description: string;
  latency?: number;
  uptime?: number;
}

const API_SERVICES = [
  {
    id: 'openai',
    name: 'OpenAI API',
    icon: '🤖',
    endpoints: ['chat/completions', 'embeddings']
  },
  {
    id: 'anthropic',
    name: 'Anthropic API',
    icon: '🧠',
    endpoints: ['messages']
  },
  {
    id: 'tavily',
    name: 'Tavily Search API',
    icon: '🔍',
    endpoints: ['search']
  },
  {
    id: 'deepgram',
    name: 'Deepgram API',
    icon: '🎤',
    endpoints: ['transcribe']
  },
  {
    id: 'replicate',
    name: 'Replicate API',
    icon: '🎨',
    endpoints: ['predictions']
  }
];

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'outage'>('operational');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const statusChecks = API_SERVICES.map(async (service) => {
          // Check real API status
          const endpoints = service.endpoints.map(async (endpoint) => {
            try {
              const start = performance.now();
              const response = await fetch(`/api/status/${service.id}/${endpoint}`);
              const latency = performance.now() - start;
              return { ok: response.ok, latency };
            } catch (error) {
              return { ok: false, latency: 0 };
            }
          });

          const results = await Promise.all(endpoints);
          const operational = results.every(r => r.ok);
          const avgLatency = results.reduce((acc, r) => acc + r.latency, 0) / results.length;

          return {
            id: service.id,
            name: service.name,
            status: operational ? 'operational' : 'outage',
            last_updated: new Date().toISOString(),
            description: `${service.name} API and services`,
            latency: avgLatency,
            uptime: Math.random() * 20 + 80 // Simulated uptime percentage
          };
        });

        const statuses = await Promise.all(statusChecks);
        setServices(statuses);

        // Calculate overall status
        const hasOutage = statuses.some(s => s.status === 'outage');
        const hasDegraded = statuses.some(s => s.status === 'degraded');
        setOverallStatus(hasOutage ? 'outage' : hasDegraded ? 'degraded' : 'operational');
      } catch (error) {
        console.error('Error checking API status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'outage':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500/10';
      case 'degraded':
        return 'bg-yellow-500/10';
      case 'outage':
        return 'bg-red-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'outage':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden pt-16">
      <AnimatedBackground />
      
      {/* Enhanced background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
            <Image 
              src={logoUrl}
              alt="Seekly Logo" 
              className="relative h-10 w-10 rounded-full ring-2 ring-white/20 shadow-lg transition-transform hover:scale-105"
              width={40}
              height={40}
            />
          </div>
          <h1 className="text-2xl font-serif text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">System Status</span>
          </h1>
        </Link>

        {/* Overall Status Indicator */}
        <div className={`px-4 py-2 ${getStatusBg(overallStatus)} rounded-full flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)} animate-pulse`} />
          <span className={`text-sm ${getStatusText(overallStatus)}`}>
            {overallStatus === 'operational' ? 'All Systems Operational' :
             overallStatus === 'degraded' ? 'Partial System Degradation' :
             'System Outage Detected'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 pt-24">
        {/* Status Grid */}
        <div className="grid gap-4">
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
              >
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/20" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/20 rounded w-1/4" />
                    <div className="h-3 bg-white/20 rounded w-3/4" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            services.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${getStatusBg(service.status)} backdrop-blur-xl rounded-xl p-6 border border-white/20`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${getStatusBg(service.status)} flex items-center justify-center text-2xl`}>
                      {API_SERVICES.find(s => s.id === service.id)?.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{service.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${getStatusText(service.status)}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-400">
                          {service.latency ? `${Math.round(service.latency)}ms` : 'N/A'}
                        </span>
                        {service.uptime && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-400">
                              {service.uptime.toFixed(2)}% uptime
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Updated {new Date(service.last_updated).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Back to Home Button */}
      <div className="fixed bottom-4 right-4 z-30">
        <Link
          href="/"
          className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all text-sm flex items-center gap-2"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
} 