'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const LOGO_URL = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a4e8aa&is=67a3972a&hm=3dfaa154a11f5b905e3b2fe344b2a76b886b111bd51884ffbf7000e4fecb4cd5&=&format=webp&quality=lossless&width=449&height=449"

export default function StatusUpdatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[400px] h-[400px] -bottom-32 -right-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <Image
              src={LOGO_URL}
              alt="Seekly Logo"
              width={449}
              height={449}
              className="relative rounded-full"
              priority
              unoptimized
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4"
          >
            <h1 className="text-3xl font-bold text-white">Critical System Status Update</h1>
            <p className="text-gray-400">Posted by robvedx • System Administrator</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-red-500/20 space-y-6"
        >
          <div className="flex items-center gap-2 text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-medium">URGENT: Server Infrastructure Update</span>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300">
              At approximately 22:30 GMT, our primary server infrastructure experienced a catastrophic failure due to unprecedented demand. Despite our best efforts, all backup power systems have failed to respond.
            </p>

            <h3 className="text-white mt-8 mb-4">Current Status:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Main server cluster: <span className="text-red-400">Offline</span></li>
              <li>Backup systems: <span className="text-red-400">Failed to respond</span></li>
              <li>Power systems: <span className="text-red-400">Critical failure</span></li>
              <li>Data center response: <span className="text-yellow-400">Awaiting confirmation</span></li>
            </ul>

            <h3 className="text-white mt-8 mb-4">What We're Doing:</h3>
            <p className="text-gray-300">
              Our team is working around the clock to restore services. We're currently:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Coordinating with data center teams</li>
              <li>Implementing emergency recovery procedures</li>
              <li>Preparing backup infrastructure deployment</li>
            </ul>

            <div className="mt-8 p-4 bg-red-500/10 rounded-lg">
              <p className="text-red-400 font-medium">
                ETA for resolution is currently unknown. We appreciate your patience during this critical situation.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link 
            href="/goodbye"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
          >
            ← Return to status page
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 