"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ForgotPasswordFormData>();

  // Clear errors when form fields change
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && (error || localError)) {
        clearError();
        setLocalError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [error, localError, clearError, watch]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLocalError(null);
      clearError();
      
      await forgotPassword(data.email);
      setIsSubmitted(true);
      reset();
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      
      // Handle specific error cases
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as { code: string; error?: string };
        
        switch (apiError.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = 'Please check your input and try again.';
            break;
          case 'TIMEOUT_ERROR':
            errorMessage = 'Request timeout. Please try again.';
            break;
          default:
            errorMessage = apiError.error || 'An unexpected error occurred. Please try again.';
        }
      }
      
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const getMessageStyles = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const displayError = error || localError;
  const isFormLoading = isLoading;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              {/* SiteWorks Logo */}
              <img 
                src="/logo.webp" 
                alt="SiteWorks Logo" 
                className="h-12 w-auto"
              />
            </div>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We&apos;ve sent a password reset link to your email address
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className={`p-4 rounded-md border ${getMessageStyles('success')}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    If an account with this email exists, a password reset link has been sent.
                  </p>
                  <p className="mt-2 text-sm">
                    Please check your email and follow the instructions to reset your password.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Sign In */}
            <div className="mt-6">
              <Link
                href="/sign-in"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Back to Sign In
              </Link>
            </div>

            {/* Resend Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            {/* SiteWorks Logo */}
            <img 
              src="/logo.webp" 
              alt="SiteWorks Logo" 
              className="h-12 w-auto"
            />
          </div>
          
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
                      <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
        </div>

        {/* Form Content */}
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                placeholder="Enter your email"
                disabled={isFormLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Error Display */}
            {displayError && (
              <div className={`p-4 rounded-md border ${getMessageStyles('error')}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{displayError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isFormLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFormLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Reset Link...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>

            {/* Back to Sign In */}
            <div className="mt-6 text-center">
              <Link
                href="/sign-in"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 