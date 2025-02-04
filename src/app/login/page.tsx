'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { motion } from 'framer-motion'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi'
import { LogoSection } from '../components/LogoSection'
import { LoadingAnimation } from '../components/LoadingAnimation'
import { StatusBar } from '../components/StatusBar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { signIn, user } = useAuth()
  const router = useRouter()
  
  const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a245aa&is=67a0f42a&hm=7c2d8b7b3c0d3db0e9e800748c8c25189838fa87e37cc1b7574627564e9fea7d&=&format=webp&quality=lossless&width=449&height=449"

  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to chat...')
      router.push('/chat')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Login error:', error)
        if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (error.message?.includes('Email not confirmed')) {
          setError('Please verify your email address')
        } else {
          setError(error.message || 'Failed to sign in')
        }
        setIsLoading(false)
        return
      }

      // Let the useEffect handle the redirect
      console.log('Login successful')
      
    } catch (error: any) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      <StatusBar />
      <AnimatedBackground />
      
      {/* Custom background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-md px-8">
          <LogoSection
            title="Welcome Back"
            subtitle="Sign in to your account"
            imageError={imageError}
            setImageError={setImageError}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="backdrop-blur-xl bg-white/10 p-8 rounded-2xl shadow-xl border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-center bg-red-500/10 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-white/10 p-3 pl-10 text-white border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-white/10 p-3 pl-10 pr-10 text-white border border-white/10 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link 
                    href="/forgot-password"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500/50"
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{' '}
                  <Link 
                    href="/terms" 
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <LoadingAnimation />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </form>

            <div className="mt-6">
              <SocialLoginButtons />
            </div>

            <p className="mt-6 text-center text-gray-400">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
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