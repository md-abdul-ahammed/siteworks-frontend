'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PageLoading } from './PageLoading';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    if (fallback) {
      return <>{fallback}</>;
    }
    return useDashboardSkeleton ? <DashboardSkeleton /> : <PageLoading />;
  }

  if (!isAuthenticated) {
    console.log('❌ UserOnlyRoute - Not authenticated, showing nothing');
    return null;
  }

  if (user?.role === 'admin') {
    console.log('❌ UserOnlyRoute - Admin user, showing access denied');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is for regular users only. Please use the admin panel.</p>
          <Button onClick={() => router.push('/admin')}>
            Go to Admin Panel
          </Button>
        </div>
      </div>
    );
  }

  console.log('✅ UserOnlyRoute - Authenticated user, showing children');
  return <>{children}</>;
};
