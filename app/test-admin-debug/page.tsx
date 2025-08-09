'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAdminDebugPage() {
  const { user, isLoading, signIn } = useAuth();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});
  const [testResult, setTestResult] = useState<string>('');
  const [networkTest, setNetworkTest] = useState<string>('');

  useEffect(() => {
    const info = {
      user,
      isLoading,
      userRole: user?.role,
      isAdmin: user?.role === 'admin',
      timestamp: new Date().toISOString(),
      localStorage: {
        auth_tokens: typeof window !== 'undefined' ? localStorage.getItem('auth_tokens') : null,
        auth_user: typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null,
        token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
        refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
      }
    };
    setDebugInfo(info);
    console.log('🔍 Debug info:', info);
  }, [user, isLoading]);

  const testAdminLogin = async () => {
    try {
      setTestResult('Testing admin login...');
      console.log('🔐 Attempting admin login...');
      await signIn('admin@siteworks.com', 'Admin123!');
      setTestResult('Admin login successful!');
    } catch (error) {
      setTestResult(`Admin login failed: ${error}`);
      console.error('Admin login error:', error);
    }
  };

  const testNetworkConnection = async () => {
    try {
      setNetworkTest('Testing network connection...');
      
             // Test backend connection
       const authTokens = localStorage.getItem('auth_tokens');
       const token = authTokens ? JSON.parse(authTokens).accessToken : null;
       
       const backendResponse = await fetch('http://localhost:8000/api/auth/profile', {
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
       });
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        setNetworkTest(`Backend connection successful: ${JSON.stringify(backendData, null, 2)}`);
      } else {
        const errorData = await backendResponse.json();
        setNetworkTest(`Backend connection failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      setNetworkTest(`Network test error: ${error}`);
      console.error('Network test error:', error);
    }
  };

  const testFrontendAPI = async () => {
    try {
      setNetworkTest('Testing frontend API...');
      
             const authTokens = localStorage.getItem('auth_tokens');
       const token = authTokens ? JSON.parse(authTokens).accessToken : null;
       
       const frontendResponse = await fetch('/api/auth/profile', {
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
       });
      
      if (frontendResponse.ok) {
        const frontendData = await frontendResponse.json();
        setNetworkTest(`Frontend API successful: ${JSON.stringify(frontendData, null, 2)}`);
      } else {
        const errorData = await frontendResponse.json();
        setNetworkTest(`Frontend API failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      setNetworkTest(`Frontend API error: ${error}`);
      console.error('Frontend API error:', error);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Debug Page</h1>
      
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
              <div>Auth tokens exist: {localStorage.getItem('auth_tokens') ? 'Yes' : 'No'}</div>
              <div>Auth user exists: {localStorage.getItem('auth_user') ? 'Yes' : 'No'}</div>
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
            <Button onClick={testNetworkConnection} className="w-full">
              Test Backend Connection
            </Button>
            <Button onClick={testFrontendAPI} className="w-full">
              Test Frontend API
            </Button>
            <Button onClick={clearStorage} className="w-full" variant="destructive">
              Clear Storage & Reload
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/dashboard'}
              className="w-full"
            >
              Go to Admin Dashboard
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
            <CardTitle>Login Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {testResult}
            </pre>
          </CardContent>
        </Card>
      )}

      {networkTest && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Network Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {networkTest}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
