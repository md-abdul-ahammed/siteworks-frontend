'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';

interface UserOnlyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  useDashboardSkeleton?: boolean;
}

export const UserOnlyRoute: React.FC<UserOnlyRouteProps> = ({ 
  children, 
  fallback,
  useDashboardSkeleton = false
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ UserOnlyRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);
    
    if (!isLoading && !isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to sign-in...');
      router.push('/sign-in');
      return;
    }

    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      console.log('🚫 Admin user trying to access user-only page, redirecting to admin...');
      router.push('/admin');
      return;
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    console.log('⏳ UserOnlyRoute - Loading...');
    // Return null instead of showing any loader
    return null;
  }

  if (!isAuthenticated) {
    console.log('❌ UserOnlyRoute - Not authenticated, showing nothing');
    return null;
  }

  if (user?.role === 'admin') {
    console.log('❌ UserOnlyRoute - Admin user, showing access denied');
    return (
      <ErrorDisplay
        type="access"
        title="Access Denied"
        message="This page is for regular users only. Please use the admin panel."
        variant="fullscreen"
        size="lg"
        showRetry={false}
        actions={
          <Button 
            onClick={() => router.push('/admin')}
            variant="secondary"
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm"
          >
            Go to Admin Panel
          </Button>
        }
      />
    );
  }

  console.log('✅ UserOnlyRoute - Authenticated user, showing children');
  return <>{children}</>;
};
