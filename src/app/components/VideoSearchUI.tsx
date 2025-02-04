import { useState } from 'react';
import { useTheme } from 'next-themes';

interface VideoSearchResult {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

export default function VideoSearchUI() {
  const [isYouTubeMode, setIsYouTubeMode] = useState(false);
  const [searchResults, setSearchResults] = useState<VideoSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setTheme } = useTheme();

  const toggleYouTubeMode = () => {
    setIsYouTubeMode(!isYouTubeMode);
    // Switch to YouTube colors
    setTheme(isYouTubeMode ? 'default' : 'youtube');
  };

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.items);
    } catch (error) {
      console.error('Error searching videos:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className={`p-4 ${isYouTubeMode ? 'bg-[#282828] text-white' : 'bg-white'}`}>
      <button
        onClick={toggleYouTubeMode}
        className={`mb-4 px-4 py-2 rounded-lg ${
          isYouTubeMode 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isYouTubeMode ? 'Switch to Default' : 'Switch to YouTube Mode'}
      </button>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search videos..."
          className="flex-1 px-4 py-2 rounded-lg border text-black"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isLoading && <div className="text-center">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((video) => (
          <div 
            key={video.id} 
            className={`p-4 rounded-lg ${
              isYouTubeMode ? 'bg-[#383838]' : 'bg-gray-100'
            }`}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full rounded-lg mb-2"
            />
            <h3 className="font-semibold">{video.title}</h3>
            <p className="text-sm text-gray-500">{video.duration}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Podcast Outline
        </button>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          YouTube Video Research
        </button>
        <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Short Form Hook Ideas
        </button>
        <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Newsletter Draft
        </button>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => window.open('https://www.youtube.com', '_blank')}
          className={`px-6 py-3 rounded-full font-medium ${
            isYouTubeMode 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors duration-200 shadow-lg`}
        >
          Open YouTube Analytics
        </button>
      </div>
    </div>
  );
} 