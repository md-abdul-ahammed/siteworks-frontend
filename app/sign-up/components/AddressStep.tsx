import React, { useState, useEffect } from 'react';
import { FormStepProps } from '../types/customer';
import { FORM_CONSTANTS } from '../constants/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parsePhoneNumber } from 'libphonenumber-js';

const AddressStep: React.FC<FormStepProps> = ({ register, errors, watch }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [showAutoSelectedMessage, setShowAutoSelectedMessage] = useState<boolean>(false);
  
  // Watch the country field and phone field to detect changes
  const watchedCountry = watch ? watch('countryOfResidence') : 'US';
  const phoneValue = watch ? watch('phone') : '';
  
  useEffect(() => {
    setSelectedCountry(watchedCountry);
  }, [watchedCountry]);

  // Check if country was auto-selected based on phone number
  useEffect(() => {
    if (phoneValue && watchedCountry) {
      try {
        const parsedPhone = parsePhoneNumber(phoneValue);
        if (parsedPhone && parsedPhone.country) {
          // Show message if the country matches the phone country (indicating auto-selection)
          const phoneCountryMatchesAddress = parsedPhone.country === watchedCountry;
          setShowAutoSelectedMessage(phoneCountryMatchesAddress);
        } else {
          setShowAutoSelectedMessage(false);
        }
      } catch {
        setShowAutoSelectedMessage(false);
      }
    } else {
      setShowAutoSelectedMessage(false);
    }
  }, [phoneValue, watchedCountry]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
      
      <div className="space-y-4">
        {/* Country of Residence */}
        <div className="space-y-2">
          <Label htmlFor="countryOfResidence">Country of residence</Label>
          <Select value={watchedCountry} onValueChange={(value) => {
            const event = {
              target: { name: "countryOfResidence", value }
            };
            register("countryOfResidence").onChange(event);
            // Hide auto-selected message when user manually changes country
            setShowAutoSelectedMessage(false);
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {FORM_CONSTANTS.COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryOfResidence && (
            <p className="text-xs text-red-600">{errors.countryOfResidence.message}</p>
          )}
          {showAutoSelectedMessage && !errors.countryOfResidence && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs text-gray-700">
                Country automatically selected based on your phone number
              </p>
            </div>
          )}
        </div>

        {/* Billing Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="address.line1">Billing address line 1</Label>
          <Input
            {...register("address.line1")}
            type="text"
            id="address.line1"
            placeholder="Enter your billing address"
          />
          {errors.address?.line1 && (
            <p className="text-xs text-red-600">{errors.address.line1.message}</p>
          )}
        </div>

        {/* Billing Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="address.line2">
            Billing address line 2 <span className="text-gray-500">(optional)</span>
          </Label>
          <Input
            {...register("address.line2")}
            type="text"
            id="address.line2"
            placeholder="Apartment, suite, etc."
          />
        </div>

        {/* Town/City and Postcode */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="address.city">Town or City</Label>
            <Input
              {...register("address.city")}
              type="text"
              id="address.city"
              placeholder="Enter city"
            />
            {errors.address?.city && (
              <p className="text-xs text-red-600">{errors.address.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address.postcode">Postcode</Label>
            <Input
              {...register("address.postcode")}
              type="text"
              id="address.postcode"
              placeholder="Enter postcode"
            />
            {errors.address?.postcode && (
              <p className="text-xs text-red-600">{errors.address.postcode.message}</p>
            )}
          </div>
        </div>

        {/* State/Territory (only for United States) */}
        {selectedCountry === 'US' && (
          <div className="space-y-2">
            <Label htmlFor="address.state">State/Territory</Label>
            <Select value={watch ? watch('address.state') : ''} onValueChange={(value) => {
              const event = {
                target: { name: "address.state", value }
              };
              register("address.state").onChange(event);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select state/territory" />
              </SelectTrigger>
              <SelectContent>
                {FORM_CONSTANTS.US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.address?.state && (
              <p className="text-xs text-red-600">{errors.address.state.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressStep; 