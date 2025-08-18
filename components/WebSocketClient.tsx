'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface PaymentNotification {
  type: 'payment_notification';
  payment: {
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
  };
  timestamp: string;
}

interface PaymentStatusUpdate {
  type: 'payment_status_update';
  payment: {
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
  };
  timestamp: string;
}

interface WebSocketClientProps {
  onPaymentNotification?: (notification: PaymentNotification) => void;
  onPaymentStatusUpdate?: (update: PaymentStatusUpdate) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

export default function WebSocketClient({
  onPaymentNotification,
  onPaymentStatusUpdate,
  onConnectionChange,
  onError
}: WebSocketClientProps) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    if (!user) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      onConnectionChange?.(true);

      // Authenticate the connection
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: user.id,
        userType: user.role === 'admin' ? 'admin' : 'customer'
      }));

      // Subscribe to payment events
      ws.send(JSON.stringify({
        type: 'subscribe',
        events: ['payment_notification', 'payment_status_update']
      }));

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 25000); // Send heartbeat every 25 seconds
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);

        switch (message.type) {
          case 'connection':
            console.log('WebSocket connection established:', message);
            break;

          case 'authentication':
            console.log('WebSocket authentication:', message);
            break;

          case 'subscription':
            console.log('WebSocket subscription:', message);
            break;

          case 'payment_notification':
            console.log('📱 Payment notification received:', message);
            onPaymentNotification?.(message as PaymentNotification);
            break;

          case 'payment_status_update':
            console.log('📱 Payment status update received:', message);
            onPaymentStatusUpdate?.(message as PaymentStatusUpdate);
            break;

          case 'error':
            console.error('WebSocket error:', message.error);
            onError?.(message.error);
            break;

          default:
            console.log('Unknown WebSocket message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      onConnectionChange?.(false);

      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Attempt to reconnect after 5 seconds
      if (event.code !== 1000) { // Don't reconnect if closed intentionally
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect WebSocket...');
          connect();
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError?.('WebSocket connection error');
    };

    wsRef.current = ws;
  }, [user, onConnectionChange, onPaymentNotification, onPaymentStatusUpdate, onError]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  // Connect on mount and when user changes
  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // This component doesn't render anything visible
  return null;
}

// Hook for using WebSocket in components
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<PaymentNotification | null>(null);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<PaymentStatusUpdate | null>(null);

  const handlePaymentNotification = useCallback((notification: PaymentNotification) => {
    setLastNotification(notification);
  }, []);

  const handlePaymentStatusUpdate = useCallback((update: PaymentStatusUpdate) => {
    setLastStatusUpdate(update);
  }, []);

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
  }, []);

  return {
    isConnected,
    lastNotification,
    lastStatusUpdate,
    handlePaymentNotification,
    handlePaymentStatusUpdate,
    handleConnectionChange
  };
}
