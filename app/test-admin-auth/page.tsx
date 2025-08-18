'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAdminAuthPage() {
  const { user, isLoading, signIn } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    const info = {
      user,
      isLoading,
      userRole: user?.role,
      isAdmin: user?.role === 'admin',
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
    console.log('🔍 Debug info:', info);
  }, [user, isLoading]);

  const testAdminLogin = async () => {
    try {
      setTestResult('Testing admin login...');
      await signIn('admin@siteworks.com', 'Admin123!');
      setTestResult('Admin login successful!');
    } catch (error) {
      setTestResult(`Admin login failed: ${error}`);
      console.error('Admin login error:', error);
    }
  };

  const testUsersAccess = async () => {
    try {
      setTestResult('Testing users access...');
                   const authTokens = localStorage.getItem('auth_tokens');
             const token = authTokens ? JSON.parse(authTokens).accessToken : null;
             
             const response = await fetch('/api/admin/users', {
               headers: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json',
               },
             });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`Users access successful! Data: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorData = await response.json();
        setTestResult(`Users access failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      setTestResult(`Users access error: ${error}`);
      console.error('Users access error:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Authentication Debug</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>User exists: {user ? 'Yes' : 'No'}</div>
              <div>User role: {user?.role || 'None'}</div>
              <div>Is admin: {user?.role === 'admin' ? 'Yes' : 'No'}</div>
              <div>Email: {user?.email || 'None'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testAdminLogin} className="w-full">
              Test Admin Login
            </Button>
            <Button onClick={testUsersAccess} className="w-full">
              Test Users Access
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/users'}
              className="w-full"
            >
              Go to Admin Users
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {testResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {testResult}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
