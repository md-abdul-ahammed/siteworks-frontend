import { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { customerDetailsSchema, CustomerDetailsForm } from '../types/customer';
import { FORM_CONSTANTS } from '../constants/form';
import { EmailVerificationStepRef } from '../components';

export const useMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const emailVerificationRef = useRef<EmailVerificationStepRef>(null);

  const form = useForm<CustomerDetailsForm>({
    resolver: zodResolver(customerDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      preferredCurrency: 'USD',
      countryOfResidence: 'US',
      accountType: '',
      address: {
        state: 'AL',
      },
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue, control, getValues } = form;
  const watchedValues = watch();

  const nextStep = useCallback(async () => {
    // If we're on the final step, handle submission
    if (currentStep === FORM_CONSTANTS.STEPS.PASSWORD) {
      // For final step, validate and submit
      const isFormValid = await trigger();
      
      if (!isFormValid) {
        setHasAttemptedSubmit(true);
        return;
      }
      
      // If valid, proceed with submission
      try {
        const formData = getValues();
        toast.success('Customer details submitted successfully!');
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Failed to submit form. Please try again.');
      }
      return;
    }
    
    // Special handling for email verification step
    if (currentStep === FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION) {
      // If email is already verified, proceed to next step
      if (isEmailVerified) {
        setHasAttemptedSubmit(false);
        setCurrentStep(prev => prev + 1);
        return;
      }
      
      // If email is not verified, check if we need to send OTP first
      if (!isOtpSent && emailVerificationRef.current) {
        // First validate email
        const emailValid = await trigger(['email']);
        
        if (!emailValid) {
          setHasAttemptedSubmit(true);
          return;
        }
        
        try {
          const otpSent = await emailVerificationRef.current.sendOtp();
          if (otpSent) {
            setIsOtpSent(true);
            // Don't proceed to next step yet, let user enter OTP
            return;
          }
        } catch (error) {
          console.error('Failed to send OTP:', error);
          toast.error('Failed to send OTP. Please try again.');
          return;
        }
      }
      
      // If OTP has been sent but not verified, show error
      if (isOtpSent && !isEmailVerified) {
        toast.error('Please verify your email address before proceeding.');
        return;
      }
      
      return;
    }
    
    // Validate current step before moving to next
    let isValid = false;
    
    if (currentStep === FORM_CONSTANTS.STEPS.PERSONAL_INFO) {
      isValid = await trigger(['firstName', 'lastName', 'phone']);
    } else if (currentStep === FORM_CONSTANTS.STEPS.ADDRESS) {
      isValid = await trigger(['countryOfResidence', 'address']);
    } else if (currentStep === FORM_CONSTANTS.STEPS.BANK_DETAILS) {
      isValid = await trigger(['accountHolderName', 'bankCode', 'accountNumber', 'accountType', 'preferredCurrency']);
    }
    
    if (isValid && currentStep < FORM_CONSTANTS.TOTAL_STEPS) {
      // Reset hasAttemptedSubmit when moving to next step (but not on final step)
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev + 1);
    } else {
      // Set hasAttemptedSubmit to true when validation fails
      setHasAttemptedSubmit(true);
    }
  }, [currentStep, trigger, isOtpSent, isEmailVerified]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      // Reset hasAttemptedSubmit when going back
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev - 1);
      
      // Don't reset email verification status when going back
      // This preserves the verification state when navigating back
    }
  }, [currentStep]);

  // Handle OTP sent callback
  const handleOtpSent = useCallback(() => {
    setIsOtpSent(true);
  }, []);

  // Handle email verification success callback
  const handleVerificationSuccess = useCallback((success: boolean) => {
    setIsEmailVerified(success);
  }, []);

  // Only show errors for the current step
  const getCurrentStepErrors = () => {
    if (!hasAttemptedSubmit) return {};
    
    const currentStepErrors: Partial<typeof errors> = {};
    
    // If we're on the final step and trying to submit, show all errors
    if (currentStep === FORM_CONSTANTS.STEPS.PASSWORD) {
      // Show all errors when submitting the final form
      return errors;
    }
    
    // Only show errors for the current step, not from previous steps
    if (currentStep === FORM_CONSTANTS.STEPS.EMAIL_VERIFICATION) {
      if (errors.email) currentStepErrors.email = errors.email;
      if (errors.otp) currentStepErrors.otp = errors.otp;
    } else if (currentStep === FORM_CONSTANTS.STEPS.PERSONAL_INFO) {
      if (errors.firstName) currentStepErrors.firstName = errors.firstName;
      if (errors.lastName) currentStepErrors.lastName = errors.lastName;
      if (errors.phone) currentStepErrors.phone = errors.phone;
    } else if (currentStep === FORM_CONSTANTS.STEPS.ADDRESS) {
      if (errors.countryOfResidence) currentStepErrors.countryOfResidence = errors.countryOfResidence;
      if (errors.address) currentStepErrors.address = errors.address;
    } else if (currentStep === FORM_CONSTANTS.STEPS.BANK_DETAILS) {
      if (errors.accountHolderName) currentStepErrors.accountHolderName = errors.accountHolderName;
      if (errors.bankCode) currentStepErrors.bankCode = errors.bankCode;
      if (errors.accountNumber) currentStepErrors.accountNumber = errors.accountNumber;
      if (errors.accountType) currentStepErrors.accountType = errors.accountType;
      if (errors.preferredCurrency) currentStepErrors.preferredCurrency = errors.preferredCurrency;
    }
    
    return currentStepErrors;
  };

  return {
    currentStep,
    totalSteps: FORM_CONSTANTS.TOTAL_STEPS,
    register,
    handleSubmit,
    errors: getCurrentStepErrors(),
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
  };
};