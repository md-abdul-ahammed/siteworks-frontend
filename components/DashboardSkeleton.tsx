import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex dashboard-dark">
      {/* Sidebar Skeleton */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar shadow-lg lg:relative lg:translate-x-0 lg:h-screen">
        <div className="flex flex-col h-full">
          {/* Logo Skeleton */}
          <div className="flex items-center justify-center p-4 border-b border-border">
            <Skeleton className="h-16 w-16 rounded-lg animate-pulse" />
          </div>

          {/* Navigation Skeleton */}
          <div className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3 px-3 py-2 rounded-md">
                  <Skeleton className="h-4 w-4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <Skeleton className="h-4 w-20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                </div>
              ))}
            </nav>
          </div>

          {/* User Profile Skeleton */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center space-x-2 mb-3">
              <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24 animate-pulse" />
                <Skeleton className="h-3 w-32 animate-pulse" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Skeleton */}
        <header className="bg-card shadow-sm border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14 sm:py-0 lg:py-[31px]">
            <div className="flex items-center">
              <Skeleton className="h-5 w-24 animate-pulse" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-7 w-7 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {/* Welcome Banner Skeleton */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 relative overflow-hidden">
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-white/20 animate-pulse" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-64 bg-white/20 animate-pulse" />
                      <Skeleton className="h-4 w-96 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2 bg-white/20 animate-pulse" />
                    <Skeleton className="h-3 w-16 bg-white/20 animate-pulse" />
                    <Skeleton className="h-3 w-12 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </CardContent>
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
            </Card>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    <Skeleton className="h-6 w-6 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <Skeleton className="h-4 w-32 mb-2 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  <Skeleton className="h-3 w-48 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                </CardContent>
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
              </Card>
            ))}
          </div>

          {/* Overview Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Transaction Overview */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-40 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    <Skeleton className="h-4 w-16 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
            </Card>

            {/* Monthly Performance */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-40 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    <Skeleton className="h-4 w-16 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  </div>
                ))}
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
            </Card>
          </div>

          {/* Chart Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 animate-pulse" />
                    <Skeleton className="h-5 w-32 animate-pulse" />
                  </div>
                  <Skeleton className="h-4 w-20 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center relative overflow-hidden">
                  <Skeleton className="h-32 w-full animate-pulse" />
                  {/* Animated chart bars */}
                  <div className="absolute inset-0 flex items-end justify-center space-x-1 p-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="bg-primary/20 rounded-t-sm animate-pulse"
                        style={{
                          width: '8px',
                          height: `${Math.random() * 60 + 20}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
            </Card>

            {/* Transaction Status */}
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 animate-pulse" />
                  <Skeleton className="h-5 w-32 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center relative overflow-hidden">
                  <Skeleton className="h-32 w-full animate-pulse" />
                  {/* Animated pie chart segments */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/40 animate-spin" style={{ animationDuration: '2s' }} />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-primary/30 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-0 hover:opacity-100 transition-opacity" />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}; 