import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { validateBankDetails } from '@/lib/bankValidation';
import { useDebounce } from '@/hooks/useDebounce';
import toast from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

// Validation schema - 100% Same as signup (without countryCode)
const bankDetailsSchema = z.object({
  accountHolderName: z.string()
    .min(1, "Account holder name is required")
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s\-'\.]+$/, "Account holder name can only contain letters, spaces, hyphens, apostrophes, and periods")
    .refine((value) => {
      // Check for common test names
      const testNames = ['test', 'demo', 'example', 'sample', 'user', 'admin'];
      const lowerValue = value.toLowerCase();
      return !testNames.some(name => lowerValue.includes(name));
    }, "Please enter a valid account holder name"),
  
  bankCode: z.string()
    .min(1, "Bank code is required")
    .min(3, "Bank code must be at least 3 characters")
    .max(20, "Bank code cannot exceed 20 characters")
    .regex(/^[0-9]+$/, "Bank code must contain only numbers")
    .refine((value) => {
      // Check for common test patterns
      const testPatterns = [
        /^0+$/, // All zeros
        /^1+$/, // All ones
        /^123/, // Sequential starting with 123
        /^111/, // Repeated 1s
        /^000/, // Repeated 0s
      ];
      return !testPatterns.some(pattern => pattern.test(value));
    }, "Please enter a valid bank code")
    .refine((value) => {
      // Check for logical bank code patterns
      // Most bank codes are 3-9 digits and not all the same
      const digits = value.split('');
      const uniqueDigits = new Set(digits).size;
      return uniqueDigits > 1; // At least 2 different digits
    }, "Bank code must contain at least 2 different digits"),
  
  accountNumber: z.string()
    .min(1, "Account number is required")
    .min(8, "Account number must be at least 8 digits")
    .max(20, "Account number cannot exceed 20 digits")
    .regex(/^[0-9]+$/, "Account number must contain only numbers")
    .refine((value) => {
      // Check for common test patterns
      const testPatterns = [
        /^0+$/, // All zeros
        /^1+$/, // All ones
        /^123456/, // Sequential starting with 123456
        /^111111/, // Repeated 1s
        /^000000/, // Repeated 0s
        /^123456789/, // Sequential
        /^987654321/, // Reverse sequential
      ];
      return !testPatterns.some(pattern => pattern.test(value));
    }, "Please enter a valid account number")
    .refine((value) => {
      // Check for logical account number patterns
      const digits = value.split('');
      const uniqueDigits = new Set(digits).size;
      return uniqueDigits > 2; // At least 3 different digits
    }, "Account number must contain at least 3 different digits")
    .refine((value) => {
      // Check for sequential patterns
      const digits = value.split('').map(d => parseInt(d));
      let sequentialCount = 0;
      let reverseSequentialCount = 0;
      
      for (let i = 1; i < digits.length; i++) {
        if (digits[i] === digits[i-1] + 1) sequentialCount++;
        if (digits[i] === digits[i-1] - 1) reverseSequentialCount++;
      }
      
      // If more than 60% of digits are sequential, it's suspicious
      const maxSequential = Math.floor(digits.length * 0.6);
      return sequentialCount <= maxSequential && reverseSequentialCount <= maxSequential;
    }, "Account number appears to be invalid"),
  
  accountType: z.string()
    .min(1, "Account type is required")
    .refine((value) => {
      const validTypes = ['checking', 'savings'];
      return validTypes.includes(value);
    }, "Please select a valid account type")
});

type BankDetailsFormData = z.infer<typeof bankDetailsSchema>;

interface BankDetailsUpdateProps {
  onSuccess?: () => void;
}

