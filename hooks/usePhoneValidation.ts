import { useState, useCallback } from 'react';
import { authService } from '@/lib/auth';
import { useDebounce } from './useDebounce';

export const usePhoneValidation = () => {
  const [isCheckingUniqueness, setIsCheckingUniqueness] = useState(false);
  const [uniquenessError, setUniquenessError] = useState<string | null>(null);

  // Debounce the phone number to avoid too many API calls
  const debouncedPhoneCheck = useDebounce(async (phone: string) => {
    if (!phone || phone.trim().length === 0) {
      setUniquenessError(null);
      return;
    }

    setIsCheckingUniqueness(true);
    setUniquenessError(null);

    try {
      const isUnique = await authService.checkPhoneUniqueness(phone);
      
      if (!isUnique) {
        setUniquenessError('Phone number is already registered by another user');
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

  const checkPhoneUniqueness = useCallback((phone: string) => {
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