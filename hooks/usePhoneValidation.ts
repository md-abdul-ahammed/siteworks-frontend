import { useState, useCallback, useRef } from 'react';
import { authService } from '@/lib/auth';

export const usePhoneValidation = () => {
  const [isCheckingUniqueness, setIsCheckingUniqueness] = useState(false);
  const [uniquenessError, setUniquenessError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the phone number to avoid too many API calls
  const debouncedPhoneCheck = useCallback(async (phone: string | undefined) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If phone is undefined or null, clear error and return
    if (!phone) {
      setUniquenessError(null);
      return;
    }

    // Ensure phone is a string before calling trim
    const phoneString = String(phone);
    
    if (phoneString.trim().length === 0) {
      setUniquenessError(null);
      return;
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsCheckingUniqueness(true);
      setUniquenessError(null);

      try {
        const isUnique = await authService.checkPhoneUniqueness(phoneString);
        
        if (!isUnique) {
          setUniquenessError('Phone number is already exist');
        } else {
          setUniquenessError(null);
        }
      } catch (error) {
        console.error('Error checking phone uniqueness:', error);
        // Don't set error on network issues, let backend handle it
      } finally {
        setIsCheckingUniqueness(false);
      }
    }, 500); // 500ms delay
  }, []);

  const checkPhoneUniqueness = useCallback((phone: string | undefined) => {
    debouncedPhoneCheck(phone);
  }, [debouncedPhoneCheck]);

  const clearUniquenessError = useCallback(() => {
    setUniquenessError(null);
  }, []);

  return {
    isCheckingUniqueness,
    uniquenessError,
    checkPhoneUniqueness,
    clearUniquenessError,
  };
}; 