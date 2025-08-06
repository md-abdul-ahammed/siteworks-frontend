import React, { useEffect, useState } from 'react';

interface GoCardlessStatusProps {
  customerId?: string;
  bankAccountId?: string;
  mandateId?: string;
  mandateStatus?: string;
  showDetails?: boolean;
  className?: string;
}

interface MandateStatusInfo {
  status: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  message: string;
  description: string;
}

const GoCardlessStatus: React.FC<GoCardlessStatusProps> = ({
  customerId,
  bankAccountId,
  mandateId,
  mandateStatus,
  showDetails = false,
  className = ''
}) => {
  const [statusInfo, setStatusInfo] = useState<MandateStatusInfo | null>(null);

  useEffect(() => {
    const getStatusInfo = (status?: string): MandateStatusInfo => {
      if (!customerId || !bankAccountId || !mandateId) {
        return {
          status: 'not_setup',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
          message: 'Direct Debit Not Set Up',
          description: 'GoCardless Direct Debit has not been configured for this account.'
        };
      }

      switch (status?.toLowerCase()) {
        case 'active':
          return {
            status: 'active',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Direct Debit Active',
            description: 'Your GoCardless Direct Debit mandate is active and ready for payments.'
          };
        case 'pending_submission':
          return {
            status: 'pending_submission',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Pending Submission',
            description: 'Your Direct Debit mandate is being submitted to the bank for approval.'
          };
        case 'submitted':
          return {
            status: 'submitted',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Submitted to Bank',
            description: 'Your Direct Debit mandate has been submitted and is awaiting bank processing.'
          };
        case 'failed':
          return {
            status: 'failed',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Setup Failed',
            description: 'Direct Debit mandate setup failed. Please contact support or try setting up again.'
          };
        case 'cancelled':
          return {
            status: 'cancelled',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Mandate Cancelled',
            description: 'Your Direct Debit mandate has been cancelled.'
          };
        case 'expired':
          return {
            status: 'expired',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Mandate Expired',
            description: 'Your Direct Debit mandate has expired and needs to be renewed.'
          };
        default:
          return {
            status: 'unknown',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            icon: (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            ),
            message: 'Status Unknown',
            description: 'Unable to determine the current status of your Direct Debit mandate.'
          };
      }
    };

    setStatusInfo(getStatusInfo(mandateStatus));
  }, [customerId, bankAccountId, mandateId, mandateStatus]);

  if (!statusInfo) return null;

  return (
    <div className={`border rounded-md p-3 ${statusInfo.bgColor} ${statusInfo.borderColor} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${statusInfo.color}`}>
          {statusInfo.icon}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.message}
          </p>
          <p className={`text-sm mt-1 ${statusInfo.color.replace('600', '700')}`}>
            {statusInfo.description}
          </p>
          {showDetails && (customerId || bankAccountId || mandateId) && (
            <div className="mt-2 text-xs space-y-1">
              {customerId && (
                <div className="flex justify-between">
                  <span className="font-medium">Customer ID:</span>
                  <span className="font-mono">{customerId.substring(0, 8)}...</span>
                </div>
              )}
              {bankAccountId && (
                <div className="flex justify-between">
                  <span className="font-medium">Bank Account ID:</span>
                  <span className="font-mono">{bankAccountId.substring(0, 8)}...</span>
                </div>
              )}
              {mandateId && (
                <div className="flex justify-between">
                  <span className="font-medium">Mandate ID:</span>
                  <span className="font-mono">{mandateId.substring(0, 8)}...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoCardlessStatus;