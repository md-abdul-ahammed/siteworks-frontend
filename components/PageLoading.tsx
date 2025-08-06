import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const PageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}; 