# Professional Toast System

This document describes the new professional toast notification system implemented across the SiteWorks website.

## Overview

The toast system has been upgraded to use professional colors and consistent styling across the entire application. All toasts now use the Sonner library with custom styling for a cohesive user experience.

## Color Scheme

### Success Messages
- **Color**: Green (#10b981)
- **Border**: Darker green (#059669)
- **Use Case**: Successful operations, confirmations, positive feedback

### Error Messages
- **Color**: Red (#ef4444)
- **Border**: Darker red (#dc2626)
- **Use Case**: Errors, failures, validation issues

### Warning Messages
- **Color**: Orange/Amber (#f59e0b)
- **Border**: Darker orange (#d97706)
- **Use Case**: Warnings, partial successes, attention needed

### Info Messages
- **Color**: Blue (#3b82f6)
- **Border**: Darker blue (#2563eb)
- **Use Case**: Information, tips, neutral notifications

## Implementation

### Global Configuration

The toast system is configured globally in `frontend/app/layout.tsx`:

```tsx
<Toaster 
  position="bottom-right" 
  richColors
  toastOptions={{
    style: {
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid',
    },
    // ... color configurations for each type
  }}
/>
```

### Toast Utility

A centralized toast utility is available at `frontend/lib/toast.ts`:

```tsx
import { showToast, toastMessages } from '@/lib/toast';

// Basic usage
showToast.success('Operation completed successfully!');
showToast.error('Something went wrong!');
showToast.warning('Please check your input.');
showToast.info('Here is some information.');

// Using predefined messages
showToast.success(toastMessages.auth.signInSuccess);
showToast.error(toastMessages.auth.invalidCredentials);
```

### Predefined Messages

Common toast messages are centralized in the `toastMessages` object:

#### Authentication Messages
- `auth.signInSuccess`
- `auth.signUpSuccess`
- `auth.logoutSuccess`
- `auth.profileUpdated`
- `auth.passwordResetSuccess`
- `auth.invalidCredentials`
- `auth.sessionExpired`
- And more...

#### Billing Messages
- `billing.directDebitSetupSuccess`
- `billing.directDebitSetupPending`
- `billing.directDebitSetupInfo`
- `billing.paymentCustomerFailed`
- And more...

#### User Management Messages
- `users.userUpdated`
- `users.validationErrors`
- `users.networkError`
- And more...

## Usage Examples

### Basic Toast
```tsx
import { showToast } from '@/lib/toast';

showToast.success('Your profile has been updated!');
showToast.error('Failed to save changes.');
showToast.warning('Some features may be limited.');
showToast.info('New features are available.');
```

### Using Predefined Messages
```tsx
import { showToast, toastMessages } from '@/lib/toast';

// Authentication
showToast.success(toastMessages.auth.signInSuccess);
showToast.error(toastMessages.auth.invalidCredentials);

// Billing
showToast.success(toastMessages.billing.directDebitSetupSuccess);
showToast.warning(toastMessages.billing.directDebitSetupPending);

// User Management
showToast.success(toastMessages.users.userUpdated);
showToast.error(toastMessages.users.validationErrors);
```

### Promise-based Toasts
```tsx
import { showToast } from '@/lib/toast';

const saveData = async () => {
  const promise = fetch('/api/save', { method: 'POST' });
  
  showToast.promise(promise, {
    loading: 'Saving your changes...',
    success: 'Changes saved successfully!',
    error: 'Failed to save changes. Please try again.',
  });
};
```

## Migration Guide

### Before (Old System)
```tsx
import { toast } from 'sonner';

toast.success('Success message', {
  style: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: '1px solid #4b5563'
  }
});
```

### After (New System)
```tsx
import { showToast } from '@/lib/toast';

showToast.success('Success message');
// or
showToast.success(toastMessages.auth.signInSuccess);
```

## Testing

A test page is available at `/test-toast` to demonstrate all toast types and verify the styling.

## Benefits

1. **Consistency**: All toasts use the same professional styling
2. **Maintainability**: Centralized message management
3. **Professional Appearance**: Modern, clean design with appropriate colors
4. **Type Safety**: TypeScript support for predefined messages
5. **Easy Migration**: Simple import change for existing code

## Files Modified

- `frontend/app/layout.tsx` - Global toast configuration
- `frontend/lib/toast.ts` - Toast utility and message definitions
- `frontend/contexts/AuthContext.tsx` - Updated all toast calls
- `frontend/app/admin/users/page.tsx` - Updated toast calls
- `frontend/app/sign-in/page.tsx` - Updated toast calls
- `frontend/app/forgot-password/page.tsx` - Updated toast calls
- `frontend/app/sign-up/hooks/useMultiStepForm.ts` - Updated toast calls
- `frontend/app/test-toast/page.tsx` - Test page for demonstrations

## Future Enhancements

- Add toast duration customization
- Implement toast queuing for better UX
- Add toast action buttons
- Support for custom toast themes

