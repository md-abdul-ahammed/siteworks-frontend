"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Import components
import {
  StepIndicator,
  EmailVerificationStep,
  PersonalInfoStep,
  AddressStep,
  BankDetailsStep,
  PasswordSetupStep,
  NavigationButtons,
} from './components';

// Import UI components
import { Button } from '@/components/ui/button';

// Import hooks and constants
import { useMultiStepForm } from './hooks/useMultiStepForm';
import { FORM_CONSTANTS } from './constants/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import GoCardlessStatus from '@/components/GoCardlessStatus';

const CustomerDetailsForm: React.FC = () => {
  const { signUpCustomer, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goCardlessProgress, setGoCardlessProgress] = useState<{
    stage: 'idle' | 'creating_customer' | 'creating_bank_account' | 'creating_mandate' | 'completed' | 'failed';
    message: string;
  }>({ stage: 'idle', message: '' });
  
  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔍 Sign-up page - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated) {
      console.log('✅ User is authenticated, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, user]);
  
  const {
    currentStep,
    totalSteps,
    register,
    handleSubmit,
    errors,
    watchedValues,
    watch,
    setValue,
    control,
    nextStep,
    prevStep,
    emailVerificationRef,
    handleOtpSent,
    handleVerificationSuccess,
    isEmailVerified,
    isOtpSent,
  } = useMultiStepForm();

  // Handle form completion with authentication
  const handleFormCompletion = async () => {
    try {
      setIsSubmitting(true);
      
      // Get form data
      const formData = watchedValues;
      
      // Show GoCardless progress if bank details are provided
      if (formData.accountHolderName && formData.bankCode && formData.accountNumber) {
        setGoCardlessProgress({ stage: 'creating_customer', message: 'Setting up GoCardless customer...' });
        
        // Simulate progress updates (in real implementation, this would be handled by backend events)
        setTimeout(() => {
          setGoCardlessProgress({ stage: 'creating_bank_account', message: 'Verifying bank account details...' });
        }, 1000);
        
        setTimeout(() => {
          setGoCardlessProgress({ stage: 'creating_mandate', message: 'Creating Direct Debit mandate...' });
        }, 2000);
      }
      
      // Call authentication service with all customer data
      await signUpCustomer(formData);
      
      // Mark GoCardless as completed
      if (formData.accountHolderName && formData.bankCode && formData.accountNumber) {
        setGoCardlessProgress({ stage: 'completed', message: 'GoCardless setup completed successfully!' });
      }
      
      // If successful, the AuthContext will handle redirect to dashboard
      toast.success('Account created successfully! Welcome to SiteWorks!');
      
    } catch (error) {
      console.error('Registration error:', error);
      setGoCardlessProgress({ stage: 'failed', message: 'GoCardless setup failed, but account was created.' });
      // Error handling is done in AuthContext
    } finally {
      setIsSubmitting(false);
      // Reset progress after a delay
      setTimeout(() => {
        setGoCardlessProgress({ stage: 'idle', message: '' });
      }, 3000);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION:
        return (
          <EmailVerificationStep 
            register={register} 
            errors={errors} 
            watch={watch} 
            setValue={setValue}
            onOtpSent={handleOtpSent}
            onVerificationSuccess={handleVerificationSuccess}
            isEmailVerified={isEmailVerified}
            isOtpSent={isOtpSent}
            ref={emailVerificationRef}
          />
        );
      case FORM_CONSTANTS.STEPS.PERSONAL_INFO:
        return <PersonalInfoStep register={register} errors={errors} watch={watch} setValue={setValue} />;
      case FORM_CONSTANTS.STEPS.ADDRESS:
        return <AddressStep register={register} errors={errors} watch={watch} setValue={setValue} />;
      case FORM_CONSTANTS.STEPS.BANK_DETAILS:
        return <BankDetailsStep register={register} errors={errors} watch={watch} setValue={setValue} control={control} />;
      case FORM_CONSTANTS.STEPS.PASSWORD:
        return <PasswordSetupStep register={register} errors={errors} watch={watch} setValue={setValue} />;
      default:
        return null;
    }
  };

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
            {currentStep === FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION ? 'Sign Up' : 'Complete Your Profile'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {currentStep === FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION 
              ? 'Start by verifying your email address'
              : 'Please provide your information to continue'
            }
          </p>
          
          {/* Sign In Link */}
          {currentStep === FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                <svg 
                  className="w-5 h-5 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
                <p className="text-sm text-gray-700">
                  Already have an account?{' '}
                  <Link 
                    href="/sign-in"
                    className="font-semibold text-gray-600 hover:text-gray-800 underline transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Form Content */}
        <div>
          {renderStepContent()}

          {/* GoCardless Progress Indicator */}
          {goCardlessProgress.stage !== 'idle' && (
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {goCardlessProgress.stage === 'completed' ? (
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : goCardlessProgress.stage === 'failed' ? (
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="animate-spin h-5 w-5">
                        <svg className="text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      goCardlessProgress.stage === 'completed' ? 'text-green-800' :
                      goCardlessProgress.stage === 'failed' ? 'text-red-800' :
                      'text-blue-800'
                    }`}>
                      GoCardless Direct Debit Setup
                    </p>
                    <p className={`text-sm mt-1 ${
                      goCardlessProgress.stage === 'completed' ? 'text-green-700' :
                      goCardlessProgress.stage === 'failed' ? 'text-red-700' :
                      'text-blue-700'
                    }`}>
                      {goCardlessProgress.message}
                    </p>
                    
                    {/* Progress Steps */}
                    {!(['idle', 'completed', 'failed'].includes(goCardlessProgress.stage)) && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-2 text-xs">
                          <div className={`flex items-center ${
                            ['creating_customer', 'creating_bank_account', 'creating_mandate'].includes(goCardlessProgress.stage) ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              goCardlessProgress.stage === 'creating_customer' ? 'bg-blue-600 animate-pulse' :
                              ['creating_bank_account', 'creating_mandate'].includes(goCardlessProgress.stage) ? 'bg-blue-600' : 'bg-gray-300'
                            }`}></div>
                            Customer
                          </div>
                          <div className={`flex items-center ${
                            ['creating_bank_account', 'creating_mandate'].includes(goCardlessProgress.stage) ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              goCardlessProgress.stage === 'creating_bank_account' ? 'bg-blue-600 animate-pulse' :
                              goCardlessProgress.stage === 'creating_mandate' ? 'bg-blue-600' : 'bg-gray-300'
                            }`}></div>
                            Bank Account
                          </div>
                          <div className={`flex items-center ${
                            goCardlessProgress.stage === 'creating_mandate' ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-1 ${
                              goCardlessProgress.stage === 'creating_mandate' ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
                            }`}></div>
                            Mandate
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={currentStep === FORM_CONSTANTS.STEPS.PASSWORD ? handleFormCompletion : nextStep}
            onPrevious={prevStep}
            isNextDisabled={
              (currentStep === FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION && !isEmailVerified) ||
              isSubmitting ||
              isLoading
            }
            isSubmitting={isSubmitting || isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsForm;