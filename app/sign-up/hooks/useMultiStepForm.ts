import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerDetailsSchema, CustomerDetailsForm } from '../types/customer';
import { FORM_CONSTANTS } from '../constants/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';

export const useMultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(FORM_CONSTANTS.STEPS.PERSONAL_INFO);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const { checkEmailAvailability } = useAuth();
  const { uniquenessError: phoneUniquenessError, isCheckingUniqueness: isCheckingPhone } = usePhoneValidation();

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
    // Don't auto-submit on BANK_DETAILS step - let the form handle submission
    // This is just for navigation between steps
    
    // Validate current step before moving to next
    let isValid = false;
    
    if (currentStep === FORM_CONSTANTS.STEPS.PERSONAL_INFO) {
      isValid = await trigger(['email', 'firstName', 'lastName', 'phone']);
      
      if (isValid) {
        // Check email availability
        const email = watchedValues.email;
        if (email) {
          setIsCheckingEmail(true);
          try {
            const result = await checkEmailAvailability(email);
            if (!result.isAvailable) {
              toast.error(result.error || 'Email is already registered');
              setHasAttemptedSubmit(true);
              setIsCheckingEmail(false);
              return;
            }
          } catch (error) {
            console.error('Email validation error:', error);
            toast.error('Error checking email availability');
            setHasAttemptedSubmit(true);
            setIsCheckingEmail(false);
            return;
          } finally {
            setIsCheckingEmail(false);
          }
        }
        
        // Check phone uniqueness
        const phone = watchedValues.phone;
        if (phone) {
          try {
            const isPhoneUnique = await authService.checkPhoneUniqueness(phone);
            if (!isPhoneUnique) {
              toast.error('Phone number is already registered');
              setHasAttemptedSubmit(true);
              return;
            }
          } catch (error) {
            console.error('Phone validation error:', error);
            toast.error('Error checking phone availability');
            setHasAttemptedSubmit(true);
            return;
          }
        }
      }
    } else if (currentStep === FORM_CONSTANTS.STEPS.ADDRESS) {
      isValid = await trigger(['countryOfResidence', 'address']);
    } else if (currentStep === FORM_CONSTANTS.STEPS.PASSWORD) {
      isValid = await trigger(['password', 'confirmPassword']);
    }
    
    // For BANK_DETAILS step, don't validate - let user navigate freely
    if (currentStep === FORM_CONSTANTS.STEPS.BANK_DETAILS) {
      // Allow navigation to next step without validation
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev + 1);
      return;
    }
    
    if (isValid && currentStep < FORM_CONSTANTS.TOTAL_STEPS) {
      // Reset hasAttemptedSubmit when moving to next step
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev + 1);
    } else {
      // Set hasAttemptedSubmit to true when validation fails
      setHasAttemptedSubmit(true);
    }
  }, [currentStep, trigger, watchedValues.email, watchedValues.phone, checkEmailAvailability]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      // Reset hasAttemptedSubmit when going back
      setHasAttemptedSubmit(false);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Only show errors for the current step
  const getCurrentStepErrors = () => {
    if (!hasAttemptedSubmit) return {};
    
    const currentStepErrors: Partial<typeof errors> = {};
    
    // If we're on the final step and trying to submit, show all errors
    if (currentStep === FORM_CONSTANTS.STEPS.BANK_DETAILS) {
      // Show all errors when submitting the final form
      return errors;
    }
    
    // Only show errors for the current step, not from previous steps
    if (currentStep === FORM_CONSTANTS.STEPS.PERSONAL_INFO) {
      if (errors.email) currentStepErrors.email = errors.email;
      if (errors.firstName) currentStepErrors.firstName = errors.firstName;
      if (errors.lastName) currentStepErrors.lastName = errors.lastName;
      if (errors.phone) currentStepErrors.phone = errors.phone;
    } else if (currentStep === FORM_CONSTANTS.STEPS.ADDRESS) {
      if (errors.countryOfResidence) currentStepErrors.countryOfResidence = errors.countryOfResidence;
      if (errors.address) currentStepErrors.address = errors.address;
    } else if (currentStep === FORM_CONSTANTS.STEPS.PASSWORD) {
      if (errors.password) currentStepErrors.password = errors.password;
      if (errors.confirmPassword) currentStepErrors.confirmPassword = errors.confirmPassword;
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
    isCheckingEmail,
    isCheckingPhone,
    phoneUniquenessError,
  };
};