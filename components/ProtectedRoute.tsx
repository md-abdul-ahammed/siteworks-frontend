'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSkeleton } from './DashboardSkeleton';
import { PageLoading } from './PageLoading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  useDashboardSkeleton?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  useDashboardSkeleton = false
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'user:', user);
    
    if (!isLoading && !isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to sign-in...');
      router.push('/sign-in');
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading) {
    console.log('⏳ ProtectedRoute - Loading...');
    if (fallback) {
      return <>{fallback}</>;
    }
    return useDashboardSkeleton ? <DashboardSkeleton /> : <PageLoading />;
  }

  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - Not authenticated, showing nothing');
    return null;
  }

  console.log('✅ ProtectedRoute - Authenticated, showing children');
  return <>{children}</>;
}; 