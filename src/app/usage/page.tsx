'use client';

import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { testApiKey } from '@/lib/apiKeyTests';

interface CreditHistory {
  id: string;
  user_id: string;
  amount: number;
  type: 'use' | 'add' | 'refund';
  description: string;
  created_at: string;
}

interface UserCredits {
  credits_remaining: number;
  total_credits_used: number;
  monthly_usage: number;
  is_premium: boolean;
}

interface DailyUsage {
  date: string;
  usage: number;
}

interface ApiKey {
  id: string;
  service: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  last_used: string | null;
}

interface ApiService {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultKey: boolean;
}

interface YouTubeTrial {
  trial_start: string;
  trial_end: string;
}

const logoUrl = "https://seekly.ai/logo.png"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function UsagePage() {
  const auth = useAuth();
  const router = useRouter();
  const [creditHistory, setCreditHistory] = useState<CreditHistory[]>([]);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [youtubeTrial, setYoutubeTrial] = useState<YouTubeTrial | null>(null);

  const API_SERVICES: ApiService[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4 and other OpenAI models',
      icon: '🤖',
      defaultKey: true
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude and other Anthropic models',
      icon: '🧠',
      defaultKey: true
    },
    {
      id: 'replicate',
      name: 'Replicate',
      description: 'Access to various open-source models',
      icon: '🔄',
      defaultKey: false
    },
    {
      id: 'deepgram',
      name: 'Deepgram',
      description: 'Speech-to-text transcription',
      icon: '🎤',
      defaultKey: false
    }
  ];

  useEffect(() => {
    if (!auth?.user) return;

    const fetchCreditData = async () => {
      try {
        // Fetch current credits
        const { data: creditData } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', auth.user.id)
          .single();

        // Fetch credit history with real-time updates
        const { data: historyData } = await supabase
          .from('credit_history')
          .select('*')
          .eq('user_id', auth.user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (creditData) {
          setCredits(creditData);
        }
        if (historyData) {
          setCreditHistory(historyData);
          updateDailyUsage(historyData); // New function to update graph
        }
      } catch (error) {
        console.error('Error fetching credit data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // New function to update daily usage data
    const updateDailyUsage = (history: CreditHistory[]) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

      // Filter usage records within the selected time range
      const usageRecords = history.filter(record => 
        record.type === 'use' && 
        new Date(record.created_at) >= startDate &&
        new Date(record.created_at) <= endDate
      );

      // Group by date and sum usage
      const usage = usageRecords.reduce((acc: Record<string, number>, record) => {
        const date = new Date(record.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + record.amount;
        return acc;
      }, {});

      // Fill in missing dates with zero usage
      const dailyData: DailyUsage[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toLocaleDateString();
        dailyData.push({
          date: dateStr,
          usage: usage[dateStr] || 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDailyUsage(dailyData);
    };

    fetchCreditData();

    // Subscribe to both credit and credit history changes
    const creditSubscription = supabase
      .channel('credits')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${auth.user.id}`,
        },
        () => {
          fetchCreditData();
        }
      )
      .subscribe();

    const historySubscription = supabase
      .channel('credit_history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_history',
          filter: `user_id=eq.${auth.user.id}`,
        },
        (payload) => {
          // Update credit history and refresh graph
          setCreditHistory(prev => {
            const newHistory = [payload.new as CreditHistory, ...prev].slice(0, 50);
            updateDailyUsage(newHistory);
            return newHistory;
          });
        }
      )
      .subscribe();

    return () => {
      creditSubscription.unsubscribe();
      historySubscription.unsubscribe();
    };
  }, [auth?.user, timeRange]); // Added timeRange as dependency

  useEffect(() => {
    const fetchApiKeys = async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', auth.user?.id);

      if (error) {
        console.error('Error fetching API keys:', error);
        return;
      }

      setApiKeys(data || []);
    };

    fetchApiKeys();
  }, [auth.user]);

  useEffect(() => {
    const fetchYouTubeTrial = async () => {
      if (!auth?.user?.id) return;

      const { data } = await supabase
        .from('youtube_trial')
        .select('*')
        .eq('user_id', auth.user.id)
        .single();

      if (data) {
        setYoutubeTrial(data);
      }
    };

    fetchYouTubeTrial();
  }, [auth?.user?.id]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get credit type badge style
  const getCreditBadgeStyle = (type: string) => {
    switch (type) {
      case 'add':
        return 'bg-green-500/20 text-green-400';
      case 'use':
        return 'bg-blue-500/20 text-blue-400';
      case 'refund':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleAddApiKey = async (service: string, apiKey: string) => {
    try {
      setIsTestingKey(true);
      setTestResult(null);

      // Test the API key first
      const isValid = await testApiKey(service, apiKey);
      
      if (!isValid) {
        setTestResult('error');
        return;
      }

      setTestResult('success');

      // Add key to database
      const { error } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: auth.user?.id,
            service,
            api_key: apiKey
          }
        ]);

      if (error) throw error;

      // Refresh API keys
      const { data } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', auth.user?.id);
      
      setApiKeys(data || []);
      
      // Close modal after short delay to show success state
      setTimeout(() => {
        setShowAddKeyModal(false);
        setTestResult(null);
      }, 1500);

    } catch (error) {
      console.error('Error adding API key:', error);
      setTestResult('error');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleRemoveApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    } catch (error) {
      console.error('Error removing API key:', error);
    }
  };

  if (!auth?.user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden pt-16">
      <AnimatedBackground />
      
      {/* Enhanced background patterns - matching homepage */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>
      
      {/* Header - matching homepage style */}
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
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">Usage</span>
          </h1>
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-6 pt-20 md:pt-24 pb-24">
        <div className="grid gap-6">
          {/* Credit Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
            >
              <h3 className="text-sm text-gray-400 mb-2">Available Credits</h3>
              <div className="text-3xl font-bold text-white">
                {credits?.credits_remaining || 0}
                <span className="text-sm text-gray-400 ml-2">credits</span>
              </div>
              {credits?.is_premium && (
                <span className="mt-2 inline-block px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-400">
                  Premium Account
                </span>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
            >
              <h3 className="text-sm text-gray-400 mb-2">Monthly Usage</h3>
              <div className="text-3xl font-bold text-white">
                {credits?.monthly_usage || 0}
                <span className="text-sm text-gray-400 ml-2">credits</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
            >
              <h3 className="text-sm text-gray-400 mb-2">Total Credits Used</h3>
              <div className="text-3xl font-bold text-white">
                {credits?.total_credits_used || 0}
                <span className="text-sm text-gray-400 ml-2">credits</span>
              </div>
            </motion.div>
          </div>

          {/* Usage Graph */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Credit Usage</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-white/10 text-white rounded-lg px-3 py-1 text-sm border border-white/20"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            <div className="h-64 relative">
              {dailyUsage.length > 0 ? (
                <Line
                  data={{
                    labels: dailyUsage.map(d => d.date),
                    datasets: [
                      {
                        label: 'Credits Used',
                        data: dailyUsage.map(d => d.usage),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        pointBorderColor: 'rgb(255, 255, 255)',
                        pointBorderWidth: 2,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        }
                      },
                      y: {
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)',
                        },
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        beginAtZero: true
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'rgb(255, 255, 255)',
                        bodyColor: 'rgb(255, 255, 255)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                          label: (context) => `${context.parsed.y} credits used`
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  No usage data available
                </div>
              )}
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-sm text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-white">
                  {dailyUsage.reduce((sum, day) => sum + day.usage, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Daily</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(dailyUsage.reduce((sum, day) => sum + day.usage, 0) / dailyUsage.length)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Peak Usage</p>
                <p className="text-2xl font-bold text-white">
                  {Math.max(...dailyUsage.map(day => day.usage))}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Credit History Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
          >
            <h2 className="text-lg font-semibold text-white mb-6">Credit History</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : creditHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No credit history available
              </div>
            ) : (
              <div className="space-y-4">
                {creditHistory.map((record) => (
                  <div 
                    key={record.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all gap-2 sm:gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`px-2 py-1 rounded-full text-xs ${getCreditBadgeStyle(record.type)}`}>
                        {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm sm:text-base">{record.description}</p>
                        <p className="text-xs sm:text-sm text-gray-400">{formatDate(record.created_at)}</p>
                      </div>
                    </div>
                    <div className={`text-base sm:text-lg font-semibold ${
                      record.type === 'use' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {record.type === 'use' ? '-' : '+'}{record.amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* API Keys Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/30 transition-all"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">AI Models & API Keys</h2>
              <button
                onClick={() => setShowAddKeyModal(true)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add API Key
              </button>
            </div>

            <div className="space-y-4">
              {API_SERVICES.map(service => {
                const userKey = apiKeys.find(key => key.service === service.id);
                
                return (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{service.name}</h3>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {service.defaultKey ? (
                        <span className="text-sm text-gray-400">Using default key</span>
                      ) : userKey ? (
                        <>
                          <span className="text-sm text-green-400">Connected</span>
                          <button
                            onClick={() => handleRemoveApiKey(userKey.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedService(service.id);
                            setShowAddKeyModal(true);
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Add Key
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* YouTube Trial Status */}
          {youtubeTrial && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
            >
              <h2 className="text-lg font-semibold text-white mb-4">YouTube Trial Status</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Trial Started</p>
                  <p className="text-lg text-white">
                    {new Date(youtubeTrial.trial_start).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Trial Ends</p>
                  <p className="text-lg text-white">
                    {new Date(youtubeTrial.trial_end).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Back to Home Button - Mobile Friendly */}
      <div className="fixed bottom-20 right-4 z-30 md:bottom-4">
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
          Back
        </Link>
      </div>

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl p-6 border border-white/20 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Add API Key for {API_SERVICES.find(s => s.id === selectedService)?.name}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const apiKey = (form.elements.namedItem('apiKey') as HTMLInputElement).value;
              if (selectedService && apiKey) {
                handleAddApiKey(selectedService, apiKey);
              }
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  name="apiKey"
                  placeholder="Enter API key"
                  className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400"
                  disabled={isTestingKey}
                />
                
                {testResult === 'error' && (
                  <div className="text-red-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Invalid API key. Please check and try again.
                  </div>
                )}

                {testResult === 'success' && (
                  <div className="text-green-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    API key verified successfully!
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddKeyModal(false);
                    setTestResult(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isTestingKey}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTestingKey}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors relative"
                >
                  {isTestingKey ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Testing Key...
                    </div>
                  ) : (
                    'Add Key'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 