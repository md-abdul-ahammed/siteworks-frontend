import React, { useEffect, useState, useCallback } from 'react';
import { FormStepProps } from '../types/customer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { validateBankDetails, type ValidationResult } from '@/lib/bankValidation';
import { useDebounce } from '@/hooks/useDebounce';

interface BankDetailsStepProps extends FormStepProps {
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const BankDetailsStep: React.FC<BankDetailsStepProps> = ({ register, errors, watch, control, setValue, onSubmit, isSubmitting }) => {
  // Watch values for real-time validation feedback
  const accountHolderName = watch?.('accountHolderName') || '';
  const bankCode = watch?.('bankCode') || '';
  const accountNumber = watch?.('accountNumber') || '';
  const accountType = watch?.('accountType') || '';
  const firstName = watch?.('firstName') || '';
  const lastName = watch?.('lastName') || '';

  // State for real-time validation
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounce bank details for validation
  const debouncedBankCode = useDebounce(bankCode, 500);
  const debouncedAccountNumber = useDebounce(accountNumber, 500);
  const debouncedAccountHolderName = useDebounce(accountHolderName, 500);

  // Real-time validation function
  const validateBankDetailsInRealTime = useCallback(async () => {
    if (!debouncedAccountHolderName || !debouncedBankCode || !debouncedAccountNumber || !accountType) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateBankDetails({
        accountHolderName: debouncedAccountHolderName,
        bankCode: debouncedBankCode,
        accountNumber: debouncedAccountNumber,
        accountType: accountType as 'checking' | 'savings',
        countryCode: watch?.('countryOfResidence') || 'US'
      });
      setValidationResult(result);
    } catch (error) {
      console.error('Bank validation error:', error);
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  }, [debouncedAccountHolderName, debouncedBankCode, debouncedAccountNumber, accountType, watch]);

  // Trigger validation when debounced values change
  useEffect(() => {
    validateBankDetailsInRealTime();
  }, [validateBankDetailsInRealTime]);

  // Auto-populate account holder name with first name + last name
  useEffect(() => {
    if (firstName && lastName && !accountHolderName) {
      const fullName = `${firstName} ${lastName}`.trim();
      setValue?.('accountHolderName', fullName);
    }
  }, [firstName, lastName, accountHolderName, setValue]);

  // Helper function to validate input as user types
  const validateNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumeric = /^[0-9]$/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    
    if (!isNumeric && !isAllowedKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Your bank details</h3>
      
      {/* Last step notice */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-gray-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-gray-800">
            <p className="font-medium">Final Step - Bank Details</p>
            <p className="mt-1">This is the last step. Please ensure all bank details are correct before proceeding. Any validation errors will prevent account creation.</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Account Holder Name */}
        <div className="space-y-2">
          <Label htmlFor="accountHolderName" className="text-sm font-medium text-gray-700">
            Account holder name
          </Label>
          <Input
            id="accountHolderName"
            type="text"
            placeholder="Enter the name as it appears on your bank account"
            className="w-full h-10"
            maxLength={100}
            {...register("accountHolderName")}
          />
          <div className="flex justify-between items-center">
            {errors.accountHolderName && (
              <p className="text-xs text-red-600">{errors.accountHolderName.message}</p>
            )}
          </div>
          {/* Auto-population notice */}
          {firstName && lastName && (
            <p className="text-xs text-gray-600 mt-1">
              ✓ Pre-filled with your name from step 1. You can edit if needed.
            </p>
          )}
        </div>

        {/* Routing Number and Account Number */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankCode" className="text-sm font-medium text-gray-700">
              Routing number
            </Label>
            <div className="text-xs text-gray-500 mb-1">Your bank code</div>
            <div className="relative">
              <Input
                id="bankCode"
                type="text"
                placeholder="e.g. 026073150"
                className="w-full h-10 pr-10"
                maxLength={20}
                onKeyDown={validateNumericInput}
                {...register("bankCode")}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between items-center">
              {errors.bankCode && (
                <p className="text-xs text-red-600">{errors.bankCode.message}</p>
              )}
              {isValidating && (
                <p className="text-xs text-gray-600">Validating...</p>
              )}
            </div>
            {/* Real-time validation feedback */}
            {validationResult && !isValidating && (
              <div className="mt-2">
                {validationResult.fieldValidation.bankCode ? (
                  <p className="text-xs text-gray-600">✓ Valid bank code format</p>
                ) : (
                  <p className="text-xs text-red-600">✗ {validationResult.suggestions.bankCodeHelp}</p>
                )}
                {validationResult.warnings.length > 0 && (
                  <p className="text-xs text-yellow-600">⚠ {validationResult.warnings[0]}</p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
              Account number
            </Label>
            <div className="text-xs text-gray-500 mb-1">Your account number</div>
            <div className="relative">
              <Input
                id="accountNumber"
                type="text"
                placeholder="e.g. 2715500356"
                className="w-full h-10 pr-10"
                maxLength={20}
                onKeyDown={validateNumericInput}
                {...register("accountNumber")}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between items-center">
              {errors.accountNumber && (
                <p className="text-xs text-red-600">{errors.accountNumber.message}</p>
              )}
              {isValidating && (
                <p className="text-xs text-gray-600">Validating...</p>
              )}
            </div>
            {/* Real-time validation feedback */}
            {validationResult && !isValidating && (
              <div className="mt-2">
                {validationResult.fieldValidation.accountNumber ? (
                  <p className="text-xs text-gray-600">✓ Valid account number format</p>
                ) : (
                  <p className="text-xs text-red-600">✗ {validationResult.suggestions.accountNumberHelp}</p>
                )}
                {validationResult.warnings.length > 1 && (
                  <p className="text-xs text-yellow-600">⚠ {validationResult.warnings[1]}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <Label htmlFor="accountType" className="text-sm font-medium text-gray-700">
            Account type
          </Label>
          <Controller
            name="accountType"
            control={control}
            rules={{ required: "Account type is required" }}
            render={({ field, fieldState }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Please select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking (Most common)</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.accountType && (
            <p className="text-xs text-red-600 mt-1">{errors.accountType.message}</p>
          )}
        </div>

        {/* Validation Summary */}
        {(errors.accountHolderName || errors.bankCode || errors.accountNumber || errors.accountType || (validationResult && !validationResult.isValid)) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <svg className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-medium">Please fix the following issues before proceeding:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {errors.accountHolderName && <li>{errors.accountHolderName.message}</li>}
                  {errors.bankCode && <li>{errors.bankCode.message}</li>}
                  {errors.accountNumber && <li>{errors.accountNumber.message}</li>}
                  {errors.accountType && <li>{errors.accountType.message}</li>}
                  {validationResult && !validationResult.isValid && validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
                {validationResult && !validationResult.isValid && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800 font-medium">💡 Tips:</p>
                    <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                      {validationResult.suggestions.bankCodeHelp && <li>• {validationResult.suggestions.bankCodeHelp}</li>}
                      {validationResult.suggestions.accountNumberHelp && <li>• {validationResult.suggestions.accountNumberHelp}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button for Final Step */}
      {onSubmit && (
        <div className="mt-6 border-gray-200">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Complete Registration'
            )}
          </button>
          
        </div>
      )}
    </div>
  );
};

export default BankDetailsStep; 