const BankDetailsUpdate: React.FC<BankDetailsUpdateProps> = ({ onSuccess }) => {
  const { getAuthHeaders } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset
  } = useForm<BankDetailsFormData>({
    resolver: zodResolver(bankDetailsSchema),
         defaultValues: {
       accountHolderName: '',
       bankCode: '',
       accountNumber: '',
       accountType: undefined
     }
  });



  // Watch values for real-time validation
  const accountHolderName = watch('accountHolderName');
  const bankCode = watch('bankCode');
  const accountNumber = watch('accountNumber');
  const accountType = watch('accountType');

  // Debounce values for validation
  const debouncedBankCode = useDebounce(bankCode, 500);
  const debouncedAccountNumber = useDebounce(accountNumber, 500);
  const debouncedAccountHolderName = useDebounce(accountHolderName, 500);

  // Real-time validation
  React.useEffect(() => {
    const validateBankDetailsInRealTime = async () => {
      // Only validate if we have all required fields
      if (!debouncedAccountHolderName || !debouncedBankCode || !debouncedAccountNumber || !accountType) {
        setValidationErrors([]);
        setValidationWarnings([]);
        return;
      }

      

      setIsValidating(true);
      try {
                 const result = await validateBankDetails({
           accountHolderName: debouncedAccountHolderName,
           bankCode: debouncedBankCode,
           accountNumber: debouncedAccountNumber,
           accountType: accountType as 'checking' | 'savings',
           countryCode: 'US'
         });
        
        
        setValidationErrors(result.errors || []);
        setValidationWarnings(result.warnings || []);
             } catch (error) {
         console.error('Bank validation error:', error);
         setValidationErrors(['Unable to validate bank details. Please check your information.']);
         setValidationWarnings([]);
       } finally {
        setIsValidating(false);
      }
    };

         validateBankDetailsInRealTime();
   }, [debouncedAccountHolderName, debouncedBankCode, debouncedAccountNumber, accountType]);

  // Helper function to validate numeric input
  const validateNumericInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumeric = /^[0-9]$/.test(e.key);
    const isAllowedKey = allowedKeys.includes(e.key);
    
    if (!isNumeric && !isAllowedKey) {
      e.preventDefault();
    }
  };

  const onSubmit = async (data: BankDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/customers/bank-details', {
        method: 'PUT',
        headers: {
          ...authHeaders,
        },
        body: JSON.stringify({
          ...data,
          countryCode: 'US'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update bank details');
      }

      // Show success message with updated details
      toast.success(`Bank details updated successfully for ${data.accountHolderName}!`);

      // Reset form with success state
      reset();
      
      // Show success feedback
      setValidationErrors([]);
      setValidationWarnings([]);
      setIsSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
      
      // Call onSuccess callback if provided
      onSuccess?.();
      
    } catch (error) {
      console.error('Error updating bank details:', error);
      toast.error(`Failed to update bank details: ${error instanceof Error ? error.message : 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card border-border mt-6">
      <CardHeader>
        <CardTitle className="text-card-foreground">Update Bank Details</CardTitle>
        <CardDescription className="text-muted-foreground">
          Update your bank account details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          noValidate
          className="space-y-6"
        >

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-start">
                <svg className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-800">
                  <p className="font-medium">Bank details updated successfully!</p>
                  <p className="text-xs mt-1">Your bank account information has been saved.</p>
                </div>
              </div>
            </div>
          )}

          {/* Validation Summary - 100% Same as signup */}
           {(errors.accountHolderName || errors.bankCode || errors.accountNumber || errors.accountType || validationErrors.length > 0) && (
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
                     {validationErrors.map((error, index) => (
                       <li key={index}>{error}</li>
                     ))}
                   </ul>
                   {validationWarnings.length > 0 && (
                     <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                       <p className="text-xs text-yellow-800 font-medium">💡 Tips:</p>
                       <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                         {validationWarnings.map((warning, index) => (
                           <li key={index}>• {warning}</li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           )}
          {/* Account Holder Name */}
          <div className="space-y-3">
            <Label htmlFor="accountHolderName" className="text-sm font-semibold text-foreground">
              Account holder name
            </Label>
            <Input
              id="accountHolderName"
              type="text"
              placeholder="Enter the name as it appears on your bank account"
              className="w-full h-11 bg-background border-2 border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/70"
              maxLength={100}
              {...register("accountHolderName")}
            />
            {errors.accountHolderName && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {errors.accountHolderName.message}
              </p>
            )}
          </div>

          {/* Bank Code and Account Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <Label htmlFor="bankCode" className="text-sm font-semibold text-foreground">
                  Routing number
                </Label>
                <div className="text-xs text-muted-foreground mt-1">Your bank code</div>
              </div>
              <Input
                id="bankCode"
                type="text"
                placeholder="e.g. 026073150"
                className="w-full h-11 bg-background border-2 border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/70 font-mono tracking-wide"
                maxLength={20}
                onKeyDown={validateNumericInput}
                {...register("bankCode")}
              />
                             {errors.bankCode && (
                 <p className="text-sm text-destructive font-medium flex items-center gap-1">
                   <span className="w-1 h-1 bg-destructive rounded-full"></span>
                   {errors.bankCode.message}
                 </p>
               )}
              {isValidating && (
                <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Validating...
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="accountNumber" className="text-sm font-semibold text-foreground">
                  Account number
                </Label>
                <div className="text-xs text-muted-foreground mt-1">Your account number</div>
              </div>
              <Input
                id="accountNumber"
                type="text"
                placeholder="e.g. 2715500356"
                className="w-full h-11 bg-background border-2 border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 placeholder:text-muted-foreground/70 font-mono tracking-wide"
                maxLength={20}
                onKeyDown={validateNumericInput}
                {...register("accountNumber")}
              />
                             {errors.accountNumber && (
                 <p className="text-sm text-destructive font-medium flex items-center gap-1">
                   <span className="w-1 h-1 bg-destructive rounded-full"></span>
                   {errors.accountNumber.message}
                 </p>
               )}
              {isValidating && (
                <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Validating...
                </div>
              )}
            </div>
          </div>

          {/* Account Type */}
          <div className="space-y-3">
            <Label htmlFor="accountType" className="text-sm font-semibold text-foreground">
              Account type
            </Label>
            <Controller
              name="accountType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <SelectTrigger className="w-full h-11 bg-background border-2 border-border focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all duration-200 data-[placeholder]:text-muted-foreground/70">
                    <SelectValue placeholder="Please select one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking" className="cursor-pointer">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Checking</span>
                        <span className="text-xs text-muted-foreground">Most common</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="savings" className="cursor-pointer">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Savings</span>
                        <span className="text-xs text-muted-foreground">Interest-bearing account</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.accountType && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-destructive rounded-full"></span>
                {errors.accountType.message}
              </p>
            )}
          </div>

          

          {/* Submit Button */}
          <div className="pt-4 border-t border-border">
            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || Object.keys(errors).length > 0 || validationErrors.length > 0}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Updating Bank Details...</span>
                </div>
              ) : Object.keys(errors).length > 0 || validationErrors.length > 0 ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Fix Validation Issues</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Update Bank Details</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankDetailsUpdate;
