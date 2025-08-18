import { toast } from 'sonner';

// Professional toast utility functions
export const showToast = {
  // Success messages - Green
  success: (message: string) => {
    toast.success(message);
  },

  // Error messages - Red
  error: (message: string) => {
    toast.error(message);
  },

  // Warning messages - Orange/Amber
  warning: (message: string) => {
    toast.warning(message);
  },

  // Info messages - Blue
  info: (message: string) => {
    toast.info(message);
  },

  // Loading messages - Gray
  loading: (message: string) => {
    toast.loading(message);
  },

  // Dismiss current toast
  dismiss: () => {
    toast.dismiss();
  },

  // Promise-based toast
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Common toast messages for consistency
export const toastMessages = {
  // Authentication
  auth: {
    signInSuccess: 'Successfully signed in!',
    signUpSuccess: 'Account created successfully!',
    logoutSuccess: 'Successfully logged out',
    logoutInfo: 'Logged out',
    profileUpdated: 'Profile updated successfully!',
    passwordResetSent: 'If an account with this email exists, a password reset link has been sent.',
    passwordResetSuccess: 'Password reset successfully. Please log in with your new password.',
    passwordChanged: 'Password changed successfully. Please log in with your new password.',
    emailAlreadyExists: 'An account with this email already exists.',
    phoneAlreadyExists: 'Phone number is already registered',
    accountDeactivated: 'Your account has been deactivated. Please contact support.',
    invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
    sessionExpired: 'Your session has expired. Please log in again.',
    currentPasswordIncorrect: 'Current password is incorrect.',
    invalidResetToken: 'Invalid or expired reset token. Please request a new password reset.',
    emailTaken: 'This email is already taken by another user. Please use a different email.',
  },

  // Direct Debit / Billing
  billing: {
    directDebitSetupSuccess: 'Account created successfully! Direct Debit has been set up.',
    directDebitSetupPending: 'Account created successfully! Direct Debit setup will be completed later.',
    directDebitSetupInfo: 'Account created successfully! You can set up Direct Debit in your dashboard.',
    directDebitSetupFailed: 'Direct Debit setup failed, but your account was created. You can set up Direct Debit in your dashboard.',
    paymentCustomerFailed: 'Failed to create payment customer. Please verify your bank details.',
    invalidBankDetails: 'Invalid bank account details. Please verify your routing and account numbers.',
    mandateCreationFailed: 'Direct Debit mandate creation failed. You can complete this in your dashboard.',
  },

  // User Management
  users: {
    userUpdated: 'User profile updated successfully!',
    userUpdateFailed: 'Failed to update user',
    validationErrors: 'Please fix validation errors before saving',
    networkError: 'Network error. Please check your internet connection and try again.',
    serviceUnavailable: 'Service temporarily unavailable. Please try again later.',
    tooManyRequests: 'Too many requests. Please wait a moment and try again.',
    requestTimeout: 'Request timeout. Please try again.',
  },

  // Form Validation
  validation: {
    checkInput: 'Please check your input and try again.',
    emailCheckError: 'Error checking email availability',
    phoneCheckError: 'Error checking phone availability',
  },
};

// Export default for convenience
export default showToast;
