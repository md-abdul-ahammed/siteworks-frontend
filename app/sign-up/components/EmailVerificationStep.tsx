import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { FormStepProps } from '../types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface EmailVerificationStepRef {
  sendOtp: () => Promise<boolean>;
  verifyOtp: () => Promise<boolean>;
}

interface EmailVerificationStepProps extends FormStepProps {
  onOtpSent?: () => void;
  onOtpVerified?: () => void;
  onVerificationSuccess?: (success: boolean) => void;
  isEmailVerified?: boolean;
  isOtpSent?: boolean;
}

const EmailVerificationStep = forwardRef<EmailVerificationStepRef, EmailVerificationStepProps>(
  ({ register, errors, watch, setValue, onOtpSent, onOtpVerified, onVerificationSuccess, isEmailVerified = false, isOtpSent = false }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationMessage, setVerificationMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
    const watchedEmail = watch?.('email') || '';
    const watchedOtp = watch?.('otp') || '';

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const handleSendOtp = async (): Promise<boolean> => {
      if (!watchedEmail || errors.email) {
        return false;
      }

      setIsLoading(true);
      setVerificationMessage('');
      setMessageType('info');
      
      try {
        // First check if email exists
        const checkResponse = await fetch(`${API_BASE_URL}/api/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: watchedEmail }),
        });

        const checkData = await checkResponse.json();

        if (checkResponse.status === 409) {
          // Email already exists
          setVerificationMessage('❌ This email is already taken. Please use a different email address.');
          setMessageType('error');
          return false;
        }

        if (!checkResponse.ok) {
          setVerificationMessage(checkData.error || '❌ Error checking email. Please try again.');
          setMessageType('error');
          return false;
        }

        // Email is available, now send OTP
        const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: watchedEmail }),
        });

        const data = await response.json();

        if (response.ok) {
          onOtpSent?.();
          setVerificationMessage('OTP sent successfully! Check your email inbox.');
          setMessageType('success');
          return true;
        } else {
          setVerificationMessage(data.error || '❌ Failed to send OTP. Please try again.');
          setMessageType('error');
          return false;
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        setVerificationMessage('❌ Network error. Please check your connection and try again.');
        setMessageType('error');
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    const handleVerifyOtp = async (): Promise<boolean> => {
      if (!watchedEmail || !watchedOtp || errors.otp) {
        return false;
      }

      setIsVerifying(true);
      setVerificationMessage('');
      setMessageType('info');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: watchedEmail, 
            otp: watchedOtp 
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setVerificationMessage('🎉 Email verified successfully! You can now proceed.');
          setMessageType('success');
          onOtpVerified?.();
          onVerificationSuccess?.(true);
          return true;
        } else {
          setVerificationMessage(data.error || '❌ Invalid OTP. Please check and try again.');
          setMessageType('error');
          onVerificationSuccess?.(false);
          return false;
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        setVerificationMessage('❌ Network error. Please check your connection and try again.');
        setMessageType('error');
        return false;
      } finally {
        setIsVerifying(false);
      }
    };

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
      sendOtp: handleSendOtp,
      verifyOtp: handleVerifyOtp,
    }));

    const handleResendOtp = async () => {
      if (!watchedEmail || errors.email) {
        return;
      }

      setIsLoading(true);
      setVerificationMessage('');
      setMessageType('info');
      
      try {
        // First check if email exists
        const checkResponse = await fetch(`${API_BASE_URL}/api/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: watchedEmail }),
        });

        const checkData = await checkResponse.json();

        if (checkResponse.status === 409) {
          // Email already exists
          setVerificationMessage('❌ This email is already taken. Please use a different email address.');
          setMessageType('error');
          return;
        }

        if (!checkResponse.ok) {
          setVerificationMessage(checkData.error || '❌ Error checking email. Please try again.');
          setMessageType('error');
          return;
        }

        // Email is available, now send OTP
        const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: watchedEmail }),
        });

        const data = await response.json();

        if (response.ok) {
          onOtpSent?.();
          setVerificationMessage('OTP resent successfully! Check your email inbox.');
          setMessageType('success');
        } else {
          setVerificationMessage(data.error || '❌ Failed to resend OTP. Please try again.');
          setMessageType('error');
        }
      } catch (error) {
        console.error('Error resending OTP:', error);
        setVerificationMessage('❌ Network error. Please check your connection and try again.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    const getMessageStyles = () => {
      switch (messageType) {
        case 'success':
          return 'bg-gray-50 text-gray-700 border border-gray-200';
        case 'error':
          return 'bg-red-50 text-red-700 border border-red-200';
        default:
          return 'bg-gray-50 text-gray-700 border border-gray-200';
      }
    };

    return (
      <div className="space-y-6">
        {/* Email Verification Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
                <p className="text-sm text-gray-600">Please verify your email address to continue</p>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address
              </Label>
              <div className="flex gap-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  {...register("email")}
                  disabled={isEmailVerified}
                />
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!watchedEmail || !!errors.email || isLoading || isEmailVerified}
                  className={`px-6 transition-all duration-200 ${
                    isEmailVerified 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : isEmailVerified ? (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Verified</span>
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Show verification message in email section */}
            {verificationMessage && (
              <div className={`p-4 rounded-lg text-sm flex items-start space-x-3 ${getMessageStyles()}`}>
                <div className="flex-shrink-0 mt-0.5">
                  {messageType === 'success' && (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {messageType === 'error' && (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {messageType === 'info' && (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{verificationMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OTP Verification Section */}
        {(isOtpSent || isEmailVerified) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Verification Code</h3>
                  <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email</p>
                </div>
              </div>

              <div>
                <Label htmlFor="otp" className="text-sm font-medium text-gray-700 mb-2 block">
                  Verification Code
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="flex-1 text-center text-lg font-mono transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    {...register("otp")}
                    disabled={isEmailVerified}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!watchedOtp || watchedOtp.length !== 6 || isVerifying || isEmailVerified}
                    className={`px-6 transition-all duration-200 ${
                      isEmailVerified 
                        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : isEmailVerified ? (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Verified</span>
                      </div>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {errors.otp && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {verificationMessage && (
                <div className={`p-4 rounded-lg text-sm flex items-start space-x-3 ${getMessageStyles()}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {messageType === 'success' && (
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {messageType === 'error' && (
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {messageType === 'info' && (
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{verificationMessage}</p>
                  </div>
                </div>
              )}

              {!isEmailVerified && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-gray-600 hover:text-gray-500 font-medium underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend Code
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success State */}
        {/* {isEmailVerified && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Email Verified Successfully!</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Your email address has been verified. You can now proceed to the next step.
                </p>
              </div>
            </div>
          </div>
        )} */}
      </div>
    );
  }
);

EmailVerificationStep.displayName = 'EmailVerificationStep';

export default EmailVerificationStep; 