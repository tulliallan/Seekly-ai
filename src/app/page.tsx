'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingAnimation } from './components/LoadingAnimation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push('/goodbye')
  }, [router])

  return <LoadingAnimation message="Redirecting..." />
} 