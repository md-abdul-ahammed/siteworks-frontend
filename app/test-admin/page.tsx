'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function TestAdminPage() {
  const { user, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Authentication Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">User Info:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Status:</h2>
          <div className="space-y-2">
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>User exists: {user ? 'Yes' : 'No'}</div>
            <div>User role: {user?.role || 'None'}</div>
            <div>Is admin: {user?.role === 'admin' ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Actions:</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Admin Users
            </button>
            <button 
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to Admin Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 