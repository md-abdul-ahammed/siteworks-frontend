'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, ApiError } from '@/lib/auth';
import { toast } from 'sonner';
import { CustomerDetailsForm } from '@/app/sign-up/types/customer';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signUpCustomer: (customerData: CustomerDetailsForm) => Promise<void>;
  logout: () => Promise<void>;
  logoutFromAllDevices: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<{ email: string; firstName: string; lastName: string }>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('🔧 Initializing authentication...');
        
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          console.log('✅ User has valid token, fetching current user...');
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            console.log('👤 Current user found:', currentUser);
            setUser(currentUser);
          } else {
            console.log('❌ No current user found, clearing auth state...');
            // Token is invalid, clear auth state
            await authService.logout();
          }
        } else {
          console.log('❌ User not authenticated - token may be expired or invalid');
          // Clear any invalid tokens
          await authService.logout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear auth state on any error
        await authService.logout();
      } finally {
        setIsLoading(false);
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const handleError = (error: unknown): void => {
    console.error('Auth error:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const apiError = error as ApiError;
      
      switch (apiError.code) {
        case 'INVALID_CREDENTIALS':
          setError('Invalid email or password. Please check your credentials and try again.');
          toast.error('Invalid email or password. Please check your credentials and try again.');
          break;
        case 'USER_EXISTS':
          setError('An account with this email already exists.');
          toast.error('An account with this email already exists.');
          break;
        case 'ACCOUNT_DEACTIVATED':
          setError('Your account has been deactivated. Please contact support.');
          toast.error('Your account has been deactivated. Please contact support.');
          break;
        case 'VALIDATION_ERROR':
          if (apiError.details && Array.isArray(apiError.details)) {
            const validationErrors = apiError.details.map((detail: { msg: string }) => detail.msg).join(', ');
            const errorMsg = `Please check your input: ${validationErrors}`;
            setError(errorMsg);
            toast.error(errorMsg);
          } else {
            setError('Please check your input and try again.');
            toast.error('Please check your input and try again.');
          }
          break;
        case 'NETWORK_ERROR':
          setError('Network error. Please check your internet connection and try again.');
          toast.error('Network error. Please check your internet connection and try again.');
          break;
        case 'TOKEN_EXPIRED':
          setError('Your session has expired. Please log in again.');
          toast.error('Your session has expired. Please log in again.');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          setError('Too many requests. Please wait a moment and try again.');
          toast.error('Too many requests. Please wait a moment and try again.');
          break;
        case 'DATABASE_UNAVAILABLE':
          setError('Service temporarily unavailable. Please try again later.');
          toast.error('Service temporarily unavailable. Please try again later.');
          break;
        case 'INVALID_REFRESH_TOKEN':
          setError('Session expired. Please log in again.');
          toast.error('Session expired. Please log in again.');
          break;
        case 'INVALID_CURRENT_PASSWORD':
          setError('Current password is incorrect.');
          toast.error('Current password is incorrect.');
          break;
        case 'INVALID_RESET_TOKEN':
          setError('Invalid or expired reset token. Please request a new password reset.');
          toast.error('Invalid or expired reset token. Please request a new password reset.');
          break;
        case 'TIMEOUT_ERROR':
          setError('Request timeout. Please try again.');
          toast.error('Request timeout. Please try again.');
          break;
        case 'GOCARDLESS_SETUP_FAILED':
          setError('GoCardless Direct Debit setup failed. Your account was created successfully, but you may need to set up Direct Debit later.');
          toast.error('GoCardless setup failed, but your account was created. You can set up Direct Debit in your dashboard.');
          break;
        case 'GOCARDLESS_CUSTOMER_FAILED':
          setError('Failed to create GoCardless customer. Please check your bank details and try again.');
          toast.error('Failed to create GoCardless customer. Please verify your bank details.');
          break;
        case 'GOCARDLESS_BANK_ACCOUNT_FAILED':
          setError('Invalid bank account details. Please check your routing number and account number.');
          toast.error('Invalid bank account details. Please verify your routing and account numbers.');
          break;
        case 'GOCARDLESS_MANDATE_FAILED':
          setError('Failed to create Direct Debit mandate. Your account was created, but Direct Debit setup needs to be completed later.');
          toast.error('Direct Debit mandate creation failed. You can complete this in your dashboard.');
          break;
        default:
          const errorMsg = apiError.error || 'An unexpected error occurred. Please try again.';
          setError(errorMsg);
          toast.error(errorMsg);
      }
    } else if (error && typeof error === 'string') {
      setError(error);
      toast.error(error);
    } else {
      const errorMsg = 'An unexpected error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const clearError = React.useCallback((): void => {
    setError(null);
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await authService.signIn(email, password);
      setUser(response.customer); // Backend returns 'customer' not 'user'
      
      toast.success('Successfully signed in!', {
        style: {
          backgroundColor: '#6b7280',
          color: 'white',
          border: '1px solid #4b5563'
        }
      });
      
      // Debug logging
      console.log('🔐 Sign in successful:', response.customer);
      console.log('🔄 Setting user state and redirecting to dashboard...');
      
      // Wait a bit for state to update before redirecting
      setTimeout(() => {
        console.log('🚀 Redirecting to dashboard...');
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await authService.signUp(email, password, name);
      setUser(response.customer); // Backend returns 'customer' not 'user'
      
      toast.success('Account created successfully!', {
        style: {
          backgroundColor: '#6b7280',
          color: 'white',
          border: '1px solid #4b5563'
        }
      });
      
      // Wait a bit for state to update before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpCustomer = async (customerData: CustomerDetailsForm): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const response = await authService.signUpCustomer(customerData);
      setUser(response.customer); // Backend returns 'customer' not 'user'
      
      // Check GoCardless status and show appropriate success message
      const customer = response.customer;
      if (customer.goCardlessCustomerId && customer.goCardlessBankAccountId && customer.goCardlessMandateId) {
        // Full GoCardless setup successful
        toast.success('Account created successfully! Direct Debit has been set up.', {
          style: {
            backgroundColor: '#10b981',
            color: 'white',
            border: '1px solid #059669'
          }
        });
      } else if (customerData.accountHolderName || customerData.bankCode || customerData.accountNumber) {
        // Bank details were provided but GoCardless setup failed
        toast.success('Account created successfully! Direct Debit setup will be completed later.', {
          style: {
            backgroundColor: '#f59e0b',
            color: 'white',
            border: '1px solid #d97706'
          }
        });
      } else {
        // No bank details provided
        toast.success('Account created successfully! You can set up Direct Debit in your dashboard.', {
          style: {
            backgroundColor: '#6b7280',
            color: 'white',
            border: '1px solid #4b5563'
          }
        });
      }
      
      // Wait a bit for state to update before redirecting
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      toast.success('Successfully logged out', {
        style: {
          backgroundColor: '#6b7280',
          color: 'white',
          border: '1px solid #4b5563'
        }
      });
      router.push('/sign-in');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear local state
      setUser(null);
      toast.info('Logged out', {
        style: {
          backgroundColor: '#6b7280',
          color: 'white',
          border: '1px solid #4b5563'
        }
      });
      router.push('/sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const logoutFromAllDevices = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logoutFromAllDevices();
      setUser(null);
      router.push('/sign-in');
    } catch (error) {
      console.error('Error during logout from all devices:', error);
      // Even if logout fails, clear local state
      setUser(null);
      router.push('/sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      await authService.changePassword(currentPassword, newPassword);
      setUser(null);
      router.push('/sign-in');
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      await authService.forgotPassword(email);
      
      toast.success('If an account with this email exists, a password reset link has been sent.', {
        style: {
          backgroundColor: '#6b7280',
          color: 'white',
          border: '1px solid #4b5563'
        }
      });
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      await authService.resetPassword(token, newPassword);
      
      toast.success('Password reset successfully. Please log in with your new password.', {
        style: {
          backgroundColor: '#6b7280',
          color: 'white',
          border: '1px solid #4b5563'
        }
      });
      
      // Redirect to sign-in page
      router.push('/sign-in');
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetToken = React.useCallback(async (token: string): Promise<{ email: string; firstName: string; lastName: string }> => {
    try {
      clearError();
      
      const response = await authService.verifyResetToken(token);
      return response.customer;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [clearError]);

  // Debug user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
    console.log('🔐 isAuthenticated:', !!user);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signUpCustomer,
    logout,
    logoutFromAllDevices,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyResetToken,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 