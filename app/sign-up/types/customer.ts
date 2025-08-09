import { z } from "zod";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control } from "react-hook-form";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

// Form validation schema
export const customerDetailsSchema = z.object({
  // Email (simple validation - just check if it exists)
  email: z.string().email("Please enter a valid email address"),
  
  // Password (added after payment success)
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  companyName: z.string()
    .optional()
    .refine((value) => {
      // If no value provided, it's valid (optional field)
      if (!value || value.trim().length === 0) {
        return true;
      }
      
      // If value provided, validate it
      if (value.length < 2) {
        return false;
      }
      
      if (value.length > 100) {
        return false;
      }
      
      if (!/^[a-zA-Z0-9\s\-'\.&]+$/.test(value)) {
        return false;
      }
      
      // Check for common test names
      const testNames = ['test', 'demo', 'example', 'sample', 'company', 'business', 'corp', 'inc', 'llc'];
      const lowerValue = value.toLowerCase();
      return !testNames.some(name => lowerValue.includes(name));
    }, "Company name must be 2-100 characters and contain only letters, numbers, spaces, hyphens, apostrophes, periods, and ampersands"),
  phone: z.string()
    .min(1, "Phone number is required")
    .refine((value) => {
      // Check if it's not just empty or undefined
      if (!value || value.trim().length === 0) {
        return false;
      }
      
      try {
        // Use libphonenumber-js for professional validation
        const isValid = isValidPhoneNumber(value);
        
        if (!isValid) {
          return false;
        }
        
        // Additional checks for common invalid patterns
        const phoneNumber = parsePhoneNumber(value);
        const nationalNumber = phoneNumber?.nationalNumber;
        
        if (nationalNumber) {
          // Check for repeated digits (like 1111111111)
          const digits = nationalNumber.toString();
          const uniqueDigits = new Set(digits).size;
          
          // If all digits are the same, it's invalid
          if (uniqueDigits === 1) {
            return false;
          }
          
          // Check for simple sequential patterns (like 1234567890)
          const isSequential = digits.split('').every((digit, index) => {
            if (index === 0) return true;
            return parseInt(digit) === parseInt(digits[index - 1]) + 1;
          });
          
          if (isSequential) {
            return false;
          }
          
          // Check for common test numbers that should be rejected
          const testPatterns = [
            /^0+$/, // All zeros
            /^1+$/, // All ones  
            /^2+$/, // All twos
            /^3+$/, // All threes
            /^4+$/, // All fours
            /^5+$/, // All fives
            /^6+$/, // All sixes
            /^7+$/, // All sevens
            /^8+$/, // All eights
            /^9+$/, // All nines
            /^123456/, // Sequential starting with 123456
            /^111111/, // Repeated 1s
            /^000000/, // Repeated 0s
          ];
          
          for (const pattern of testPatterns) {
            if (pattern.test(digits)) {
              return false;
            }
          }
        }
        
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid phone number (e.g., +1 555 123 4567)")
    .refine(async (value) => {
      // Check phone number uniqueness (this will be handled by backend validation)
      // Frontend will show a generic message, backend will provide specific feedback
      return true;
    }, "Phone number is already exist"),
  
  // Address Information
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  address: z.object({
    line1: z.string().min(1, "Billing address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "Town or City is required"),
    postcode: z.string().min(1, "Postcode/Zipcode is required"),
    state: z.string().optional(), // For US states
  }),
  
  // Bank Details
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
    }, "Please select a valid account type"),
  
  preferredCurrency: z.string()
    .min(1, "Preferred currency is required")
    .refine((value) => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SEK', 'DKK', 'NOK'];
      return validCurrencies.includes(value);
    }, "Please select a valid currency"),
}).refine((data) => {
  // Password confirmation validation
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CustomerDetailsForm = z.infer<typeof customerDetailsSchema>;

export interface FormStepProps {
  register: UseFormRegister<CustomerDetailsForm>;
  errors: FieldErrors<CustomerDetailsForm>;
  watch?: UseFormWatch<CustomerDetailsForm>;
  setValue?: UseFormSetValue<CustomerDetailsForm>;
  control?: Control<CustomerDetailsForm>;
}

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit?: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export interface ReviewStepProps {
  formData: Partial<CustomerDetailsForm>;
}