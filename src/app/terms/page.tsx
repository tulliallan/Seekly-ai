'use client';

import { AnimatedBackground } from '../components/AnimatedBackground';
import Link from 'next/link';

export default function TermsPage() {
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
              href="/privacy"
              className="text-blue-400 hover:text-blue-300"
            >
              Privacy Policy →
            </Link>
          </nav>

          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using Seekly ("the Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">2. Description of Service</h2>
              <p className="text-gray-300">
                Seekly is an AI-powered search and analysis platform that provides users with intelligent responses to queries using various data sources and AI models.
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Search functionality using multiple data sources</li>
                <li>AI-powered analysis and response generation</li>
                <li>User account management and customization</li>
                <li>Content saving and sharing capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">3. User Accounts</h2>
              <p className="text-gray-300">
                To access certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">4. Acceptable Use</h2>
              <p className="text-gray-300">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Use the Service for any illegal purposes</li>
                <li>Submit content that violates intellectual property rights</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service to distribute malware or harmful code</li>
                <li>Engage in activities that disrupt the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">5. Data Usage and Privacy</h2>
              <p className="text-gray-300">
                Your use of the Service is also governed by our <Link href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>. By using the Service, you consent to our collection and use of data as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">6. Intellectual Property</h2>
              <p className="text-gray-300">
                All content and materials available through the Service are protected by intellectual property rights. You may not use, reproduce, or distribute such content without proper authorization.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">7. Termination</h2>
              <p className="text-gray-300">
                We reserve the right to suspend or terminate your access to the Service:
              </p>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>For violations of these terms</li>
                <li>For abusive or harmful behavior</li>
                <li>At our sole discretion</li>
                <li>Without prior notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">8. Changes to Terms</h2>
              <p className="text-gray-300">
                We may modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white">9. Contact Information</h2>
              <p className="text-gray-300">
                For questions about these terms or the Service, please contact:
              </p>
              <ul className="list-none pl-6 text-gray-300 space-y-2">
                <li>Email: support@seekly.com</li>
                <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
              </ul>
            </section>

            <div className="border-t border-white/10 pt-8 mt-8">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 