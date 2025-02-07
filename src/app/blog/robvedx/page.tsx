'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const LOGO_URL = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a4e8aa&is=67a3972a&hm=3dfaa154a11f5b905e3b2fe344b2a76b886b111bd51884ffbf7000e4fecb4cd5&=&format=webp&quality=lossless&width=449&height=449"

export default function RobvedxBlogPost() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[400px] h-[400px] -bottom-32 -right-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        {/* Author Info */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">robvedx</h2>
            <p className="text-gray-400">Co-Developer @ Seekly</p>
          </div>
        </motion.div>

        {/* Blog Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-blue-500/20 space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">A Personal Note About Today's Events</h1>
            <p className="text-gray-400">Published on February 16, 2024</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-gray-300">
              Hey everyone, robvedx here. I wanted to take a moment to personally address what's happening with our servers right now.
            </p>

            <p className="text-gray-300">
              First off, I want to acknowledge the incredible support we've received from our community. The unprecedented demand that led to our current situation is both humbling and, honestly, a bit overwhelming. We never expected to scale this quickly.
            </p>

            <div className="bg-blue-500/10 rounded-lg p-6 my-8">
              <p className="text-blue-400 font-medium">
                "Sometimes the best learning moments come from our biggest challenges. Today is one of those days."
              </p>
            </div>

            <h3 className="text-white text-xl font-semibold mt-8">What Actually Happened</h3>
            <p className="text-gray-300">
              At around 22:30 GMT, we experienced what I can only describe as a "perfect storm" of events:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Our main server cluster hit 99.9% capacity</li>
              <li>The auto-scaling system failed to respond in time</li>
              <li>Backup power systems experienced a critical malfunction</li>
              <li>Our redundancy measures were overwhelmed</li>
            </ul>

            <h3 className="text-white text-xl font-semibold mt-8">The Real Impact</h3>
            <p className="text-gray-300">
              I know this isn't just about servers and systems - it's about the people who rely on our service. Whether you're using Seekly for work, research, or personal projects, this downtime affects real people and real tasks.
            </p>

            <h3 className="text-white text-xl font-semibold mt-8">Moving Forward</h3>
            <p className="text-gray-300">
              While our ops team is working on immediate recovery, I'm already drafting plans for a complete infrastructure overhaul. This isn't just about fixing what broke - it's about building something better.
            </p>

            <div className="bg-white/5 rounded-lg p-6 my-8">
              <h4 className="text-white font-medium mb-4">Immediate Action Plan:</h4>
              <ul className="list-disc pl-6 text-gray-300 space-y-2">
                <li>Complete infrastructure audit</li>
                <li>Implementing new failover systems</li>
                <li>Upgrading our monitoring stack</li>
                <li>Adding redundant power management</li>
              </ul>
            </div>

            <p className="text-gray-300">
              I'll be personally overseeing these improvements, and I promise to maintain full transparency throughout this process. Expect regular updates from me on our progress.
            </p>

            <div className="border-t border-white/10 mt-8 pt-8">
              <p className="text-gray-400">
                Stay strong, stay patient, and thank you for being part of this journey.
              </p>
              <p className="text-gray-400 mt-4">
                - robvedx
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-between items-center"
        >
          <Link 
            href="/status-update"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            ← View System Status
          </Link>
          <Link 
            href="/goodbye"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            Return to main page →
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 