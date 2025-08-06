/**
 * Bank Validation Utility
 * Handles real-time bank details validation
 */

export interface BankDetails {
  accountHolderName: string;
  bankCode: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  countryCode: string;
}

export interface ValidationResult {
  success: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldValidation: {
    bankCode: boolean;
    accountNumber: boolean;
    accountHolderName: boolean;
    accountType: boolean;
  };
  suggestions: {
    bankCodeHelp: string;
    accountNumberHelp: string;
    note: string;
  };
  formattedBankCode: string;
  maskedAccountNumber: string;
}

/**
 * Validate bank details in real-time
 */
export async function validateBankDetails(bankDetails: BankDetails): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/auth/validate-bank-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bankDetails),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Validation failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Bank validation error:', error);
    throw error;
  }
}

/**
 * Format bank code for display
 */
export function formatBankCode(bankCode: string, countryCode: string): string {
  if (!bankCode) return '';

  switch (countryCode) {
    case 'US':
      // Format as XXX-XXX-XXX
      return bankCode.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    case 'GB':
      // Format as XX-XX-XX
      return bankCode.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3');
    case 'AU':
      // Format as XXX-XXX
      return bankCode.replace(/(\d{3})(\d{3})/, '$1-$2');
    default:
      return bankCode;
  }
}

/**
 * Mask account number for security
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return accountNumber;
  return '****' + accountNumber.slice(-4);
}

/**
 * Get country-specific bank code help text
 */
export function getBankCodeHelp(countryCode: string): string {
  const helpTexts = {
    'US': 'Find your routing number on the bottom of your checks or contact your bank',
    'CA': 'Your bank code is 9 digits and can be found on your checks or bank statement',
    'GB': 'Your sort code is 6 digits and can be found on your bank card or statement',
    'AU': 'Your BSB code is 6 digits and can be found on your bank statement',
  };

  return helpTexts[countryCode as keyof typeof helpTexts] || 
         'Contact your bank for the correct bank code format';
}

/**
 * Get country-specific account number help text
 */
export function getAccountNumberHelp(countryCode: string): string {
  const helpTexts = {
    'US': 'Your account number is usually 8-12 digits long',
    'CA': 'Canadian account numbers are typically 7-12 digits',
    'GB': 'UK account numbers are exactly 8 digits',
    'AU': 'Australian account numbers are 6-9 digits',
  };

  return helpTexts[countryCode as keyof typeof helpTexts] || 
         'Your account number can be found on your bank statement';
} 