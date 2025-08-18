import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ContentLoaderProps {
  type?: 'list' | 'grid' | 'table' | 'chart' | 'form' | 'card'
  items?: number
  className?: string
  showSpinner?: boolean
  message?: string
}

export const ContentLoader = ({ 
  type = 'list', 
  items = 3, 
  className,
  showSpinner = false,
  message
}: ContentLoaderProps) => {
  const renderListLoader = () => (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
          <Skeleton className="h-10 w-10 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            <Skeleton className="h-3 w-1/2 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          </div>
          <Skeleton className="h-8 w-20 rounded-md animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
    </div>
  );

  const renderGridLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            <Skeleton className="h-4 w-3/4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
        </Card>
      ))}
    </div>
  );

  const renderTableLoader = () => (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3 bg-card rounded-lg border border-border">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-20 animate-pulse" style={{ animationDelay: `${(i + j) * 0.1}s` }} />
          ))}
        </div>
      ))}
    </div>
  );

  const renderChartLoader = () => (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 animate-pulse" />
          <Skeleton className="h-4 w-20 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center relative overflow-hidden">
          <Skeleton className="h-48 w-full animate-pulse" />
          {/* Animated chart elements */}
          <div className="absolute inset-0 flex items-end justify-center space-x-2 p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="bg-primary/20 rounded-t-sm animate-pulse"
                style={{
                  width: '12px',
                  height: `${Math.random() * 70 + 30}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
    </Card>
  );

  const renderFormLoader = () => (
    <div className="space-y-6">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          <Skeleton className="h-10 w-full rounded-md animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
        </div>
      ))}
      <div className="flex space-x-3 pt-4">
        <Skeleton className="h-10 w-24 rounded-md animate-pulse" />
        <Skeleton className="h-10 w-24 rounded-md animate-pulse" />
      </div>
    </div>
  );

  const renderCardLoader = () => (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 animate-pulse" />
            <Skeleton className="h-4 w-48 animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            <Skeleton className="h-4 w-16 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          </div>
        ))}
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
    </Card>
  );

  const renderContent = () => {
    switch (type) {
      case 'list':
        return renderListLoader();
      case 'grid':
        return renderGridLoader();
      case 'table':
        return renderTableLoader();
      case 'chart':
        return renderChartLoader();
      case 'form':
        return renderFormLoader();
      case 'card':
        return renderCardLoader();
      default:
        return renderListLoader();
    }
  };

  return (
    <div className={className}>
      {showSpinner && (
        <div className="flex justify-center mb-6">
          <LoadingSpinner size="md" variant="dots" text={message} />
        </div>
      )}
      {renderContent()}
    </div>
  );
};
