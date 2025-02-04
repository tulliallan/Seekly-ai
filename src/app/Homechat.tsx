'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import { AnimatedBackground } from './components/AnimatedBackground'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FiUser, FiLogOut, FiSettings, FiBell, FiStar, FiCreditCard, FiLink } from 'react-icons/fi'
import { BanScreen } from './components/BanScreen';
import { SettingsModal } from './components/SettingsModal';
import { StatusBar } from './components/StatusBar';
import Link from 'next/link';
import { NotificationBar } from './components/NotificationBar';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/notifications';
import { UpdateLog } from './components/UpdateLog';
import { StrikeWarning } from './components/StrikeWarning';
import { LockedAccountScreen } from './components/LockedAccountScreen';
import { CreditsDisplay } from './components/CreditsDisplay';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { checkAndUpdateCredits } from '@/lib/credits';
import { LowCreditsWarning } from './components/LowCreditsWarning';
import { CreditHistory } from './components/CreditHistory';
import { LowCreditsModal } from './components/LowCreditsModal';
import Image from 'next/image'
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ErrorScreen } from './components/ErrorScreen';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  searchResults?: SearchResult[];
  fullTavilyData?: TavilyResponse;
  reasoningInput?: string;
}

interface TavilyImage {
  url: string;
  description?: string;
}

interface SearchResult {
  title: string;
  content: string;
  url: string;
  snippet?: string;
  score?: number;
  image?: TavilyImage;
}

interface TavilyResponse {
  results: SearchResult[];
  images?: TavilyImage[];
  answer?: string;
  query?: string;
}

interface ChatSection {
  query: string;
  searchResults: SearchResult[];
  reasoning: string;
  response: string;
  error?: string | null;
  isLoadingSources?: boolean;
  isLoadingThinking?: boolean;
  isReasoningCollapsed?: boolean;
}

interface SuggestionType {
  label: string;
  prefix: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read: boolean;
}

interface UserCredits {
  credits_remaining: number;
  is_premium: boolean;
  premium_until: string | null;
  last_free_credit_date: string;
}

interface TopBarProps {
  className?: string;
  systemStatus: string;
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
}

const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a245aa&is=67a0f42a&hm=7c2d8b7b3c0d3db0e9e800748c8c25189838fa87e37cc1b7574627564e9fea7d&=&format=webp&quality=lossless&width=449&height=449"

