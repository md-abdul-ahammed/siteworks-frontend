import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const PageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}; 