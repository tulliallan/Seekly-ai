import { FiUser } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface LogoSectionProps {
  title: string
  subtitle: string
  imageError: boolean
  setImageError: (error: boolean) => void
}

export const LogoSection = ({ title, subtitle, imageError, setImageError }: LogoSectionProps) => {
  const logoUrl = "https://media.discordapp.net/attachments/1324835178111176744/1336016327726465075/Blue_And_Orange_Simple_Modern_Cafe_Coffee_Shop_Chirping_Bird_Logo_1.png?ex=67a245aa&is=67a0f42a&hm=7c2d8b7b3c0d3db0e9e800748c8c25189838fa87e37cc1b7574627564e9fea7d&=&format=webp&quality=lossless&width=449&height=449"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <div className="flex flex-col items-center gap-4 mb-6">
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          {/* Outer glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse" />
          
          {/* Inner ring animation */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full opacity-75 animate-spin-slow" />
          
          {/* Logo container */}
          <div className="relative bg-gray-900/50 p-1 rounded-full backdrop-blur-sm">
            {!imageError ? (
              <motion.img 
                src={logoUrl}
                alt="Logo"
                className="relative h-20 w-20 object-contain rounded-full ring-2 ring-white/20 shadow-lg"
                onError={() => setImageError(true)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <div className="relative h-20 w-20 rounded-full ring-2 ring-white/20 shadow-lg bg-blue-900/50 flex items-center justify-center">
                <FiUser className="w-10 h-10 text-blue-200" />
              </div>
            )}
            
            {/* Sparkles */}
            <div className="absolute -inset-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full animate-sparkle"
                  style={{
                    top: `${50 + 45 * Math.sin(2 * Math.PI * i / 8)}%`,
                    left: `${50 + 45 * Math.cos(2 * Math.PI * i / 8)}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-medium shadow-lg group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full blur-md opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <span className="relative">{title}</span>
        </motion.div>
      </div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-serif text-gray-100 mb-2 tracking-tight"
      >
        {subtitle}
      </motion.h1>
    </motion.div>
  )
} 