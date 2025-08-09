import { useState, useCallback, useRef } from 'react';
import { authService } from '@/lib/auth';

export const useEmailValidation = () => {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Debounce the email check to avoid too many API calls
  const debouncedEmailCheck = useCallback(async (email: string | undefined) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If email is undefined or null, clear error and return
    if (!email) {
      setAvailabilityError(null);
      setIsEmailValid(null);
      return;
    }

    // Ensure email is a string before calling trim
    const emailString = String(email);
    
    if (emailString.trim().length === 0) {
      setAvailabilityError(null);
      setIsEmailValid(null);
      return;
    }

    // First check if email format is valid
    const isValidFormat = emailRegex.test(emailString);
    setIsEmailValid(isValidFormat);

    if (!isValidFormat) {
      setAvailabilityError('Please enter a valid email address');
      return;
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const result = await authService.checkEmailAvailability(emailString);
        
        if (!result.isAvailable) {
          setAvailabilityError(result.error || 'Email already exists');
        } else {
          setAvailabilityError(null);
        }
      } catch (error) {
        console.error('Error checking email availability:', error);
        // Don't set error on network issues, let backend handle it
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500); // 500ms delay
  }, []);

  const checkEmailAvailability = useCallback((email: string | undefined) => {
    debouncedEmailCheck(email);
  }, [debouncedEmailCheck]);

  const clearAvailabilityError = useCallback(() => {
    setAvailabilityError(null);
    setIsEmailValid(null);
  }, []);

  return {
    isCheckingAvailability,
    availabilityError,
    isEmailValid,
    checkEmailAvailability,
    clearAvailabilityError,
  };
}; 