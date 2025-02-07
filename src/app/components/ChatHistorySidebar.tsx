import { motion } from 'framer-motion';
import { FiClock, FiYoutube, FiSearch, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface ChatHistory {
  id: string;
  query: string;
  timestamp: string;
  type: 'youtube' | 'search';
  youtubeResults?: any[];
  searchResults?: any[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chatHistory: ChatHistory[];
  onChatSelect: (chat: ChatHistory) => void;
  currentChatId?: string;
}

export function ChatHistorySidebar({ isOpen, onClose, chatHistory, onChatSelect, currentChatId }: Props) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-16 bottom-0 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 z-40"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">Chat History</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-9rem)]">
        {chatHistory.map((chat) => (
          <motion.button
            key={chat.id}
            onClick={() => onChatSelect(chat)}
            className={`w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 ${
              currentChatId === chat.id ? 'bg-white/10' : ''
            }`}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                chat.type === 'youtube' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                {chat.type === 'youtube' ? (
                  <FiYoutube className="w-4 h-4 text-red-400" />
                ) : (
                  <FiSearch className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{chat.query}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gray-900/95">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm text-white flex items-center justify-center gap-2"
        >
          <FiClock className="w-4 h-4" />
          Close History
        </button>
      </div>
    </motion.div>
  );
} 