// Update the TopBar component
const TopBar = ({ 
  className, 
  systemStatus,
  unreadCount,
  showNotifications,
  setShowNotifications,
  showSettings,
  setShowSettings,
  showUserMenu,
  setShowUserMenu
}: TopBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-white/10">
      {/* Left section */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg animate-pulse" />
            <Image 
              src={logoUrl}
              alt="Seekly Logo" 
              className="relative h-10 w-10 rounded-full ring-2 ring-white/20 shadow-lg transition-transform hover:scale-105"
              width={449}
              height={449}
            />
          </div>
          <h1 className="text-2xl font-serif text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">Seek</span>
            <span className="text-white">ly</span>
          </h1>
        </div>
      </div>
      
      {/* Center section with UpdateLog */}
      <div className="flex-1 flex justify-center">
        <UpdateLog />
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Integrations button */}
        <Link
          href="/integrations"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
        >
          <FiLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Integrations
          </span>
        </Link>

        {/* Notifications button */}
        <button
          onClick={() => setShowNotifications(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
        >
          <div className="relative">
            <FiBell className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{unreadCount}</span>
              </div>
            )}
          </div>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
        >
          <FiSettings className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <FiUser className="w-4 h-4 text-blue-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  // All hooks at the top level
  const auth = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentReasoning, setCurrentReasoning] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentSearchResults, setCurrentSearchResults] = useState<SearchResult[]>([]);
  const [showTavilyModal, setShowTavilyModal] = useState(false);
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [selectedMessageData, setSelectedMessageData] = useState<{tavily?: TavilyResponse, reasoning?: string}>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [chatSections, setChatSections] = useState<ChatSection[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<string>('operational');
  const [showStatusNotice, setShowStatusNotice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCreditHistory, setShowCreditHistory] = useState(false);
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [showLowCreditsModal, setShowLowCreditsModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // System status effect
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.some((service: any) => service.status === 'outage')) {
          setSystemStatus('outage');
          setShowStatusNotice(true);
        } else if (data.some((service: any) => service.status === 'degraded')) {
          setSystemStatus('degraded');
          setShowStatusNotice(true);
        } else {
          setSystemStatus('operational');
          setShowStatusNotice(false);
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    };
    checkSystemStatus();
  }, []);

  // Credits effect
  useEffect(() => {
    if (!auth?.user) return;

    const fetchCredits = async () => {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', auth.user?.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      setCredits(data);
    };

    fetchCredits();

    // Subscribe to credit changes
    const subscription = supabase
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
          fetchCredits();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [auth?.user]);

  // Notifications effect
  useEffect(() => {
    if (!auth?.user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    };

    fetchNotifications();

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [auth?.user]); // Added auth?.user as dependency

  // Loading state
  if (!auth) {
    return <LoadingAnimation message="Loading..." />;
  }

  const { signOut, isBanned, banInfo, isLocked, lockInfo } = auth;
  const user = auth.user;

  // Early returns
  if (!user) {
    router.push('/login');
    return null;
  }

  if (isBanned && banInfo) {
    return <BanScreen banInfo={banInfo} />;
  }

  if (isLocked && lockInfo) {
    return <LockedAccountScreen lockInfo={lockInfo} />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  const suggestions: SuggestionType[] = [
    { label: "Podcast Outline", prefix: "Create a detailed podcast outline for: " },
    { label: "YouTube Video Research", prefix: "Research and outline a YouTube video about: " },
    { label: "Short Form Hook Ideas", prefix: "Generate engaging hook ideas for short-form content about: " },
    { label: "Newsletter Draft", prefix: "Write a newsletter draft about: " }
  ];

  const handleSuggestionClick = (suggestion: SuggestionType) => {
    setSelectedSuggestion(suggestion.label);
    if (input) {
      setInput(suggestion.prefix + input);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth || !auth.user) {
      router.push('/login');
      return;
    }

    if (!input.trim() || isLoading) return;

    // Check credits before proceeding
    const hasCredits = await checkAndUpdateCredits(auth.user.id);
    if (!hasCredits) {
      setShowLowCreditsModal(true);
      return;
    }

    // Check if system is in outage state
    if (systemStatus === 'outage') {
      createNotification(
        'System is currently experiencing issues. Please try again later.',
        'error'
      );
      return;
    }

    setHasSubmitted(true);
    setLastQuery(input);
    setError(null);
    setCurrentSearchResults([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setCurrentReasoning('');

    // Create a new chat section with loading states
    const newSection: ChatSection = {
      query: input,
      searchResults: [],
      reasoning: '',
      response: '',
      error: null,
      isLoadingSources: true,
      isLoadingThinking: false
    };
    setChatSections(prev => [...prev, newSection]);
    const sectionIndex = chatSections.length;

    try {
      // Step 1: Search with Tavily
      const searchResponse = await fetch('/api/tavily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input,
          includeImages: true,
          includeImageDescriptions: true
        }),
        signal: abortControllerRef.current.signal,
      });

      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok) {
        throw new Error(searchData.error || 'Failed to fetch search results');
      }

      if (!searchData.results || searchData.results.length === 0) {
        throw new Error('No relevant search results found. Please try a different query.');
      }

      // Combine images with results
      const resultsWithImages = searchData.results.map((result: SearchResult, index: number) => ({
        ...result,
        image: searchData.images?.[index]
      }));

      // Update section with search results and start thinking
      setChatSections(prev => {
        const updated = [...prev];
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          searchResults: resultsWithImages,
          isLoadingSources: false,
          isLoadingThinking: true
        };
        return updated;
      });

      // Step 2: Format search results for Google AI
      const searchContext = resultsWithImages
        .map((result: SearchResult, index: number) => 
          `[Source ${index + 1}]: ${result.title}\n${result.content}\nURL: ${result.url}\n`
        )
        .join('\n\n');

      const sourcesTable = `\n\n## Sources\n| Number | Source | Description |\n|---------|---------|-------------|\n` +
        resultsWithImages.map((result: SearchResult, index: number) => 
          `| ${index + 1} | [${result.title}](${result.url}) | ${result.snippet || result.content.slice(0, 150)}${result.content.length > 150 ? '...' : ''} |`
        ).join('\n');

      const reasoningInput = `Here is the research data:\n${searchContext}\n\nPlease analyze this information and create a detailed report addressing the original query: "${input}". Include citations to the sources where appropriate. If the sources contain any potential biases or conflicting information, please note that in your analysis.\n\nIMPORTANT: Always end your response with a sources table listing all references used. Format it exactly as shown below:\n${sourcesTable}`;

      let assistantMessage: Message = {
        role: 'assistant',
        content: '',
        reasoning: '',
        searchResults: resultsWithImages,
        fullTavilyData: searchData,
        reasoningInput
      };

      // Step 3: Get analysis from Google AI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [
          userMessage,
          {
            role: 'assistant',
            content: 'I found some relevant information. Let me analyze it and create a comprehensive report.',
          },
          {
            role: 'user',
            content: reasoningInput,
          },
        ] }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate report. Please try again.');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.choices?.[0]?.delta?.reasoning_content) {
              const newReasoning = (assistantMessage.reasoning || '') + parsed.choices[0].delta.reasoning_content;
              assistantMessage.reasoning = newReasoning;
              setCurrentReasoning(newReasoning);
              setChatSections(prev => {
                const updated = [...prev];
                updated[sectionIndex] = {
                  ...updated[sectionIndex],
                  reasoning: newReasoning,
                  isLoadingThinking: false
                };
                return updated;
              });
            } else if (parsed.choices?.[0]?.delta?.content) {
              const newContent = (assistantMessage.content || '') + parsed.choices[0].delta.content;
              assistantMessage.content = newContent;
              setChatSections(prev => {
                const updated = [...prev];
                updated[sectionIndex] = {
                  ...updated[sectionIndex],
                  response: newContent
                };
                return updated;
              });
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }

      // Update the section with search results
      setChatSections(prev => {
        const updated = [...prev];
        updated[sectionIndex] = {
          ...updated[sectionIndex],
          searchResults: resultsWithImages
        };
        return updated;
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        console.error('Error:', error);
        setError(errorMessage);
        setChatSections(prev => {
          const updated = [...prev];
          updated[sectionIndex] = {
            ...updated[sectionIndex],
            error: errorMessage,
            isLoadingSources: false,
            isLoadingThinking: false
          };
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      setSearchStatus('');
      abortControllerRef.current = null;
    }
  };

  const toggleReasoning = (index: number) => {
    setChatSections(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        isReasoningCollapsed: !updated[index].isReasoningCollapsed
      };
      return updated;
    });
  };

  const handleSignOut = async () => {
    try {
      if (!auth) return;
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .match({ id });

      if (!error) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await createNotification(
        'This is a test notification!',
        'info'
      );
    } catch (error) {
      console.error('Failed to create test notification:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden pt-16">
      <TopBar 
        systemStatus={systemStatus}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
      />
      <AnimatedBackground />
      <NotificationBar />
      <UpdateLog />
      <StrikeWarning />
      
      {/* Enhanced background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        
        {/* Additional animated background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 pt-16 pb-16"> {/* Reduced padding */}
        <main className="max-w-2xl mx-auto p-4"> {/* Reduced max-width and padding */}
          <AnimatePresence>
            {!hasSubmitted ? (
              <motion.div 
                className="min-h-[80vh] flex flex-col items-center justify-center" // Reduced height
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8"> {/* Reduced margin */}
                  <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-xl text-white rounded-full text-sm font-medium mb-6">
                    Powered by Seekly
                  </div>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-2xl animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-50" />
                      <Image 
                        src={logoUrl}
                        alt="Seekly Logo" 
                        className="relative h-20 w-20 rounded-full ring-4 ring-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300"
                        width={449}
                        height={449}
                      />
                    </div>
                  </div>
                  <h1 className="text-5xl font-serif mb-4 tracking-tight">
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">Seek</span>
                    <span className="text-white">ly</span>
                  </h1>
                  <p className="text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
                    Find what you need in seconds, powered by advanced AI.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[600px] mx-4"> {/* Reduced max-width */}
                  <div className={`relative bg-white/10 backdrop-blur-xl rounded-xl shadow-lg border ${
                    systemStatus === 'outage' 
                      ? 'border-red-500/20 bg-red-500/5' 
                      : 'border-white/20'
                  }`}>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        systemStatus === 'outage' 
                          ? "Chat is currently unavailable" 
                          : "Ask me anything..."
                      }
                      disabled={systemStatus === 'outage'}
                      className={`w-full px-6 py-4 bg-transparent text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 ${
                        systemStatus === 'outage'
                          ? 'cursor-not-allowed placeholder-red-400/50'
                          : 'focus:ring-blue-500/50'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading || systemStatus === 'outage'}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 ${
                        systemStatus === 'outage'
                          ? 'bg-red-500/20 text-red-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                      } rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {systemStatus === 'outage' ? 'Unavailable' : 'Search'}
                    </button>
                  </div>
                  {systemStatus === 'outage' && (
                    <div className="mt-2 text-center">
                      <span className="text-sm text-red-400">
                        ⚠️ Chat functionality is temporarily unavailable due to system maintenance
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedSuggestion === suggestion.label
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 backdrop-blur-xl text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4 pb-24" // Reduced spacing
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {chatSections.map((section, index) => (
                  <div key={index} className="pt-6 border-b border-white/10 last:border-0"> {/* Reduced padding */}
                    <div className="mb-8">
                      <p className="text-lg text-white">
                        {section.query}
                      </p>
                    </div>

                    {/* Sources Section */}
                    {section.searchResults.length > 0 && (
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                            </svg>
                            <h3 className="text-sm font-semibold text-gray-300">Sources</h3>
                          </div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
                          {section.searchResults.map((result, idx) => (
                            <div 
                              key={idx}
                              className="flex-shrink-0 w-[300px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden hover:border-white/40 transition-all"
                            >
                              <div className="h-40 bg-gray-800/50 overflow-hidden relative">
                                {result.image ? (
                                  <>
                                    <div className="absolute inset-0 bg-gray-800/50 animate-pulse" />
                                    <Image 
                                      src={result.image.url} 
                                      alt={result.image.description || result.title}
                                      className="w-full h-full object-cover relative z-10"
                                      onLoad={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.opacity = '1';
                                      }}
                                      style={{ opacity: 0, transition: 'opacity 0.3s' }}
                                      width={500}
                                      height={300}
                                    />
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-800/30">
                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <a 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-gray-200 hover:text-blue-400 block mb-2 font-medium line-clamp-2 transition-colors"
                                >
                                  {result.title}
                                </a>
                                <p className="text-sm text-gray-400 line-clamp-3">{result.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loading States */}
                    {section.isLoadingSources && (
                      <div className="mb-12 animate-pulse">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-5 h-5 bg-white/10 rounded" />
                          <div className="h-4 w-20 bg-white/10 rounded" />
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-4">
                          {[1, 2, 3].map((_, idx) => (
                            <div key={idx} className="flex-shrink-0 w-[300px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                              <div className="h-40 bg-white/5 animate-pulse flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div className="p-4 space-y-3">
                                <div className="h-4 bg-white/5 rounded w-3/4" />
                                <div className="h-4 bg-white/5 rounded w-full" />
                                <div className="h-4 bg-white/5 rounded w-2/3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Loading Status Indicators */}
                    {isLoading && (
                      <div className="mb-6 flex items-center gap-8 text-sm text-gray-400">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span>Loading Sources</span>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 2 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span>Reading Content</span>
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 4 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                          <span>Analyzing Data</span>
                        </motion.div>
                      </div>
                    )}

                    {/* Response Section */}
                    <div className="prose prose-invert max-w-none">
                      <div className="grid grid-cols-1 gap-6 mt-6">
                        {/* Main Analysis Card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-lg">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Analysis</h3>
                          </div>
                          <div className="space-y-4">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-white mt-6 mb-3" {...props} />,
                                p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 space-y-2" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 space-y-2" {...props} />,
                                li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                                a: ({node, ...props}) => (
                                  <a 
                                    className="text-blue-400 hover:text-blue-300 transition-colors" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...props} 
                                  />
                                ),
                                blockquote: ({node, ...props}) => (
                                  <blockquote 
                                    className="border-l-4 border-blue-500/50 pl-4 my-4 text-gray-400 italic"
                                    {...props}
                                  />
                                ),
                                table: ({node, ...props}) => (
                                  <div className="overflow-x-auto my-6">
                                    <table className="min-w-full divide-y divide-white/10" {...props} />
                                  </div>
                                ),
                                thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
                                th: ({node, ...props}) => (
                                  <th 
                                    className="px-4 py-3 text-left text-sm font-semibold text-gray-300"
                                    {...props}
                                  />
                                ),
                                td: ({node, ...props}) => (
                                  <td 
                                    className="px-4 py-3 text-sm text-gray-400 border-t border-white/10"
                                    {...props}
                                  />
                                ),
                                code: ({className, children, ...props}) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-white/10 rounded px-1 py-0.5 text-sm" {...props}>
                                      {children}
                                    </code>
                                  ) : (
                                    <code className="block bg-white/10 rounded-lg p-4 text-sm overflow-x-auto" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                            >
                              {section.response}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {/* Sources Table Card */}
                        {section.response.includes('## Sources') && (
                          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-white">References</h3>
                            </div>
                            <div className="overflow-x-auto">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  table: ({node, ...props}) => (
                                    <table className="min-w-full divide-y divide-white/10" {...props} />
                                  ),
                                  thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
                                  th: ({node, ...props}) => (
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300" {...props} />
                                  ),
                                  td: ({node, ...props}) => (
                                    <td className="px-4 py-3 text-sm text-gray-400 border-t border-white/10" {...props} />
                                  ),
                                }}
                              >
                                {section.response.split('## Sources')[1]}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Account Sidebar */}
      <div className="fixed bottom-4 left-4 z-30">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium truncate max-w-[150px]">
                  {user?.email}
                </span>
                <span className="text-xs text-gray-400">Free Account</span>
              </div>
            </div>

            {/* Credits Section */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Credits</span>
                <button
                  onClick={() => setShowCreditHistory(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View History
                </button>
              </div>
              <div className="flex items-center gap-2">
                <FiCreditCard className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white font-medium">
                  {credits?.credits_remaining || 0} Credits
                </span>
                {credits?.is_premium && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 rounded-full text-xs text-yellow-400">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => setShowPremiumModal(true)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors text-sm text-yellow-400"
              >
                <FiStar className="w-4 h-4" />
                <span>Upgrade to Premium</span>
              </button>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white relative"
              >
                <FiBell className="w-4 h-4" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <div className="absolute right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </button>

              <Link
                href="/profile"
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <FiUser className="w-4 h-4" />
                <span>Profile</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating input box */}
      {hasSubmitted && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-20">
          <form onSubmit={handleSubmit} className="w-full max-w-[600px] mx-4 ml-[240px]">
            <div className="relative bg-white/10 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  systemStatus === 'outage' 
                    ? "Chat is currently unavailable" 
                    : "Ask me anything..."
                }
                disabled={systemStatus === 'outage'}
                className={`w-full px-6 py-4 bg-transparent text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 ${
                  systemStatus === 'outage'
                    ? 'cursor-not-allowed placeholder-red-400/50'
                    : 'focus:ring-blue-500/50'
                }`}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || systemStatus === 'outage'}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 ${
                  systemStatus === 'outage'
                    ? 'bg-red-500/20 text-red-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                } rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {systemStatus === 'outage' ? 'Unavailable' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add animated particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(15)].map((_, i) => ( // Reduced number of particles
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `-${Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Add the Settings Modal */}
      {user && (
        <SettingsModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userId={user.id}
        />
      )}

      {/* Update the footer links */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <Link 
            href="/terms"
            className="hover:text-white transition-colors"
          >
            Terms of Service
          </Link>
          <span>•</span>
          <Link 
            href="/privacy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>

      {/* Add Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 z-30 w-80 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 ${
                        !notification.read ? 'bg-white/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            notification.type === 'info'
                              ? 'bg-blue-500/20'
                              : notification.type === 'success'
                              ? 'bg-green-500/20'
                              : notification.type === 'warning'
                              ? 'bg-yellow-500/20'
                              : 'bg-red-500/20'
                          }`}
                        >
                          <FiBell className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(
                              notification.created_at
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add the Test Notification Button */}
      <button
        onClick={handleTestNotification}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Test Notification
      </button>

      {/* Add the Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={async () => {
          await supabase
            .from('user_credits')
            .update({
              is_premium: true,
              premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              credits_remaining: 500
            })
            .eq('user_id', auth.user?.id);
        }}
      />

      <CreditHistory 
        isOpen={showCreditHistory} 
        onClose={() => setShowCreditHistory(false)} 
      />

      <LowCreditsModal 
        isOpen={showLowCreditsModal}
        onClose={() => setShowLowCreditsModal(false)}
        onUpgrade={() => {
          setShowLowCreditsModal(false);
          setShowPremiumModal(true);
        }}
        nextFreeCredit={
          credits?.last_free_credit_date 
            ? new Date(credits.last_free_credit_date).getTime() < new Date().setHours(0, 0, 0, 0)
              ? 'Available now'
              : 'Tomorrow'
            : 'Loading...'
        }
      />
    </div>
  );
}