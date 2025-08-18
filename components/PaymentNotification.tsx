'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWebSocket } from './WebSocketClient';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentData {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  goCardlessPaymentId?: string;
  zohoInvoiceId?: string;
  paidAt?: string;
  updatedAt: string;
}

export default function PaymentNotification() {
  const { user } = useAuth();
  const { isConnected, lastNotification, lastStatusUpdate } = useWebSocket();
  const [processedNotifications, setProcessedNotifications] = useState<Set<string>>(new Set());

  // Handle payment notifications for customers
  useEffect(() => {
    if (!lastNotification || !user || user.role !== 'customer') return;

    const notificationId = `${lastNotification.payment.id}-${lastNotification.timestamp}`;
    
    // Prevent duplicate notifications
    if (processedNotifications.has(notificationId)) return;

    const payment = lastNotification.payment;
    
    // Only show notifications for the current user
    if (payment.customerId !== user.id) return;

    setProcessedNotifications(prev => new Set(prev).add(notificationId));

    // Show appropriate toast based on payment status
    switch (payment.status) {
      case 'paid':
      case 'confirmed':
        toast.success(
          `Payment Completed! ${payment.currency} ${payment.amount.toFixed(2)}`,
          {
            description: `Your payment for "${payment.description}" has been processed successfully.`,
            duration: 8000,
            action: {
              label: 'View Details',
              onClick: () => {
                // Navigate to billing history or payment details
                window.location.href = '/dashboard/billing';
              }
            }
          }
        );
        break;

      case 'failed':
        toast.error(
          `Payment Failed - ${payment.currency} ${payment.amount.toFixed(2)}`,
          {
            description: `Your payment for "${payment.description}" could not be processed. Please check your payment details.`,
            duration: 10000,
            action: {
              label: 'Retry Payment',
              onClick: () => {
                // Navigate to retry payment page
                window.location.href = '/dashboard/billing';
              }
            }
          }
        );
        break;

      case 'cancelled':
        toast.warning(
          `Payment Cancelled - ${payment.currency} ${payment.amount.toFixed(2)}`,
          {
            description: `Your payment for "${payment.description}" has been cancelled.`,
            duration: 6000
          }
        );
        break;

      default:
        toast.info(
          `Payment Update - ${payment.currency} ${payment.amount.toFixed(2)}`,
          {
            description: `Your payment for "${payment.description}" status: ${payment.status}`,
            duration: 5000
          }
        );
    }
  }, [lastNotification, user, processedNotifications]);

  // Handle payment status updates for admins
  useEffect(() => {
    if (!lastStatusUpdate || !user || user.role !== 'admin') return;

    const updateId = `${lastStatusUpdate.payment.id}-${lastStatusUpdate.timestamp}`;
    
    // Prevent duplicate notifications
    if (processedNotifications.has(updateId)) return;

    const payment = lastStatusUpdate.payment;
    
    setProcessedNotifications(prev => new Set(prev).add(updateId));

    // Show admin notification
    switch (payment.status) {
      case 'paid':
      case 'confirmed':
        toast.success(
          `Payment Received - ${payment.customerName}`,
          {
            description: `${payment.currency} ${payment.amount.toFixed(2)} for "${payment.description}"`,
            duration: 6000,
            action: {
              label: 'View Customer',
              onClick: () => {
                // Navigate to customer details
                window.location.href = `/admin/users/${payment.customerId}`;
              }
            }
          }
        );
        break;

      case 'failed':
        toast.error(
          `Payment Failed - ${payment.customerName}`,
          {
            description: `${payment.currency} ${payment.amount.toFixed(2)} for "${payment.description}"`,
            duration: 8000,
            action: {
              label: 'View Customer',
              onClick: () => {
                // Navigate to customer details
                window.location.href = `/admin/users/${payment.customerId}`;
              }
            }
          }
        );
        break;

      case 'cancelled':
        toast.warning(
          `Payment Cancelled - ${payment.customerName}`,
          {
            description: `${payment.currency} ${payment.amount.toFixed(2)} for "${payment.description}"`,
            duration: 6000
          }
        );
        break;

      default:
        toast.info(
          `Payment Update - ${payment.customerName}`,
          {
            description: `${payment.currency} ${payment.amount.toFixed(2)} for "${payment.description}" - Status: ${payment.status}`,
            duration: 5000
          }
        );
    }
  }, [lastStatusUpdate, user, processedNotifications]);

  // Show connection status
  useEffect(() => {
    if (!user) return;

    if (isConnected) {
      toast.success('Real-time notifications connected', {
        description: 'You will receive instant updates about your payments.',
        duration: 3000
      });
    } else {
      toast.warning('Real-time notifications disconnected', {
        description: 'Attempting to reconnect...',
        duration: 5000
      });
    }
  }, [isConnected, user]);

  // Clean up processed notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProcessedNotifications(new Set());
    }, 60000); // Clear every minute

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything visible
  return null;
}

// Hook for getting payment notification data
export function usePaymentNotifications() {
  const { lastNotification, lastStatusUpdate, isConnected } = useWebSocket();
  
  return {
    lastPaymentNotification: lastNotification?.payment || null,
    lastPaymentStatusUpdate: lastStatusUpdate?.payment || null,
    isConnected,
    hasNewNotification: !!lastNotification,
    hasNewStatusUpdate: !!lastStatusUpdate
  };
}
