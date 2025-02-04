'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingAnimation } from '../components/LoadingAnimation'
import Home from '../Homechat'

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log('ChatPage: No user found, redirecting to login...')
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingAnimation message="Loading..." />
  }

  if (!user) {
    return null
  }

  return <Home />;
} 