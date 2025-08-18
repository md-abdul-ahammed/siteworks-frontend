# Loading Components Documentation

This document describes the improved loading components available in the application, their features, and usage examples.

## Overview

The application now includes several enhanced loading components designed to provide better user experience during loading states:

1. **LoadingSpinner** - Versatile spinner with multiple variants
2. **InlineLoader** - Small inline loading indicators
3. **PageLoading** - Full-page loading screen
4. **DashboardSkeleton** - Skeleton loading for dashboard layout
5. **ContentLoader** - Content-specific loading states

## Components

### 1. LoadingSpinner

A versatile loading spinner with multiple animation variants and sizes.

#### Props

```typescript
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "pulse" | "bars"
  className?: string
  text?: string
}
```

#### Variants

- **default**: Classic spinning circle
- **dots**: Three bouncing dots
- **pulse**: Pulsing circle
- **bars**: Four animated bars

#### Usage Examples

```tsx
// Basic usage
<LoadingSpinner />

// With custom size and variant
<LoadingSpinner size="lg" variant="dots" />

// With text
<LoadingSpinner 
  size="xl" 
  variant="default" 
  text="Loading your data..." 
/>

// All variants demonstration
<div className="flex space-x-4">
  <LoadingSpinner size="md" variant="default" />
  <LoadingSpinner size="md" variant="dots" />
  <LoadingSpinner size="md" variant="pulse" />
  <LoadingSpinner size="md" variant="bars" />
</div>
```

### 2. InlineLoader

Small loading indicators designed for inline use in buttons, forms, and other UI elements.

#### Props

```typescript
interface InlineLoaderProps {
  size?: "xs" | "sm" | "md"
  variant?: "spinner" | "dots" | "bars"
  className?: string
  text?: string
}
```

#### Usage Examples

```tsx
// In a button
<Button disabled={isLoading}>
  {isLoading ? (
    <InlineLoader size="sm" variant="dots" text="Saving..." />
  ) : (
    "Save Changes"
  )}
</Button>

// In a form field
<div className="flex items-center space-x-2">
  <span>Status:</span>
  {isLoading ? (
    <InlineLoader size="xs" variant="spinner" />
  ) : (
    <span>Ready</span>
  )}
</div>
```

### 3. PageLoading

Full-page loading screen with animated elements and customizable messaging.

#### Props

```typescript
interface PageLoadingProps {
  message?: string
  showCard?: boolean
}
```

#### Usage Examples

```tsx
// Basic usage
<PageLoading />

// Custom message
<PageLoading message="Initializing your workspace..." />

// Without card wrapper
<PageLoading showCard={false} message="Loading..." />
```

### 4. DashboardSkeleton

Comprehensive skeleton loading that matches the dashboard layout structure.

#### Features

- Animated skeleton elements with staggered delays
- Realistic chart and data visualizations
- Hover effects and shimmer animations
- Matches actual dashboard layout

#### Usage

```tsx
// Used automatically by UserOnlyRoute when useDashboardSkeleton={true}
<UserOnlyRoute useDashboardSkeleton={true}>
  <DashboardLayout>
    {/* Your content */}
  </DashboardLayout>
</UserOnlyRoute>
```

### 5. ContentLoader

Content-specific loading states for different types of content layouts.

#### Props

```typescript
interface ContentLoaderProps {
  type?: 'list' | 'grid' | 'table' | 'chart' | 'form' | 'card'
  items?: number
  className?: string
  showSpinner?: boolean
  message?: string
}
```

#### Content Types

- **list**: List items with avatars and text
- **grid**: Card grid layout
- **table**: Table with headers and rows
- **chart**: Chart area with animated bars
- **form**: Form fields with labels
- **card**: Card with header and content

#### Usage Examples

```tsx
// List loading
<ContentLoader type="list" items={5} />

// Grid loading
<ContentLoader type="grid" items={6} />

// Table loading
<ContentLoader type="table" items={10} />

// Chart loading
<ContentLoader type="chart" />

// Form loading
<ContentLoader type="form" items={4} />

// With spinner and message
<ContentLoader 
  type="list" 
  items={3} 
  showSpinner={true} 
  message="Loading users..." 
/>
```

## Best Practices

### 1. Choose the Right Component

- Use **LoadingSpinner** for general loading states
- Use **InlineLoader** for buttons and small UI elements
- Use **PageLoading** for full-page loading
- Use **DashboardSkeleton** for dashboard-specific loading
- Use **ContentLoader** for content-specific loading

### 2. Provide Context

Always provide meaningful text or context with loading states:

```tsx
// Good
<LoadingSpinner text="Loading your profile..." />

// Better
<LoadingSpinner text="Updating your billing information..." />
```

### 3. Use Appropriate Sizes

- **xs/sm**: For inline elements and buttons
- **md**: For general loading states
- **lg/xl**: For prominent loading displays

### 4. Consider Animation Performance

- Use staggered animations for multiple elements
- Avoid too many simultaneous animations
- Consider reducing motion for accessibility

### 5. Accessibility

All loading components are designed with accessibility in mind:

- Proper ARIA labels
- Reduced motion support
- Keyboard navigation friendly
- Screen reader compatible

## Integration Examples

### Dashboard Loading State

```tsx
const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading) {
    return (
      <UserOnlyRoute useDashboardSkeleton={true}>
        <DashboardLayout>
          <div className="text-center py-12">
            <LoadingSpinner 
              size="xl" 
              variant="dots" 
              text="Loading your dashboard..." 
            />
          </div>
        </DashboardLayout>
      </UserOnlyRoute>
    );
  }

  return (
    <UserOnlyRoute useDashboardSkeleton={true}>
      <DashboardLayout>
        {/* Your dashboard content */}
      </DashboardLayout>
    </UserOnlyRoute>
  );
};
```

### Form Submission Loading

```tsx
const ProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await updateProfile(data);
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <InlineLoader size="sm" variant="dots" text="Saving..." />
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
};
```

### Content Loading States

```tsx
const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2>Users</h2>
        <ContentLoader 
          type="list" 
          items={5} 
          showSpinner={true} 
          message="Loading users..." 
        />
      </div>
    );
  }

  return (
    <div>
      <h2>Users</h2>
      {/* Render actual user list */}
    </div>
  );
};
```

## Customization

All loading components can be customized using Tailwind CSS classes:

```tsx
// Custom styling
<LoadingSpinner 
  className="text-blue-500" 
  size="lg" 
  variant="dots" 
/>

// Custom content loader
<ContentLoader 
  type="list" 
  items={3} 
  className="bg-gray-50 p-4 rounded-lg" 
/>
```

## Performance Considerations

1. **Bundle Size**: All loading components are tree-shakeable
2. **Animation Performance**: Uses CSS transforms and opacity for smooth animations
3. **Memory Usage**: Minimal memory footprint with efficient rendering
4. **Accessibility**: Built with accessibility best practices

## Migration Guide

If you're updating from the old loading components:

1. Replace basic `<LoadingSpinner />` with enhanced version
2. Update `PageLoading` usage to include new props
3. Replace custom skeleton loading with `ContentLoader`
4. Use `InlineLoader` for button and form loading states

The new components are backward compatible with existing usage patterns while providing enhanced functionality and better user experience.
