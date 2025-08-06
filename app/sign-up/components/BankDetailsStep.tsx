import React, { useEffect, useState } from 'react';
import { FormStepProps } from '../types/customer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { FORM_CONSTANTS } from '../constants/form';

const BankDetailsStep: React.FC<FormStepProps> = ({ register, errors, watch, control, setValue }) => {
  // Watch values for real-time validation feedback
  const accountHolderName = watch?.('accountHolderName') || '';
  const bankCode = watch?.('bankCode') || '';
  const accountNumber = watch?.('accountNumber') || '';
  const accountType = watch?.('accountType') || '';
  const preferredCurrency = watch?.('preferredCurrency') || '';
  const firstName = watch?.('firstName') || '';
  const lastName = watch?.('lastName') || '';

  // State for GoCardless integration status
  const [goCardlessStatus, setGoCardlessStatus] = useState<{
    isValid: boolean;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({ isValid: false, message: '', type: 'info' });

  // Auto-populate account holder name with first name + last name
  useEffect(() => {
    if (firstName && lastName && !accountHolderName) {
      const fullName = `${firstName} ${lastName}`.trim();
      setValue?.('accountHolderName', fullName);
    }
  }, [firstName, lastName, accountHolderName, setValue]);

  // Validate GoCardless requirements
  useEffect(() => {
    const validateGoCardlessData = () => {
      if (!accountHolderName || !bankCode || !accountNumber || !accountType || !preferredCurrency) {
        setGoCardlessStatus({
          isValid: false,
          message: 'Complete all bank details to enable GoCardless Direct Debit setup',
          type: 'info'
        });
        return;
      }

      // Basic validation for bank details format
      if (bankCode.length < 3 || bankCode.length > 20) {
        setGoCardlessStatus({
          isValid: false,
          message: 'Routing number must be between 3-20 digits',
          type: 'error'
        });
        return;
      }

      if (accountNumber.length < 8 || accountNumber.length > 20) {
        setGoCardlessStatus({
          isValid: false,
          message: 'Account number must be between 8-20 digits',
          type: 'error'
        });
        return;
      }

      setGoCardlessStatus({
        isValid: true,
        message: 'Bank details are valid for GoCardless Direct Debit setup',
        type: 'success'
      });
    };

    validateGoCardlessData();
  }, [accountHolderName, bankCode, accountNumber, accountType, preferredCurrency]);

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
            </div>
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
            </div>
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

        {/* Preferred Currency */}
        <div className="space-y-2">
          <Label htmlFor="preferredCurrency" className="text-sm font-medium text-gray-700">
            Preferred currency
          </Label>
          <Controller
            name="preferredCurrency"
            control={control}
            rules={{ required: "Preferred currency is required" }}
            render={({ field, fieldState }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Please select your preferred currency" />
                </SelectTrigger>
                <SelectContent>
                  {FORM_CONSTANTS.CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.preferredCurrency && (
            <p className="text-xs text-red-600 mt-1">{errors.preferredCurrency.message}</p>
          )}
        </div>

        {/* GoCardless Status Indicator */}
        <div className={`border rounded-md p-3 ${
          goCardlessStatus.type === 'success' ? 'bg-green-50 border-green-200' :
          goCardlessStatus.type === 'error' ? 'bg-red-50 border-red-200' :
          goCardlessStatus.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {goCardlessStatus.type === 'success' && (
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {goCardlessStatus.type === 'error' && (
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {goCardlessStatus.type === 'warning' && (
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {goCardlessStatus.type === 'info' && (
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                goCardlessStatus.type === 'success' ? 'text-green-800' :
                goCardlessStatus.type === 'error' ? 'text-red-800' :
                goCardlessStatus.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                GoCardless Direct Debit Setup
              </p>
              <p className={`text-sm mt-1 ${
                goCardlessStatus.type === 'success' ? 'text-green-700' :
                goCardlessStatus.type === 'error' ? 'text-red-700' :
                goCardlessStatus.type === 'warning' ? 'text-yellow-700' :
                'text-blue-700'
              }`}>
                {goCardlessStatus.message}
              </p>
              {goCardlessStatus.isValid && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Your bank details will be securely processed by GoCardless to set up Direct Debit authorization during registration.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Validation Summary */}
        {(errors.accountHolderName || errors.bankCode || errors.accountNumber || errors.accountType || errors.preferredCurrency) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start">
              <svg className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-800">
                <p className="font-medium">Please fix the following issues:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  {errors.accountHolderName && <li>{errors.accountHolderName.message}</li>}
                  {errors.bankCode && <li>{errors.bankCode.message}</li>}
                  {errors.accountNumber && <li>{errors.accountNumber.message}</li>}
                  {errors.accountType && <li>{errors.accountType.message}</li>}
                  {errors.preferredCurrency && <li>{errors.preferredCurrency.message}</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDetailsStep; 