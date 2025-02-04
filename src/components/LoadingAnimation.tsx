interface LoadingAnimationProps {
  message: string; // Make it required since we want to enforce good UX
}

export function LoadingAnimation({ message }: LoadingAnimationProps) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/80 animate-pulse">{message}</p>
      </div>
    </div>
  );
} 