'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import { AnimatedBackground } from './components/AnimatedBackground'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { FiUser, FiLogOut, FiSettings, FiBell, FiStar, FiCreditCard, FiClock } from 'react-icons/fi'
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
import { YouTubeResults } from './components/YouTubeResults';
import { ChatHistorySidebar } from './components/ChatHistorySidebar';
import { v4 as uuidv4 } from 'uuid';
import { YouTubeModePopup } from './components/YouTubeModePopup';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  searchResults?: SearchResult[];
  fullTavilyData?: TavilyResponse;
  reasoningInput?: string;
  youtubeResults?: any[];
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
  youtubeResults?: any[];
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

// Update the logo URL to use the new image
const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a5916a&is=67a43fea&hm=a48aac974fcd2fcd4a3f31de0bb23f6d1156a9c07ba6f11b10b17ef32c1fdbbd&=&format=webp&quality=lossless&width=449&height=449";

// Update the TopBar component
const TopBar = ({ className, systemStatus }: { className?: string; systemStatus: string }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-gray-800/50 backdrop-blur-xl flex items-center justify-between px-6 z-50 border-b border-white/10">
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
      
      {/* Status indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 rounded-full transition-colors">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-sm text-green-400">All Systems Operational</span>
      </div>
    </div>
  );
};

// Update the Analysis Card component
const AnalysisCard = ({ response, searchResults }: { response: string; searchResults: SearchResult[] }) => {
  return (
    <div className="space-y-6">
      {/* Social Media Profiles Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Social Profiles Found</h3>
            <p className="text-sm text-gray-400">Relevant social media accounts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((result, idx) => {
            const platform = getPlatformInfo(result.url);
            if (!platform) return null;

            return (
              <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  {/* Platform Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${platform.bgColor}`}>
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=64`}
                      alt={platform.name}
                      className="w-6 h-6"
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        {extractUsername(result.url, platform.name)}
                      </span>
                      {platform.verified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{platform.name}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.content}</p>
                  </div>
                </div>

                {/* Action Button */}
                <a 
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${platform.buttonStyle}`}
                >
                  View Profile
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* DeepSeek API Down Notice */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-red-500/20 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Analysis Unavailable</h3>
            <p className="text-sm text-red-400">DeepSeek API System Down</p>
          </div>
        </div>
        <div className="text-center space-y-4">
          <p className="text-gray-300">
            We apologize for the inconvenience, but our DeepSeek API system is currently experiencing technical difficulties.
          </p>
          <p className="text-gray-400 text-sm">
            Our team is working to restore the analysis service as quickly as possible. In the meantime, you can still browse through the sources above.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get platform info
const getPlatformInfo = (url: string) => {
  const hostname = new URL(url).hostname.toLowerCase();
  
  const platforms = {
    'twitter.com': {
      name: 'Twitter',
      domain: 'twitter.com',
      bgColor: 'bg-blue-500/20',
      buttonStyle: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
      verified: true
    },
    'instagram.com': {
      name: 'Instagram',
      domain: 'instagram.com',
      bgColor: 'bg-pink-500/20',
      buttonStyle: 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30',
      verified: true
    },
    'linkedin.com': {
      name: 'LinkedIn',
      domain: 'linkedin.com',
      bgColor: 'bg-blue-600/20',
      buttonStyle: 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30',
      verified: true
    },
    'facebook.com': {
      name: 'Facebook',
      domain: 'facebook.com',
      bgColor: 'bg-blue-700/20',
      buttonStyle: 'bg-blue-700/20 text-blue-400 hover:bg-blue-700/30',
      verified: true
    },
    'tiktok.com': {
      name: 'TikTok',
      domain: 'tiktok.com',
      bgColor: 'bg-purple-500/20',
      buttonStyle: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
      verified: true
    }
  };

  const platform = Object.entries(platforms).find(([domain]) => hostname.includes(domain));
  return platform ? platform[1] : null;
};

// Helper function to extract username from URL
const extractUsername = (url: string, platform: string) => {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  
  switch (platform) {
    case 'Twitter':
      return `@${pathParts[0]}`;
    case 'Instagram':
      return `@${pathParts[0]}`;
    case 'LinkedIn':
      return pathParts[1] || 'Profile';
    case 'Facebook':
      return pathParts[0] || 'Profile';
    case 'TikTok':
      return `@${pathParts[0]}`;
    default:
      return 'Profile';
  }
};

// 1. Enhanced Loading State Component
const LoadingSourceCard = () => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
    <div className="h-48 bg-gradient-to-r from-white/5 to-white/10 animate-gradient">
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    </div>
    <div className="p-6 space-y-4">
      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-white/5 rounded animate-pulse" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-5/6" />
        <div className="h-3 bg-white/5 rounded animate-pulse w-4/6" />
      </div>
    </div>
  </div>
);

// Update the SourcesCard component
interface SourcesCardProps {
  searchResults: SearchResult[];
}

const SourcesCard = ({ searchResults }: SourcesCardProps) => {
  // Separate sources into social and general
  const socialSources = searchResults.filter(result => getSourceType(result.url) === 'social');
  const generalSources = searchResults.filter(result => getSourceType(result.url) === 'other');

  const renderSocialSection = () => {
    if (!socialSources.length) return null;

    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Social Media Profiles</h3>
            <p className="text-sm text-gray-400">{socialSources.length} profiles found</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialSources.map((result, idx) => {
            const platform = getPlatformInfo(result.url);
            if (!platform) return null;

            return (
              <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  {/* Profile Picture or Platform Icon */}
                  <div className={`relative w-16 h-16 rounded-full overflow-hidden ${platform.bgColor}`}>
                    {result.image ? (
                      <Image
                        src={result.image.url}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=64`}
                          alt={platform.name}
                          className="w-8 h-8"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${platform.domain}&sz=16`}
                        alt={platform.name}
                        className="w-3 h-3"
                      />
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-medium text-white">
                        {extractUsername(result.url, platform.name)}
          </span>
                      {platform.verified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{platform.name}</p>
                    <p className="text-sm text-gray-300 line-clamp-2">{result.content}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <a 
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${platform.buttonStyle}`}
                  >
                    View Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGeneralSection = () => {
    if (!generalSources.length) return null;

    return (
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Research Sources</h3>
            <p className="text-sm text-gray-400">{generalSources.length} sources found</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {generalSources.map((result, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all group">
              {/* 3. Enhanced image container */}
              <div className="relative h-48 overflow-hidden">
                {result.image ? (
                  <>
                    <Image
                      src={result.image.url}
                      alt={result.image.description || result.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                  </>
                ) : (
                  <div className="h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <div className="text-4xl opacity-30">🔍</div>
              </div>
            )}
                {/* 4. Add website favicon */}
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-full p-2">
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}&sz=32`}
                    alt="Website Icon"
                    className="w-4 h-4"
                  />
          </div>
              </div>

              {/* 5. Enhanced content section */}
              <div className="p-6 space-y-4">
                <a 
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {result.title}
                  </h3>
                </a>
                <p className="text-sm text-gray-400 line-clamp-3">
                  {result.content}
                </p>
                
                {/* 6. Enhanced metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Source {idx + 1}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{new URL(result.url).hostname}</span>
                  </div>
                  <a 
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    Visit <span className="sr-only">source {idx + 1}</span>
                    →
                  </a>
            </div>
        </div>
            </div>
          ))}
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderSocialSection()}
      {renderGeneralSection()}
    </div>
  );
};

// 8. Add loading progress indicators
const LoadingProgress = () => (
  <div className="flex items-center justify-center gap-8 mb-8">
    <motion.div 
      className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <span className="text-sm text-gray-400">Searching sources...</span>
    </motion.div>

    <motion.div 
      className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm text-gray-400">Processing data...</span>
    </motion.div>

    <motion.div 
      className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
      <span className="text-sm text-gray-400">Generating insights...</span>
    </motion.div>
  </div>
);

// 9. Add source reliability indicator
const getSourceReliability = (url: string) => {
  // Add logic to determine source reliability
  return {
    score: Math.random() * 100,
    label: "Highly Reliable"
  };
};

// 10. Add source freshness indicator
const getContentAge = (content: string) => {
  // Add logic to determine content age
  return "Recent";
};

// 11. Add source type detection
const getSourceType = (url: string): 'social' | 'news' | 'blog' | 'other' => {
  const hostname = new URL(url).hostname.toLowerCase();
  
  const socialPlatforms = {
    'twitter.com': 'social',
    'x.com': 'social',
    'instagram.com': 'social',
    'facebook.com': 'social',
    'linkedin.com': 'social',
    'tiktok.com': 'social',
    'youtube.com': 'social',
    'reddit.com': 'social',
    'threads.net': 'social'
  };

  return socialPlatforms[hostname as keyof typeof socialPlatforms] || 'other';
};

// 12. Add source metrics
const SourceMetrics = ({ url }: { url: string }) => {
  const reliability = getSourceReliability(url);
  return (
    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-white">{reliability.label}</span>
      </div>
    </div>
  );
};

// 13. Add loading animation styles
const loadingAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// 14. Add source card hover effects
const sourceCardHoverEffects = {
  initial: { scale: 1 },
  hover: { scale: 1.02 }
};

// 15. Add loading progress bar
const LoadingProgressBar = () => (
  <div className="fixed top-0 left-0 right-0 h-1 bg-white/10">
    <motion.div
      className="h-full bg-blue-500"
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{ duration: 15, ease: "linear" }}
    />
  </div>
);

// Instead, create a proper component
const LoadingStates = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {[...Array(6)].map((_, idx) => (
      <LoadingSourceCard key={idx} />
    ))}
  </div>
);

// Add this function at the top level
const updateUserCredits = async (userId: string, creditsUsed: number) => {
  try {
    // Update user_credits table
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('credits_remaining, monthly_usage, total_credits_used')
      .eq('user_id', userId)
      .single();

    if (currentCredits) {
      await supabase
        .from('user_credits')
        .update({
          credits_remaining: currentCredits.credits_remaining - creditsUsed,
          monthly_usage: (currentCredits.monthly_usage || 0) + creditsUsed,
          total_credits_used: (currentCredits.total_credits_used || 0) + creditsUsed
        })
        .eq('user_id', userId);
    }

    // Add to credit history
    await supabase
      .from('credit_history')
      .insert([
        {
          user_id: userId,
          amount: creditsUsed,
          type: 'use',
          description: `Used ${creditsUsed} credits for chat query`
        }
      ]);
  } catch (error) {
    console.error('Error updating credits:', error);
  }
};

// Add this new component for the animated logo transition
const AnimatedLogo = ({ mode }: { mode: 'default' | 'youtube' }) => {
  return (
    <motion.div className="flex justify-center mb-6">
      <motion.div 
        className="relative"
        animate={mode === 'youtube' ? {
          scale: [1, 1.2, 1],
          rotate: [0, 360, 360]
        } : {}}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <motion.div
          className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${
            mode === 'youtube' 
              ? 'bg-gradient-to-r from-red-500/30 to-red-700/30' 
              : 'bg-gradient-to-r from-blue-500/30 to-purple-500/30'
          }`}
        />
        <motion.div
          className={`absolute inset-0 rounded-full blur-md opacity-50 ${
            mode === 'youtube'
              ? 'bg-gradient-to-r from-red-500 to-red-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
        />
        <Image 
          src={logoUrl}
          alt="Seekly Logo" 
          className="relative h-20 w-20 rounded-full ring-4 ring-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300"
          width={80}
          height={80}
        />
      </motion.div>
    </motion.div>
  );
};

// Add this new component for the animated title
const AnimatedTitle = ({ mode }: { mode: 'default' | 'youtube' }) => {
  return (
    <motion.div
      className="text-center"
      layout
    >
      <motion.h1 
        className="text-5xl font-serif mb-4 tracking-tight inline-flex items-center gap-3"
        layout
      >
        <motion.span
          className={`bg-gradient-to-r ${
            mode === 'youtube' 
              ? 'from-red-400 to-red-600'
              : 'from-blue-400 to-blue-600'
          } text-transparent bg-clip-text`}
          layout
        >
          Seek
        </motion.span>
        <motion.span className="text-white" layout>ly</motion.span>
        {mode === 'youtube' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500 text-white text-sm px-3 py-1 rounded-full ml-2"
          >
            YouTube
          </motion.span>
        )}
      </motion.h1>
      <motion.p
        className="text-xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed"
        layout
      >
        {mode === 'youtube' 
          ? 'Search and analyze YouTube content with AI'
          : 'Find what you need in seconds, powered by advanced AI.'}
      </motion.p>
    </motion.div>
  );
};

// Update your mode selection buttons with animations
const ModeSelector = ({ mode, setMode }: { mode: 'default' | 'youtube', setMode: (mode: 'default' | 'youtube') => void }) => {
  return (
    <div className="flex justify-center gap-4 mb-6 relative">
      <motion.button
        onClick={() => setMode('default')}
        type="button"
        className={`px-4 py-2 rounded-lg transition-all relative ${
          mode === 'default' 
            ? 'text-white' 
            : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {mode === 'default' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg -z-10"
            layoutId="activeMode"
          />
        )}
        Default Search
      </motion.button>

      <motion.button
        onClick={() => setMode('youtube')}
        type="button"
        className={`px-4 py-2 rounded-lg transition-all relative ${
          mode === 'youtube'
            ? 'text-white'
            : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {mode === 'youtube' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-lg -z-10"
            layoutId="activeMode"
          />
        )}
        YouTube Search
      </motion.button>
    </div>
  );
};

// Change the name of the new background component to ThemeBackground
const ThemeBackground = ({ mode }: { mode: 'default' | 'youtube' }) => {
  return (
    <motion.div
      className="fixed inset-0 z-0"
      animate={{
        background: mode === 'youtube'
          ? 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.15), rgba(185, 28, 28, 0.25))'
          : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), rgba(29, 78, 216, 0.25))'
      }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: mode === 'youtube' ? 0 : 1
        }}
        transition={{ duration: 0.8 }}
      >
        {/* Original background patterns for default mode */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </motion.div>

      {/* YouTube mode background elements */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: mode === 'youtube' ? 1 : 0
        }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#dc2626,transparent)] opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#dc2626_1px,transparent_1px),linear-gradient(-45deg,#dc2626_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
      </motion.div>
    </motion.div>
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
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [mode, setMode] = useState<'default' | 'youtube'>('default');
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>();
  const [showYouTubePopup, setShowYouTubePopup] = useState(false);
  const [youTubeTrialStarted, setYouTubeTrialStarted] = useState(false);

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

  // Add this effect to check YouTube trial status
  useEffect(() => {
    if (!auth?.user?.id) return;

    const checkYouTubeTrial = async () => {
      const { data } = await supabase
        .from('youtube_trial')
        .select('*')
        .eq('user_id', auth.user.id)
        .single();

      if (!data) {
        // No trial record exists, show popup
        const doNotShow = localStorage.getItem('youtubePopupDismissed') === 'true';
        if (!doNotShow) {
          setShowYouTubePopup(true);
        }
      } else {
        setYouTubeTrialStarted(true);
        // Check if trial has expired
        const trialEnd = new Date(data.trial_end);
        if (trialEnd < new Date()) {
          // Trial has expired, implement your logic here
        }
      }
    };

    checkYouTubeTrial();
  }, [auth?.user?.id]);

  // Loading state
  if (!auth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
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

  // Function to deduplicate sources
  const deduplicateSources = (results: SearchResult[]): SearchResult[] => {
    const seen = new Set();
    return results.filter(result => {
      const hostname = new URL(result.url).hostname;
      if (seen.has(hostname)) {
        return false;
      }
      seen.add(hostname);
      return true;
    }).slice(0, 5); // Limit to 5 unique sources
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBanned) {
      setError("Your account has been banned. You cannot use the chat feature.");
      return;
    }

    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setHasSubmitted(true);
    setLastQuery(input);
    setError(null);

    try {
      // Check if user has enough credits
      const { data: creditData } = await supabase
        .from('user_credits')
        .select('credits_remaining')
        .eq('user_id', auth.user.id)
        .single();

      if (!creditData || creditData.credits_remaining < 10) {
        setShowLowCreditsModal(true);
        return;
      }

      if (mode === 'youtube') {
        try {
          const response = await fetch('/api/youtube/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: input,
              type: input.toLowerCase().includes('analytics') ? 'analytics' : 'videos'
            })
          });

          const data = await response.json();
          if (data.error) throw new Error(data.error);

          if (data.type === 'channel') {
            // Handle channel analytics
            const newSection: ChatSection = {
              query: input,
              searchResults: [],
              reasoning: '',
              response: `Channel Analytics for ${data.details?.snippet?.title}:\n
• Subscribers: ${data.analytics?.subscriberCount?.toLocaleString()}\n
• Total Views: ${data.analytics?.viewCount?.toLocaleString()}\n
• Total Videos: ${data.analytics?.videoCount?.toLocaleString()}`,
              youtubeResults: [],
              error: null,
              isLoadingSources: false,
              isLoadingThinking: false
            };
            setChatSections(prev => [...prev, newSection]);
          } else {
            // Handle video results
            const newSection: ChatSection = {
              query: input,
              searchResults: [],
              reasoning: '',
              response: '',
              youtubeResults: data.items,
              error: null,
              isLoadingSources: false,
              isLoadingThinking: false
            };
            setChatSections(prev => [...prev, newSection]);
          }

          // Save to chat history
          const chatId = uuidv4();
          const newChat: ChatHistory = {
            id: chatId,
            query: input,
            timestamp: new Date().toISOString(),
            type: 'youtube',
            youtubeResults: data.type === 'videos' ? data.items : []
          };
          await saveChatToHistory(newChat);
          setCurrentChatId(chatId);

        } catch (error) {
          console.error('YouTube search error:', error);
          setError('Failed to fetch YouTube results');
          setChatSections(prev => [...prev, {
            query: input,
            searchResults: [],
            reasoning: '',
            response: '',
            error: 'Failed to fetch YouTube results',
            isLoadingSources: false,
            isLoadingThinking: false
          }]);
        }
        setInput('');
        return;
      } else {
        // Default search logic
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
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

        // Step 1: Search with Tavily
        const searchResponse = await fetch('/api/tavily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: input,
            includeImages: true,
            includeImageDescriptions: true,
            maxResults: 10
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

        // Deduplicate and limit sources
        const uniqueResults = deduplicateSources(searchData.results);
        const resultsWithImages = uniqueResults.map((result: SearchResult, index: number) => ({
          ...result,
          image: searchData.images?.[index]
        }));

        // Update section with search results
        setChatSections(prev => {
          const updated = [...prev];
          if (updated[sectionIndex]) {
            updated[sectionIndex] = {
              ...updated[sectionIndex],
              searchResults: resultsWithImages,
              isLoadingSources: false,
              isLoadingThinking: true
            };
          }
          return updated;
        });

        // Update credits
        const creditsUsed = 10;
        await updateUserCredits(auth.user.id, creditsUsed);

        // Step 2: Get analysis from AI
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages: [userMessage],
            userId: auth.user.id,
            model: selectedModel,
            searchResults: resultsWithImages
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to generate response. Please try again.');
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
              if (parsed.choices?.[0]?.delta?.content) {
                const newContent = parsed.choices[0].delta.content;
                setChatSections(prev => {
                  const updated = [...prev];
                  if (updated[sectionIndex]) {
                    updated[sectionIndex] = {
                      ...updated[sectionIndex],
                      response: (updated[sectionIndex].response || '') + newContent,
                      isLoadingThinking: false
                    };
                  }
                  return updated;
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search');
      if (error instanceof Error) {
        const errorMessage = error.message;
        setChatSections(prev => {
          const updated = [...prev];
          const sectionIndex = updated.length - 1;
          if (updated[sectionIndex]) {
            updated[sectionIndex] = {
              ...updated[sectionIndex],
              error: errorMessage,
              isLoadingSources: false,
              isLoadingThinking: false
            };
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      setInput('');
      setSearchStatus('');
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
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

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    
    // Only allow selecting Seekly for now
    if (newModel !== 'seekly') {
      alert('This model is currently disabled. Please use Seekly for now.');
      setSelectedModel('seekly');
      return;
    }
    
    setSelectedModel(newModel);
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const service = selectedModel.startsWith('gpt') ? 'openai' : 'anthropic';
    setIsTestingKey(true);

    try {
      const isValid = await testApiKey(service, tempApiKey);
      
      if (isValid) {
        await supabase
          .from('api_keys')
          .insert([
            {
              user_id: auth.user?.id,
              service,
              api_key: tempApiKey
            }
          ]);

        setShowApiKeyPrompt(false);
        setTempApiKey('');
        // Refresh API keys
        const { data } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', auth.user?.id);
        
        setApiKeys(data || []);
      } else {
        alert('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key. Please try again.');
    } finally {
      setIsTestingKey(false);
    }
  };

  useEffect(() => {
    if (isBanned) {
      router.push('/banned');
    }
  }, [isBanned, router]);

  // Add this effect to load chat history
  useEffect(() => {
    if (!auth?.user?.id) return;
    
    const loadChatHistory = async () => {
      const { data } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setChatHistory(data);
      }
    };
    
    loadChatHistory();
  }, [auth?.user?.id]);

  // Add this function to save chat to history
  const saveChatToHistory = async (chat: ChatHistory) => {
    if (!auth?.user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert([{
          ...chat,
          user_id: auth.user.id
        }]);
      
      if (!error) {
        setChatHistory(prev => [chat, ...prev]);
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  // Add this function to handle trial start
  const startYouTubeTrial = async () => {
    if (!auth?.user?.id || youTubeTrialStarted) return;

    const trialEnd = new Date();
    trialEnd.setMonth(trialEnd.getMonth() + 1);

    const { error } = await supabase
      .from('youtube_trial')
      .insert([
        {
          user_id: auth.user.id,
          trial_start: new Date().toISOString(),
          trial_end: trialEnd.toISOString(),
        }
      ]);

    if (!error) {
      setYouTubeTrialStarted(true);
    }
  };

  // Update the mode selection handler
  const handleModeChange = (newMode: 'default' | 'youtube') => {
    setMode(newMode);
    if (newMode === 'youtube' && !youTubeTrialStarted) {
      const doNotShow = localStorage.getItem('youtubePopupDismissed') === 'true';
      if (!doNotShow) {
        setShowYouTubePopup(true);
      }
      startYouTubeTrial();
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden pt-16">
      <ThemeBackground mode={mode} />
      <TopBar systemStatus={systemStatus} />
      <NotificationBar />
      <UpdateLog />
      <StrikeWarning />
      
      <div className="relative z-10 pt-16 pb-16">
        <main className="max-w-7xl mx-auto p-4">
          <AnimatePresence>
            {!hasSubmitted ? (
              <motion.div 
                className="min-h-[80vh] flex flex-col items-center justify-center"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedLogo mode={mode} />
                <AnimatedTitle mode={mode} />
                
                <form onSubmit={handleSubmit} className="w-full max-w-[600px] mx-4">
                  <ModeSelector mode={mode} setMode={handleModeChange} />
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-400">
                      Additional models are currently disabled. Stay tuned for updates!
                  </p>
                </div>
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
                          : mode === 'youtube'
                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
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
                className="space-y-4 pb-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {chatSections.map((section, index) => (
                  <div key={index} className="pt-6 border-b border-white/10 last:border-0">
                    {/* User Query */}
                    <div className="mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-lg text-white mt-1">
                        {section.query}
                      </p>
                      </div>
                    </div>

                    {/* Loading States */}
                    {section.isLoadingSources && (
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Searching YouTube</h3>
                            <p className="text-sm text-gray-400">Finding relevant videos...</p>
                        </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(6)].map((_, idx) => (
                            <div 
                              key={idx}
                              className="bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10"
                            >
                              <div className="aspect-video bg-white/5 animate-pulse" />
                              <div className="p-4 space-y-3">
                                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                                <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="h-3 bg-white/5 rounded animate-pulse" />
                                  <div className="h-3 bg-white/5 rounded animate-pulse" />
                                  <div className="h-3 bg-white/5 rounded animate-pulse" />
                                  </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* YouTube Results */}
                    {section.youtubeResults && (
                      <div className="mb-8">
                        <div className="flex items-start gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">YouTube Results</h3>
                            <p className="text-sm text-gray-400">{section.youtubeResults.length} videos found</p>
                              </div>
                            </div>
                        <YouTubeResults videos={section.youtubeResults} />
                      </div>
                    )}

                    {/* Regular Search Results */}
                    {!section.youtubeResults && section.searchResults.length > 0 && (
                      <div className="mb-8">
                        <SourcesCard searchResults={section.searchResults} />
                      </div>
                    )}

                    {/* Error Message */}
                    {section.error && (
                      <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400">{section.error}</p>
                          </div>
                        )}
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

            {/* Add Usage Button */}
            <Link 
              href="/usage"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <svg 
                  className="w-4 h-4 text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium">Usage</span>
                <span className="text-xs text-gray-400">View your stats</span>
              </div>
            </Link>

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
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white relative group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <FiBell className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Notifications</span>
                  <span className="text-xs text-gray-400">{unreadCount} unread</span>
                </div>
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{unreadCount}</span>
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
                    : mode === 'youtube'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
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
        {[...Array(15)].map((_, i) => (
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

      {/* Add the Loading Progress Bar */}
      <LoadingProgressBar />

      {/* API Key Prompt Modal */}
      {showApiKeyPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl p-6 border border-white/20 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Enter API Key for {selectedModel.startsWith('gpt') ? 'OpenAI' : 'Anthropic'}
            </h3>
            <form onSubmit={handleApiKeySubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400"
                  disabled={isTestingKey}
                />
                
                <div className="text-sm text-gray-400">
                  Your API key will be securely stored and used for future requests.
              </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
              <button
                  type="button"
                  onClick={() => {
                    setShowApiKeyPrompt(false);
                    setSelectedModel('seekly'); // Reset to default if cancelled
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isTestingKey}
                >
                  Cancel
              </button>
              <button
                  type="submit"
                  disabled={isTestingKey || !tempApiKey.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors relative"
                >
                  {isTestingKey ? (
                    <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </div>
                ) : (
                    'Save Key'
                )}
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add the chat history button to your UI */}
      <button
        onClick={() => setShowChatHistory(true)}
        className="fixed top-20 left-4 z-30 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <FiClock className="w-5 h-5 text-white" />
      </button>

      {/* Add the sidebar to your JSX */}
      <ChatHistorySidebar
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        chatHistory={chatHistory}
        onChatSelect={(chat) => {
          setCurrentChatId(chat.id);
          if (chat.type === 'youtube') {
            setMode('youtube');
            setChatSections(prev => [...prev, {
              query: chat.query,
              searchResults: [],
              reasoning: '',
              response: '',
              youtubeResults: chat.youtubeResults,
              error: null,
              isLoadingSources: false,
              isLoadingThinking: false
            }]);
          } else {
            setMode('default');
            setChatSections(prev => [...prev, {
              query: chat.query,
              searchResults: chat.searchResults,
              reasoning: '',
              response: '',
              error: null,
              isLoadingSources: false,
              isLoadingThinking: false
            }]);
          }
          setShowChatHistory(false);
        }}
        currentChatId={currentChatId}
      />

      {/* Add the YouTube Mode Popup */}
      <YouTubeModePopup
        isOpen={showYouTubePopup}
        onClose={() => setShowYouTubePopup(false)}
        onDoNotShowAgain={() => {
          localStorage.setItem('youtubePopupDismissed', 'true');
        }}
      />
    </div>
  );
}