'use client'

import { motion } from 'framer-motion'
import { FiCheck } from 'react-icons/fi'
import Link from 'next/link'
import { AnimatedBackground } from '@/app/components/AnimatedBackground'

export default function VerifySuccessPage() {
  return (
    <div className="relative min-h-screen bg-transparent text-gray-100">
      <AnimatedBackground />
      
      {/* Custom background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative h-16 w-16 rounded-full ring-2 ring-green-500/50 shadow-lg bg-green-900/50 flex items-center justify-center">
                  <FiCheck className="w-8 h-8 text-green-200" />
                </div>
              </div>
              <div className="relative inline-block px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full text-sm font-medium shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-full blur-md opacity-50" />
                <span className="relative">Email Verified</span>
              </div>
            </div>
            <h1 className="text-4xl font-serif text-gray-100 mb-2 tracking-tight">
              Verification Complete
            </h1>
            <p className="text-gray-400">Your email has been successfully verified</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-xl border border-white/20"
          >
            <div className="space-y-6">
              <p className="text-center text-gray-300">
                You can now sign in to your account and start using our services.
              </p>

              <Link
                href="/login"
                className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-center relative overflow-hidden group"
              >
                <span className="relative z-10">Continue to Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
    </div>
  )
} 