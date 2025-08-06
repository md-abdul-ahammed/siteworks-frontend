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

const CustomerDetailsForm: React.FC = () => {
  const { signUpCustomer, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      
      // Call authentication service with all customer data
      await signUpCustomer(formData);
      
      // If successful, the AuthContext will handle redirect to dashboard
      toast.success('Account created successfully! Welcome to SiteWorks!');
      
    } catch (error) {
      console.error('Registration error:', error);
      // Error handling is done in AuthContext
    } finally {
      setIsSubmitting(false);
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