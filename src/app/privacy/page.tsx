'use client';

import { AnimatedBackground } from '../components/AnimatedBackground';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-gray-900">
      <AnimatedBackground />
      
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
          <nav className="flex items-center justify-between mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              ← Back to Home
            </Link>
            <Link
              href="/terms"
              className="text-blue-400 hover:text-blue-300"
            >
              Terms of Service →
            </Link>
          </nav>

          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-xl text-white">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Email address</li>
                  <li>Name (if provided)</li>
                  <li>Profile information</li>
                  <li>Authentication data</li>
                </ul>

                <h3 className="text-xl text-white">Usage Data</h3>
                <ul className="list-disc pl-6 text-gray-300 space-y-2">
                  <li>Search queries and interactions</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To communicate with you</li>
                <li>To ensure security and prevent fraud</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Add more sections as needed */}
          </div>
        </div>
      </div>
    </div>
  );
} 