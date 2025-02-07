'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoadingAnimation } from '@/app/components/LoadingAnimation'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get the callback parameters
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      // If we don't have the required parameters, redirect to login
      router.push('/login')
      return
    }

    // Handle the authentication callback
    const handleCallback = async () => {
      try {
        // Make a POST request to your API endpoint that handles the OAuth callback
        const response = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        })

        if (!response.ok) {
          throw new Error('Authentication failed')
        }

        // Redirect to the home page or dashboard after successful authentication
        router.push('/')
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    handleCallback()
  }, [router, searchParams])

  // Show loading animation while processing the callback
  return <LoadingAnimation message="Completing authentication..." />
} 