'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertCircle, 
  RefreshCw, 
  Shield, 
  WifiOff, 
  Database, 
  Server,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorDisplayProps {
  /**
   * The type of error - affects icon and styling
   */
  type?: 'general' | 'network' | 'database' | 'auth' | 'access' | 'server' | 'validation';
  
  /**
   * Main error title
   */
  title?: string;
  
  /**
   * Error message/description
   */
  message: string;
  
  /**
   * Whether to show a retry button
   */
  showRetry?: boolean;
  
  /**
   * Retry button text
   */
  retryText?: string;
  
  /**
   * Callback when retry button is clicked
   */
  onRetry?: () => void;
  
  /**
   * Whether the retry action is loading
   */
  isRetrying?: boolean;
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Display variant
   */
  variant?: 'card' | 'inline' | 'fullscreen';
  
  /**
   * Custom icon to override the default
   */
  icon?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional actions to display
   */
  actions?: React.ReactNode;
}

const getErrorIcon = (type: ErrorDisplayProps['type'], size: string) => {
  const iconClass = cn(
    'text-white',
    {
      'h-4 w-4': size === 'sm',
      'h-6 w-6': size === 'md',
      'h-8 w-8': size === 'lg'
    }
  );

  switch (type) {
    case 'network':
      return <WifiOff className={iconClass} />;
    case 'database':
      return <Database className={iconClass} />;
    case 'auth':
      return <Shield className={iconClass} />;
    case 'access':
      return <Shield className={iconClass} />;
    case 'server':
      return <Server className={iconClass} />;
    case 'validation':
      return <AlertTriangle className={iconClass} />;
    default:
      return <AlertCircle className={iconClass} />;
  }
};

const getErrorTitle = (type: ErrorDisplayProps['type']) => {
  switch (type) {
    case 'network':
      return 'Connection Error';
    case 'database':
      return 'Database Error';
    case 'auth':
      return 'Authentication Error';
    case 'access':
      return 'Access Denied';
    case 'server':
      return 'Server Error';
    case 'validation':
      return 'Validation Error';
    default:
      return 'Error';
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  type = 'general',
  title,
  message,
  showRetry = true,
  retryText = 'Try Again',
  onRetry,
  isRetrying = false,
  size = 'md',
  variant = 'card',
  icon,
  className,
  actions
}) => {
  const displayTitle = title || getErrorTitle(type);
  const displayIcon = icon || getErrorIcon(type, size);

  const contentSizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const textSizes = {
    sm: {
      title: 'text-lg font-semibold',
      message: 'text-sm'
    },
    md: {
      title: 'text-xl font-semibold',
      message: 'text-base'
    },
    lg: {
      title: 'text-2xl font-bold',
      message: 'text-lg'
    }
  };

  const iconContainerSizes = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const ErrorContent = () => (
    <div className="text-center">
      {/* Icon */}
      <div className={cn(
        'inline-flex items-center justify-center rounded-full bg-red-500/20 backdrop-blur-sm border border-red-400/30 mb-4',
        iconContainerSizes[size]
      )}>
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-white mb-2',
        textSizes[size].title
      )}>
        {displayTitle}
      </h3>

      {/* Message */}
      <p className={cn(
        'text-white/80 mb-6 max-w-md mx-auto leading-relaxed',
        textSizes[size].message
      )}>
        {message}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="secondary"
            size={size}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-200"
          >
            <RefreshCw className={cn(
              'mr-2',
              {
                'h-3 w-3': size === 'sm',
                'h-4 w-4': size === 'md',
                'h-5 w-5': size === 'lg',
                'animate-spin': isRetrying
              }
            )} />
            {isRetrying ? 'Retrying...' : retryText}
          </Button>
        )}
        {actions}
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-400/20 backdrop-blur-sm',
        className
      )}>
        <div className="flex-shrink-0">
          {displayIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium">{displayTitle}</p>
          <p className="text-white/80 text-sm mt-1">{message}</p>
        </div>
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 flex-shrink-0"
          >
            <RefreshCw className={cn(
              'h-4 w-4',
              { 'animate-spin': isRetrying }
            )} />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className={cn(
        'flex items-center justify-center min-h-[calc(100vh-200px)]',
        className
      )}>
        <div className={contentSizes[size]}>
          <ErrorContent />
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={cn(
      'bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-400/30 backdrop-blur-sm shadow-lg',
      className
    )}>
      <CardContent className={contentSizes[size]}>
        <ErrorContent />
      </CardContent>
    </Card>
  );
};

// Convenience components for common error types
export const NetworkError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay type="network" {...props} />
);

export const DatabaseError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay type="database" {...props} />
);

export const AuthError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay type="auth" {...props} />
);

export const AccessDeniedError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay type="access" {...props} />
);

export const ServerError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay type="server" {...props} />
);

export const ValidationError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay type="validation" {...props} />
);
