import React from 'react';
import { NavigationButtonsProps } from '../types/customer';
import { Button } from '@/components/ui/button';

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSubmit,
  isNextDisabled = false,
  isSubmitting = false,
}) => {
  return (
    <div className="mt-6 space-y-2">
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Previous
          </Button>
        )}
        
        {currentStep < totalSteps && currentStep !== 5 ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? 'Loading...' : 'Next'}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default NavigationButtons; 