import { useState } from 'react';
import { Search, Image, Link as LinkIcon, History, Loader2, ExternalLink, Calendar, Globe, BookOpen, Share2, Bookmark, ThumbsUp, Filter, Clock, Tag, ChevronDown } from 'lucide-react';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  image_url?: string;
  published_date?: string;
  score?: number;
  domain?: string;
  snippet?: string;
  category?: string;
  readingTime?: number;
  relevanceScore?: number;
  tags?: string[];
}

export default function TavilySearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<SearchResult | null>(null);
  const [bookmarks, setBookmarks] = useState<SearchResult[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/tavily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          includeImages: true,
          includeImageDescriptions: true,
          search_depth: 'advanced'
        }),
      });
      
      const data = await response.json();
      setResults(data.results || []);
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (result: SearchResult) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.url === result.url);
      if (exists) {
        return prev.filter(b => b.url !== result.url);
      }
      return [...prev, result];
    });
  };

  const SourceDetails = ({ source }: { source: SearchResult }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{source.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {source.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {source.category}
                </span>
              )}
              {source.readingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{source.readingTime} min read</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark(source)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Bookmark"
            >
              <Bookmark className={`h-5 w-5 ${bookmarks.some(b => b.url === source.url) ? 'fill-current text-blue-600' : ''}`} />
            </button>
            <button
              onClick={() => {
                navigator.share?.({
                  title: source.title,
                  url: source.url
                }).catch(console.error);
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectedSource(null)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {source.image_url && (
          <div className="relative">
            <img 
              src={source.image_url} 
              alt={source.title}
              className="w-full h-80 object-cover rounded-lg mb-4"
            />
            {source.relevanceScore && (
              <div className="absolute top-4 right-4 px-3 py-1 bg-black bg-opacity-75 text-white rounded-full text-sm">
                {Math.round(source.relevanceScore * 100)}% relevant
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {new URL(source.url).hostname}
              </a>
            </div>

            {source.published_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(source.published_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            )}
          </div>

          {source.tags && source.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {source.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{source.content}</p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Source
              </a>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <ThumbsUp className="h-4 w-4" />
                Helpful
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FilterControls = () => (
    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center gap-2 text-gray-700 mb-4"
      >
        <Filter className="h-4 w-4" />
        <span>Filters & Sort</span>
        <ChevronDown className={`h-4 w-4 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
      </button>

      {isFilterOpen && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
              className="w-full p-2 border rounded-md"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="news">News</option>
              <option value="blog">Blog</option>
              <option value="academic">Academic</option>
              <option value="social">Social Media</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search anything..."
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-4 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>

        {searchHistory.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 overflow-x-auto pb-2">
            <History className="h-4 w-4 flex-shrink-0" />
            <span className="flex-shrink-0">Recent:</span>
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(item);
                  handleSearch();
                }}
                className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <FilterControls />
      
      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {result.image_url && (
                  <img
                    src={result.image_url}
                    alt={result.title}
                    className="w-32 h-32 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    <button
                      onClick={() => setSelectedSource(result)}
                      className="text-blue-600 hover:text-blue-800 text-left"
                    >
                      {result.title}
                    </button>
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{result.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {new URL(result.url).hostname}
                      </a>
                    </div>
                    {result.published_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(result.published_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedSource(result)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <BookOpen className="h-4 w-4" />
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSource && <SourceDetails source={selectedSource} />}
    </div>
  );
} 