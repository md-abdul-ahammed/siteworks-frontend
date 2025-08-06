'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, signIn, logout } = useAuth();

  const handleTestSignIn = async () => {
    try {
      console.log('🧪 Testing sign in...');
      await signIn('test@example.com', 'TestPass123!');
    } catch (error) {
      console.error('Test sign in failed:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      console.log('🧪 Testing logout...');
      await logout();
    } catch (error) {
      console.error('Test logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Current State:</h3>
              <div className="mt-2 space-y-2">
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button onClick={handleTestSignIn} disabled={isLoading}>
                Test Sign In
              </Button>
              <Button onClick={handleTestLogout} disabled={isLoading}>
                Test Logout
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium">Instructions:</h3>
              <ol className="mt-2 list-decimal list-inside space-y-1">
                <li>Open browser console (F12)</li>
                <li>Click "Test Sign In"</li>
                <li>Watch the console logs</li>
                <li>Check if you get redirected to dashboard</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAuthPage; 