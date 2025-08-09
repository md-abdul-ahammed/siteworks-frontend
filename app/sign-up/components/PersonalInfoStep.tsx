import React, { useEffect } from 'react';
import { FormStepProps } from '../types/customer';
import { PhoneInput } from '@/components/ui/phone-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parsePhoneNumber } from 'libphonenumber-js';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';
import { useEmailValidation } from '@/hooks/useEmailValidation';

import { FORM_CONSTANTS } from '../constants/form';

// Create a mapping from phone country codes to address country codes
const PHONE_TO_ADDRESS_COUNTRY_MAPPING: Record<string, string> = {
  'US': 'US', // United States
  'CA': 'CA', // Canada
  'GB': 'GB', // United Kingdom
  'AU': 'AU', // Australia
  'NZ': 'NZ', // New Zealand
  'DE': 'DE', // Germany
  'FR': 'FR', // France
  'IT': 'IT', // Italy
  'ES': 'ES', // Spain
  'NL': 'NL', // Netherlands
  'BE': 'BE', // Belgium
  'CH': 'CH', // Switzerland
  'AT': 'AT', // Austria
  'SE': 'SE', // Sweden
  'NO': 'NO', // Norway
  'DK': 'DK', // Denmark
  'FI': 'FI', // Finland
  'IE': 'IE', // Ireland
  'PL': 'PL', // Poland
  'CZ': 'CZ', // Czech Republic
  'HU': 'HU', // Hungary
  'PT': 'PT', // Portugal
  'GR': 'GR', // Greece
  'HR': 'HR', // Croatia
  'SI': 'SI', // Slovenia
  'SK': 'SK', // Slovakia
  'EE': 'EE', // Estonia
  'LV': 'LV', // Latvia
  'LT': 'LT', // Lithuania
  'LU': 'LU', // Luxembourg
  'MT': 'MT', // Malta
  'CY': 'CY', // Cyprus
  'BG': 'BG', // Bulgaria
  'RO': 'RO', // Romania
  'IS': 'IS', // Iceland
};

const PersonalInfoStep: React.FC<FormStepProps> = ({ register, errors, watch, setValue }) => {
  const phoneValue = watch ? watch('phone') : '';
  const emailValue = watch ? watch('email') : '';
  const { isCheckingUniqueness, uniquenessError, checkPhoneUniqueness, clearUniquenessError } = usePhoneValidation();
  const { isCheckingAvailability, availabilityError, isEmailValid, checkEmailAvailability, clearAvailabilityError } = useEmailValidation();

  const handlePhoneChange = (value: string | undefined) => {
    // Convert undefined to empty string for form validation
    const phoneValue = value || '';
    setValue?.('phone', phoneValue, { shouldValidate: true });
    
    // Check phone uniqueness - ensure phoneValue is a string before calling trim
    if (phoneValue && typeof phoneValue === 'string' && phoneValue.trim().length > 0) {
      checkPhoneUniqueness(phoneValue);
    } else {
      clearUniquenessError();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setValue?.('email', emailValue, { shouldValidate: true });
    
    // Check email availability
    if (emailValue && emailValue.trim().length > 0) {
      checkEmailAvailability(emailValue);
    } else {
      clearAvailabilityError();
    }
  };

  // Effect to automatically update country based on phone number
  useEffect(() => {
    if (phoneValue && typeof phoneValue === 'string' && phoneValue.trim() && setValue) {
      try {
        const parsedPhone = parsePhoneNumber(phoneValue);
        if (parsedPhone && parsedPhone.country) {
          const phoneCountryCode = parsedPhone.country;
          const addressCountryCode = PHONE_TO_ADDRESS_COUNTRY_MAPPING[phoneCountryCode];
          
          // Only update if we have a mapping for this country and it's different from current
          if (addressCountryCode) {
            const currentCountry = watch?.('countryOfResidence');
            if (currentCountry !== addressCountryCode) {
              setValue('countryOfResidence', addressCountryCode, { shouldValidate: true });
            }
          }
        }
      } catch (error) {
        // Silently handle parsing errors - phone number might be incomplete
        console.debug('Phone number parsing error:', error);
      }
    }
  }, [phoneValue, setValue, watch]);

  // Get a more user-friendly error message for phone
  const getPhoneErrorMessage = () => {
    if (!errors.phone) return null;
    
    if (errors.phone.message?.includes('required')) {
      return "Phone number is required";
    }
    
    // For all validation errors, show a clear message
    return "Please enter a valid phone number with country code (e.g., +1 555 123 4567)";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            {...register("email")}
            type="email"
            id="email"
            placeholder="Enter your email address"
            onChange={handleEmailChange}
          />
          {availabilityError && <p className="text-xs text-red-600">{availabilityError}</p>}
          {!availabilityError && errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          {isCheckingAvailability && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="h-3 w-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Checking email availability...
            </p>
          )}
          {!availabilityError && !isCheckingAvailability && emailValue && isEmailValid && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Email is available
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input {...register("firstName")} type="text" id="firstName" placeholder="Enter your first name" />
            {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input {...register("lastName")} type="text" id="lastName" placeholder="Enter your last name" />
            {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="companyName">
            Company Name <span className="text-gray-500">(optional)</span>
          </Label>
          <Input {...register("companyName")} type="text" id="companyName" placeholder="Enter your company name" />
          {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            id="phone"
            placeholder="Enter your phone number"
            value={phoneValue}
            onChange={handlePhoneChange}
            countries={FORM_CONSTANTS.COUNTRIES.map((country) => country.value)}
            onBlur={() => {
              // Trigger validation on blur
              setValue?.("phone", phoneValue, { shouldValidate: true });
            }}
          />
          {errors.phone && <p className="text-xs text-red-600">{getPhoneErrorMessage()}</p>}
          {uniquenessError && <p className="text-xs text-red-600">{uniquenessError}</p>}
          {isCheckingUniqueness && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="h-3 w-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Checking phone number availability...
            </p>
          )}
          {!errors.phone && !uniquenessError && !isCheckingUniqueness && phoneValue && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Valid phone number format
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep; 