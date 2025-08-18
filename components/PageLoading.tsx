import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';

interface PageLoadingProps {
  message?: string;
  showCard?: boolean;
}

export const PageLoading = ({ 
  message = "Loading your dashboard...", 
  showCard = true 
}: PageLoadingProps) => {
  const content = (
    <div className="text-center space-y-4">
      <div className="relative">
        <LoadingSpinner 
          size="lg" 
          className="mb-4"
        />
        {/* Animated background circles */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-32 h-32 border-2 border-white/20 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white animate-pulse">
          {message}
        </h2>
        <p className="text-sm text-gray-300">
          Please wait while we prepare everything for you...
        </p>
      </div>
      
      {/* Animated progress dots */}
      <div className="flex justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );

  if (showCard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <Card className="w-full max-w-md bg-gray-900/50 backdrop-blur-sm border-gray-700/50">
          <CardContent className="p-8">
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      {content}
    </div>
  );
}; 