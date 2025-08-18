"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { showToast, toastMessages } from '@/lib/toast';

const TestToastPage: React.FC = () => {
  const testToasts = () => {
    // Test different toast types
    showToast.success('This is a success message with professional green styling!');
    
    setTimeout(() => {
      showToast.error('This is an error message with professional red styling!');
    }, 1000);
    
    setTimeout(() => {
      showToast.warning('This is a warning message with professional orange styling!');
    }, 2000);
    
    setTimeout(() => {
      showToast.info('This is an info message with professional blue styling!');
    }, 3000);
  };

  const testAuthMessages = () => {
    showToast.success(toastMessages.auth.signInSuccess);
    
    setTimeout(() => {
      showToast.error(toastMessages.auth.invalidCredentials);
    }, 1000);
    
    setTimeout(() => {
      showToast.warning(toastMessages.billing.directDebitSetupPending);
    }, 2000);
    
    setTimeout(() => {
      showToast.info(toastMessages.auth.passwordResetSent);
    }, 3000);
  };

  const testPromiseToast = () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Operation completed successfully!');
        } else {
          reject(new Error('Operation failed!'));
        }
      }, 2000);
    });

    showToast.promise(promise, {
      loading: 'Processing your request...',
      success: 'Request completed successfully!',
      error: 'Request failed. Please try again.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/logo.webp" 
              alt="SiteWorks Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Toast Test Page
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Test the new professional toast system
          </p>
        </div>

        {/* Test Buttons */}
        <div className="bg-white py-8 px-6 shadow rounded-lg space-y-4">
          <Button
            onClick={testToasts}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Test Basic Toasts
          </Button>
          
          <Button
            onClick={testAuthMessages}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Test Auth Messages
          </Button>
          
          <Button
            onClick={testPromiseToast}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Test Promise Toast
          </Button>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Toast Colors:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Success - Green (#10b981)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Error - Red (#ef4444)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                <span>Warning - Orange (#f59e0b)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Info - Blue (#3b82f6)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestToastPage;

