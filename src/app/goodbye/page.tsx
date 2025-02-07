'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Custom useWindowSize hook
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize();
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return windowSize;
};

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
})

// Update the logo URL to use the correct Discord CDN link
const LOGO_URL = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a4e8aa&is=67a3972a&hm=3dfaa154a11f5b905e3b2fe344b2a76b886b111bd51884ffbf7000e4fecb4cd5&=&format=webp&quality=lossless&width=449&height=449"

// Add new animations
const glowVariants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: { 
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.2, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Update the AnnouncementBar component
const AnnouncementBar = () => {
  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500/10 to-purple-500/10 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex flex-col items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium text-white">Critical System Notice</span>
          </div>
          
          <div className="text-center space-y-1">
            <span className="text-gray-300 block">
              Due to overwhelming server demand, our systems are experiencing critical failures.
              All backup power systems have failed to respond.
            </span>
            <span className="text-gray-400 text-xs block">
              Posted by{' '}
              <span className="text-blue-400 font-medium">robvedx</span>
              {' '}(System Admin) • {new Date().toLocaleTimeString()}
            </span>
            <span className="text-red-400/80 text-xs block">
              Awaiting confirmation from data center. All systems currently offline.
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function GoodbyePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { width, height } = useWindowSize();
  const router = useRouter();

  useEffect(() => {
    const cycleScreens = () => {
      // Show loading screen for 15 seconds
      const loadingTimer = setTimeout(() => {
        if (retryCount === 2) { // On third attempt
          setIsConnected(true);
          // Redirect to login after showing "Connected" message
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setIsLoading(false);
          
          // Show 403 screen for 20 seconds
          const errorTimer = setTimeout(() => {
            setIsLoading(true);
            setRetryCount(prev => prev + 1);
          }, 20000);

          return () => clearTimeout(errorTimer);
        }
      }, 15000);

      return () => clearTimeout(loadingTimer);
    };

    const cleanup = cycleScreens();
    return () => cleanup();
  }, [retryCount, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Loading Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 text-center"
        >
          {/* Logo */}
          <motion.div
            animate={{
              scale: [0.98, 1.02, 0.98],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <Image
              src={LOGO_URL}
              alt="Seekly Logo"
              width={449}
              height={449}
              className="relative rounded-full"
              priority
              unoptimized
            />
          </motion.div>

          {/* Loading Text */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {isConnected ? (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-green-400 flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected Successfully!
              </motion.span>
            ) : (
              "Reconnecting to Server"
            )}
          </h2>
          
          {/* Loading Animation - Only show if not connected */}
          {!isConnected && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Progress Bar - Only show if not connected */}
          {!isConnected && (
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 15,
                  ease: "linear"
                }}
              />
            </div>
          )}

          {/* Status Text */}
          <p className="text-gray-400 mt-4 text-sm">
            {isConnected ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Redirecting to login page...
              </motion.span>
            ) : (
              "Attempting to restore connection..."
            )}
          </p>
        </motion.div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            initial={{
              x: Math.random() * width,
              y: Math.random() * height,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Add retry count if not first attempt and not connected */}
        {retryCount > 0 && !isConnected && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-gray-400">
            Retry Attempt: {retryCount}
          </div>
        )}
      </div>
    );
  }

  // Return the original 403 error page after loading
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Add the announcement bar */}
      <AnnouncementBar />

      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Main gradient orbs */}
        <motion.div 
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div 
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute w-[500px] h-[500px] -bottom-32 -right-32 bg-gradient-to-l from-orange-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        
        {/* Additional animated orbs */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-${Math.floor(Math.random() * 32) + 16}px h-${Math.floor(Math.random() * 32) + 16}px 
                       bg-gradient-to-r ${i % 2 === 0 ? 'from-purple-500/10 to-blue-500/10' : 'from-red-500/10 to-orange-500/10'} 
                       rounded-full blur-xl`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `scale(${0.5 + Math.random()})`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Additional subtle effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent animate-pulse" />
        <motion.div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_80%)]"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Animated grid pattern */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Shooting stars effect */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: '-5px',
            }}
            animate={{
              x: ['0vw', '100vw'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-lg mx-auto p-6 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="relative w-32 h-32 mx-auto mb-8"
        >
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <Image
            src={LOGO_URL}
            alt="Seekly Logo"
            width={449}
            height={449}
            className="relative rounded-full"
            priority
            unoptimized
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Status Code */}
          <div className="text-9xl font-bold text-red-500/20">403</div>

          {/* Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">
              Service Unavailable
            </h1>
            <p className="text-xl text-gray-400">
              This service is currently not available
            </p>
          </div>

          {/* Details Card */}
          <motion.div 
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-red-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-red-400 font-medium">System Status: Offline</p>
              </div>
              <p className="text-gray-400 text-sm">
                Our services are temporarily unavailable. We apologize for any inconvenience.
              </p>
            </div>
          </motion.div>

          {/* Technical Details */}
          <div className="text-left bg-white/5 backdrop-blur-xl rounded-xl p-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Technical Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Error Code:</span>
                <span className="text-gray-300">HTTP 403</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="text-red-400">Service Unavailable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span className="text-gray-300">{new Date().toUTCString()}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-sm text-gray-400">
            <p>
              For assistance, please contact{' '}
              <a href="mailto:support@seekly.com" className="text-blue-400 hover:text-blue-300">
                support@seekly.com
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Particles - Error themed */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-red-500/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
} 