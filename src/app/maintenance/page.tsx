'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/AnimatedBackground';

const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a5916a&is=67a43fea&hm=a48aac974fcd2fcd4a3f31de0bb23f6d1156a9c07ba6f11b10b17ef32c1fdbbd&=&format=webp&quality=lossless&width=449&height=449";

export default function MaintenanceScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Moving Grid Background */}
      <motion.div 
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"
        style={{
          backgroundSize: '30px 30px',
          opacity: 0.5,
        }}
        animate={{
          y: [0, -30],
          x: [0, -30]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear"
        }}
      />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-[60%] right-[20%] w-[400px] h-[400px] bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute bottom-[20%] left-[30%] w-[600px] h-[600px] bg-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center space-y-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div 
            className="relative group"
            animate={{ 
              scale: [1, 1.02, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Logo Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-orange-500/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
            
            {/* Main Logo */}
            <div className="relative">
              <Image 
                src={logoUrl}
                alt="Seekly Logo" 
                width={180}
                height={180}
                className="rounded-full ring-2 ring-white/20 shadow-lg transform group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Animated Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  initial={{
                    scale: 0,
                    opacity: 0,
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Maintenance Message */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text mb-4">
            We'll be back soon!
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            We're making Seekly even better for you.
          </p>
          
          {/* Progress Animation */}
          <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-2 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="text-gray-400 space-y-2">
            <p>Expected completion: A few minutes</p>
            <p className="text-sm">Thank you for your patience!</p>
          </div>
        </motion.div>

        {/* Status Updates */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Status Updates</h2>
          <div className="space-y-3">
            {[
              { color: 'yellow', text: 'Upgrading AI systems...' },
              { color: 'blue', text: 'Optimizing search performance...' },
              { color: 'green', text: 'Rolling out new features...' },
              { color: 'purple', text: 'Fine-tuning response quality...' }
            ].map((status, index) => (
              <motion.div 
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <div className={`w-2 h-2 bg-${status.color}-500 rounded-full animate-pulse`} />
                <span className="text-gray-300">{status.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Particles with Improved Animation */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/10 rounded-full"
          initial={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
          }}
          animate={{
            y: [0, -1000],
            x: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: -Math.random() * 20,
          }}
        />
      ))}
    </div>
  );
} 