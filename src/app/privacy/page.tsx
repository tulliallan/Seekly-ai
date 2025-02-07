'use client';

import { motion } from 'framer-motion';
import { FiDatabase, FiEye, FiKey, FiShare2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { StatusBar } from '../components/StatusBar';
import Link from 'next/link';

const sections = [
  {
    icon: <FiDatabase className="w-6 h-6" />,
    title: "Data Collection",
    content: "We collect only essential information needed to provide our services, including email, usage data, and preferences."
  },
  {
    icon: <FiEye className="w-6 h-6" />,
    title: "Data Usage",
    content: "Your data is used to personalize your experience, improve our services, and maintain account security."
  },
  {
    icon: <FiKey className="w-6 h-6" />,
    title: "Data Security",
    content: "We employ industry-standard encryption and security measures to protect your personal information."
  },
  {
    icon: <FiShare2 className="w-6 h-6" />,
    title: "Data Sharing",
    content: "We never sell your personal data. Sharing occurs only with your explicit consent or as required by law."
  },
  {
    icon: <FiTrash2 className="w-6 h-6" />,
    title: "Data Deletion",
    content: "You can request complete deletion of your data at any time through your account settings."
  },
  {
    icon: <FiRefreshCw className="w-6 h-6" />,
    title: "Updates",
    content: "We regularly update our privacy practices and will notify you of any significant changes."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-8">
      <StatusBar />
      <AnimatedBackground />
      
      {/* Enhanced background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_20%,#818cf8,transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_0%_80%,#6366f1,transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#080808_1px,transparent_1px),linear-gradient(to_bottom,#080808_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="bg-blue-500/20 rounded-full p-4"
            >
              <FiKey className="w-8 h-8 text-blue-400" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy is our priority. Learn how we protect and manage your data.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {sections.map((section, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/20 hover:border-white/40 transition-colors">
                <motion.div
                  variants={floatingVariants}
                  initial="initial"
                  animate="animate"
                  className="flex justify-center mb-6"
                >
                  <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                    {section.icon}
                  </div>
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {section.title}
                </h3>
                <p className="text-gray-300">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating particles */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 100 - 50, 0],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-8 rounded-xl border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-4">
              Questions About Your Privacy?
            </h3>
            <p className="text-gray-300 mb-6">
              If you have any questions about our privacy practices or would like to exercise your data rights, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                Contact Support
              </motion.button>
              <Link href="/terms">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  View Terms of Service
                </motion.button>
              </Link>
            </div>
          </div>

          <p className="text-gray-400 mt-8 max-w-2xl mx-auto">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
} 