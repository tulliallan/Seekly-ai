'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift, FiArrowRight } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface Update {
  id: string;
  version: string;
  title: string;
  description: string[];
  date: string;
}

export function UpdateLog() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewUpdateIntro, setShowNewUpdateIntro] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState<Update | null>(null);

  useEffect(() => {
    const checkForNewUpdate = async () => {
      // Get the last seen update from localStorage
      const lastSeenUpdate = localStorage.getItem('lastSeenUpdate');
      
      // Fetch the latest update
      const { data: latestUpdate } = await supabase
        .from('updates')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (latestUpdate && latestUpdate.id !== lastSeenUpdate) {
        setCurrentUpdate(latestUpdate);
        setShowNewUpdateIntro(true);
      }
    };

    checkForNewUpdate();
  }, []);

  const handleCloseUpdate = () => {
    if (currentUpdate) {
      localStorage.setItem('lastSeenUpdate', currentUpdate.id);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm rounded-full transition-colors flex items-center gap-2"
      >
        <FiGift className="w-4 h-4" />
        <span>What's New</span>
      </button>

      <AnimatePresence>
        {showNewUpdateIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <FiGift className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  New Update Available!
                </h2>
                <p className="text-gray-400">
                  Version {currentUpdate?.version}
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => {
                  setShowNewUpdateIntro(false);
                  setIsOpen(true);
                }}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <span>See What's New</span>
                <FiArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-gray-900 rounded-xl border border-white/10 shadow-xl overflow-hidden"
            >
              <div className="relative">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-50" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                
                {/* Content */}
                <div className="relative p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FiGift className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">
                          What's New
                        </h2>
                        <p className="text-sm text-gray-400">
                          Version {currentUpdate?.version}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseUpdate}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="relative p-6 space-y-6">
                  <div className="space-y-4">
                    {currentUpdate?.description.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
                        <p className="text-gray-300">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 