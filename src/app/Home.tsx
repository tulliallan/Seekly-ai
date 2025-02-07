'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a245aa&is=67a0f42a&hm=7c2d8b7b3c0d3db0e9e800748c8c25189838fa87e37cc1b7574627564e9fea7d&=&format=webp&quality=lossless&width=449&height=449";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-gray-900/50 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Image 
                  src={logoUrl}
                  alt="Seekly Logo" 
                  className="h-10 w-10 rounded-full ring-2 ring-white/20"
                  width={449}
                  height={449}
                />
                <h1 className="text-2xl font-serif text-white tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">Seek</span>
                  <span className="text-white">ly</span>
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-serif font-medium text-white mb-6">
              Meet <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-transparent bg-clip-text">Seekly</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Your next generation AI research assistant. Safe, accurate, and secure to help you find exactly what you need.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/homechat"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                Try Seekly Now <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Intelligent Search",
                description: "Advanced AI-powered search that understands context and intent."
              },
              {
                title: "Real-time Analysis",
                description: "Get instant insights and analysis from multiple sources."
              },
              {
                title: "Smart Summaries",
                description: "Comprehensive summaries of complex topics in seconds."
              },
              {
                title: "Source Verification",
                description: "All information is verified with reliable sources."
              },
              {
                title: "Customizable Experience",
                description: "Tailor the AI to your specific needs and preferences."
              },
              {
                title: "Secure & Private",
                description: "Your searches and data are always protected."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h2 className="text-3xl font-medium text-white mb-4">
                Ready to experience the future of search?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of users who are already using Seekly to transform their research.
              </p>
              <Link
                href="/homechat"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2 text-lg"
              >
                Get Started Now <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 