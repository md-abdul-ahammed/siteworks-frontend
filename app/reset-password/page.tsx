"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const { resetPassword, verifyResetToken, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{ email: string; firstName: string; lastName: string } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const verificationInProgress = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const token = searchParams.get('token');

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        if (isMounted) {
          setIsValidToken(false);
          setLocalError('No reset token provided.');
        }
        return;
      }

      // Prevent multiple simultaneous calls
      if (verificationInProgress.current) {
        return;
      }

      try {
        verificationInProgress.current = true;
        if (isMounted) {
          setIsVerifyingToken(true);
        }
        clearError();
        const customer = await verifyResetToken(token);
        if (isMounted) {
          setCustomerInfo(customer);
          setIsValidToken(true);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setIsValidToken(false);
          setLocalError('This reset link is invalid or has expired.');
        }
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false);
        }
        verificationInProgress.current = false;
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]); // Remove verifyResetToken and clearError from dependencies

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      setLocalError(null);
      clearError();
      await resetPassword(token, data.newPassword);
    } catch (error: unknown) {
      setLocalError('An error occurred while resetting your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = error || localError;
  const isFormLoading = isLoading || isSubmitting || isVerifyingToken;

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gray-800 p-3 rounded-full mr-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">SiteWorks</h1>
                <p className="text-sm text-gray-600">A WEBSITE THAT WORKS FOR YOU!</p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verifying Reset Link</h2>
            <p className="text-gray-600">Please wait while we verify your reset link...</p>
          </div>
          <div className="bg-white py-10 px-8 shadow-xl rounded-xl border border-gray-200">
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 text-sm">Verifying your reset token...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-red-600 p-3 rounded-full mr-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">SiteWorks</h1>
                <p className="text-sm text-gray-600">A WEBSITE THAT WORKS FOR YOU!</p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Reset Link</h2>
            <p className="text-gray-600">The reset link you're trying to use is not valid.</p>
          </div>
          <div className="bg-white py-10 px-8 shadow-xl rounded-xl border border-gray-200">
            <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{displayError}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Link href="/forgot-password" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                Request New Reset Link
              </Link>
              <Link href="/sign-in" className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gray-800 p-3 rounded-full mr-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">SiteWorks</h1>
              <p className="text-sm text-gray-600">A WEBSITE THAT WORKS FOR YOU!</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reset Your Password</h2>
          {customerInfo && (
            <p className="text-gray-600 text-sm">
              Reset password for <span className="font-medium text-gray-900">{customerInfo.email}</span>
            </p>
          )}
        </div>

        <div className="bg-white py-10 px-8 shadow-xl rounded-xl border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character',
                  },
                })}
                placeholder="Enter your new password"
                disabled={isFormLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
              />
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => {
                    const password = watch('newPassword');
                    return value === password || 'Passwords do not match';
                  },
                })}
                placeholder="Confirm your new password"
                disabled={isFormLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {displayError && (
              <div className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{displayError}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isFormLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isFormLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </Button>

            <div className="text-center pt-4">
              <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium">
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 