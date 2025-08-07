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
            <Skeleton className="h-16 w-16 rounded-lg" />
          </div>

          {/* Navigation Skeleton */}
          <div className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3 px-3 py-2 rounded-md">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </nav>
          </div>

          {/* User Profile Skeleton */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center space-x-2 mb-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Skeleton */}
        <header className="bg-card shadow-sm border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
            <div className="flex items-center">
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
        </header>

        {/* Page Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {/* Welcome Banner Skeleton */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-64 bg-white/20" />
                      <Skeleton className="h-4 w-96 bg-white/20" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Skeleton className="h-8 w-8 mx-auto mb-2 bg-white/20" />
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-3 w-12 bg-white/20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overview Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Monthly Performance */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chart Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Transaction Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}; 