import { motion } from 'framer-motion'

export const LoadingAnimation = ({ message }: { message: string }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Animated circles */}
          <div className="relative">
            <div className="w-24 h-24">
              {[...Array(3)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 border-4 border-blue-500 rounded-full"
                  initial={{ scale: 1, opacity: 0.25 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.25, 0, 0.25] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
              <motion.div
                className="absolute inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          
          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white text-xl font-medium"
          >
            {message}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 