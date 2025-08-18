'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthState {
  localStorage?: {
    hasTokens: boolean;
    hasUser: boolean;
    tokens: unknown;
    user: unknown;
  };
  authService?: {
    hasCurrentUser: boolean;
    hasAccessToken: boolean;
    isAuthenticated: boolean;
    currentUser: unknown;
    accessToken: string | null;
  };
  context?: {
    user: unknown;
    isAuthenticated: boolean;
  };
  apiTest?: {
    status: number;
    ok: boolean;
    data: unknown;
  } | {
    error: string;
  };
  error?: string;
}

const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAuthState = async () => {
    setLoading(true);
    try {
      // Check localStorage
      const storedTokens = localStorage.getItem('auth_tokens');
      const storedUser = localStorage.getItem('auth_user');
      
      // Check auth service state
      const currentUser = await authService.getCurrentUser();
      const accessToken = authService.getAccessToken();
      const isAuth = authService.isAuthenticated();
      
      setAuthState({
        localStorage: {
          hasTokens: !!storedTokens,
          hasUser: !!storedUser,
          tokens: storedTokens ? JSON.parse(storedTokens) : null,
          user: storedUser ? JSON.parse(storedUser) : null
        },
        authService: {
          hasCurrentUser: !!currentUser,
          hasAccessToken: !!accessToken,
          isAuthenticated: isAuth,
          currentUser,
          accessToken: accessToken ? accessToken.substring(0, 50) + '...' : null
        },
        context: {
          user,
          isAuthenticated
        }
      });
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAuthState({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptionAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/subscription');
      const data = await response.json();
      
      setAuthState((prev: AuthState | null) => ({
        ...prev,
        apiTest: {
          status: response.status,
          ok: response.ok,
          data
        }
      }));
    } catch (error) {
      console.error('Error testing API:', error);
      setAuthState((prev: AuthState | null) => ({
        ...prev,
        apiTest: { error: error instanceof Error ? error.message : 'Unknown error' }
      }));
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
    authService.forceReauthentication();
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkAuthState} disabled={loading}>
            Refresh Auth State
          </Button>
          <Button onClick={testSubscriptionAPI} disabled={loading}>
            Test Subscription API
          </Button>
          <Button onClick={clearAuth} variant="destructive">
            Clear Auth & Redirect
          </Button>
        </div>

        {authState && (
          <Card>
            <CardHeader>
              <CardTitle>Authentication State</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(authState, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestAuthPage; 