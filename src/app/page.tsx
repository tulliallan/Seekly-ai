'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingAnimation } from './components/LoadingAnimation'
import TavilySearch from './components/TavilySearch'
import TokenGatedChat from '@/app/components/TokenGatedChat'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingAnimation message="Loading..." />
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Smart Search
        </h1>
        <TavilySearch />
        <TokenGatedChat />
      </div>
    </main>
  )
} 