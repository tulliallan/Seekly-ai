'use client';

import { motion } from 'framer-motion';
import { FiShield, FiLock, FiUserCheck, FiGlobe, FiClock, FiAlertCircle } from 'react-icons/fi';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { StatusBar } from '../components/StatusBar';
import Link from 'next/link';

const sections = [
  {
    icon: <FiShield className="w-6 h-6" />,
    title: "Privacy & Security",
    content: "We take your privacy seriously. Your data is encrypted and securely stored using industry-standard protocols."
  },
  {
    icon: <FiLock className="w-6 h-6" />,
    title: "Data Protection",
    content: "Your personal information is protected under strict data protection laws and regulations."
  },
  {
    icon: <FiUserCheck className="w-6 h-6" />,
    title: "User Rights",
    content: "You maintain full control over your data with rights to access, modify, or delete your information."
  },
  {
    icon: <FiGlobe className="w-6 h-6" />,
    title: "Service Usage",
    content: "Our services are provided 'as is' with continuous improvements and updates to enhance your experience."
  },
  {
    icon: <FiClock className="w-6 h-6" />,
    title: "Term Duration",
    content: "These terms remain in effect throughout your use of our services and can be updated with notice."
  },
  {
    icon: <FiAlertCircle className="w-6 h-6" />,
    title: "Compliance",
    content: "Users must comply with all applicable laws and our community guidelines."
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

export default function TermsPage() {
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using our services
          </p>
        </motion.div>

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

        {/* Bottom section with additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 max-w-2xl mx-auto">
            By using our services, you agree to these terms. We reserve the right to update these terms at any time. 
            Please check back regularly for updates.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Accept Terms
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 