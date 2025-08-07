import React, { useEffect, useState } from 'react';

interface DirectDebitStatusProps {
  customerId?: string;
  bankAccountId?: string;
  mandateId?: string;
  mandateStatus?: string;
  isLoading?: boolean;
}

const DirectDebitStatus: React.FC<DirectDebitStatusProps> = ({
  customerId,
  bankAccountId,
  mandateId,
  mandateStatus,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-accent rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-accent rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!customerId || !bankAccountId || !mandateId) {
    return (
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-card-foreground">Direct Debit Not Configured</h3>
            <p className="text-sm text-muted-foreground">Direct Debit has not been configured for this account.</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = mandateStatus === 'active' || mandateStatus === 'pending_submission' || mandateStatus === 'submitted';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isActive ? (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-card-foreground">Direct Debit Status</h3>
          <p className="text-sm text-muted-foreground">
            {isActive 
              ? 'Your Direct Debit mandate is active and ready for payments.'
              : `Direct Debit mandate status: ${mandateStatus || 'unknown'}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DirectDebitStatus;