import CreditsDisplay from '@/components/CreditsDisplay';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Other navbar items */}
          <CreditsDisplay />
          {/* Other navbar items */}
        </div>
      </div>
    </nav>
  );
} 