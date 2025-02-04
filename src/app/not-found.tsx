'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from './components/AnimatedBackground';

export default function NotFound() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState(5);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 25,
        y: (e.clientY - window.innerHeight / 2) / 25,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto redirect countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/');
    }
  }, [countdown, router]);

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <AnimatedBackground />
      
      {/* Enhanced background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px]"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Glitch effect for 404 */}
          <div className="relative mb-8">
            <motion.h1 
              className="text-[150px] font-bold leading-none"
              style={{
                textShadow: `
                  ${mousePosition.x * 0.1}px ${mousePosition.y * 0.1}px 0 rgba(59, 130, 246, 0.5),
                  ${-mousePosition.x * 0.1}px ${-mousePosition.y * 0.1}px 0 rgba(99, 102, 241, 0.5)
                `,
              }}
            >
              404
            </motion.h1>
            <AnimatePresence>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 text-[150px] font-bold leading-none text-blue-500/30"
                  initial={{ x: 0, y: 0 }}
                  animate={{ 
                    x: Math.random() * 10 - 5,
                    y: Math.random() * 10 - 5,
                  }}
                  transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.1,
                  }}
                >
                  404
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.p
            className="text-2xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Oops! Looks like you've ventured into the void
          </motion.p>

          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 group relative overflow-hidden"
            >
              <span className="relative z-10">Take Me Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
            
            <p className="text-gray-400">
              Auto-redirecting in {countdown} seconds...
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
    </div>
  );
} 