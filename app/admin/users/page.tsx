'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Users, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Shield,
  LogOut,
  AlertCircle,
  RefreshCw,
  Database,
  LogIn,
  Calendar,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { usePhoneValidation } from '@/hooks/usePhoneValidation';
import { useEmailValidation } from '@/hooks/useEmailValidation';

// Validation schema for user edit form (matching signup form exactly)
const userEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  companyName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postcode: z.string().optional(),
});

type UserEditForm = z.infer<typeof userEditSchema>;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  goCardlessCustomerId?: string;
  goCardlessBankAccountId?: string;
  goCardlessMandateId?: string;
  mandateStatus?: string;
  openPhoneContactId?: string;
  countryOfResidence: string;
  city: string;
  addressLine1?: string;
  addressLine2?: string;
  state?: string;
  postcode?: string;
}

interface ErrorState {
  type: 'database' | 'auth' | 'network' | 'unknown';
  message: string;
  retryable: boolean;
}

export default function AdminUsersPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Validation hooks
  const { isCheckingUniqueness, uniquenessError, checkPhoneUniqueness, clearUniquenessError } = usePhoneValidation();
  const { isCheckingAvailability, availabilityError, isEmailValid, checkEmailAvailability, clearAvailabilityError } = useEmailValidation();

  // React Hook Form setup
  const editForm = useForm<UserEditForm>({
    resolver: zodResolver(userEditSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postcode: '',
    }
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = editForm;

  // Validation handlers for email and phone
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setValue('email', emailValue, { shouldValidate: true });
    
    // Check email availability only if it's different from the current user's email
    if (emailValue && emailValue.trim().length > 0 && editingUser && emailValue !== editingUser.email) {
      checkEmailAvailability(emailValue);
    } else {
      clearAvailabilityError();
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value;
    setValue('phone', phoneValue, { shouldValidate: true });
    
    // Check phone uniqueness only if it's different from the current user's phone
    if (phoneValue && phoneValue.trim().length > 0 && editingUser && phoneValue !== editingUser.phone) {
      checkPhoneUniqueness(phoneValue);
    } else {
      clearUniquenessError();
    }
  };

  useEffect(() => {
    console.log('🔍 Admin users page useEffect - user:', user);
    console.log('🔍 Admin users page useEffect - isLoading:', isLoading);
    console.log('🔍 Admin users page useEffect - user role:', user?.role);
    
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      console.log('❌ No user found, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }

    // If user is not admin, redirect to dashboard
    if (user && user.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    // Only fetch users if user is admin
    if (user?.role === 'admin') {
      console.log('✅ User is admin, fetching users');
      fetchUsers();
    }
  }, [user, isLoading, currentPage, searchTerm, startDate, endDate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      console.log('🔍 Fetching users with params:', params.toString());
      console.log('🔑 Auth headers:', authService.getAuthHeaders());

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: authService.getAuthHeaders()
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (response.status === 401) {
          setError({
            type: 'auth',
            message: 'Authentication failed. Please log in again.',
            retryable: false
          });
          logout();
          router.push('/sign-in');
          return;
        }
        
        if (response.status === 500) {
          setError({
            type: 'database',
            message: 'Database connection error. Please try again.',
            retryable: true
          });
          return;
        }
        
        setError({
          type: 'unknown',
          message: errorData.error || 'Failed to fetch users',
          retryable: true
        });
        return;
      }

      const data = await response.json();
      console.log('✅ Users data:', data);
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError({
        type: 'network',
        message: 'Network error. Please check your connection and try again.',
        retryable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    setRetryCount(prev => prev + 1);
    fetchUsers();
  };



  const startEditing = (user: User) => {
    setEditingUser(user);
    // Clear validation errors when starting to edit
    clearAvailabilityError();
    clearUniquenessError();
    reset({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      companyName: user.companyName || '',
      email: user.email || '',
      phone: user.phone || '',
      addressLine1: user.addressLine1 || '',
      addressLine2: user.addressLine2 || '',
      city: user.city || '',
      state: user.state || '',
      postcode: user.postcode || '',
    });
    setIsEditing(true);
  };

  const saveUserEdit = async (formData: UserEditForm) => {
    if (!editingUser) return;
    
    // Check for validation errors before submitting
    if (availabilityError || uniquenessError) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      setEditLoading(true);
      const response = await fetch(`/api/admin/users/${editingUser.id}/profile`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ User updated successfully:', data);
        
        // Log integration status
        if (data.gocardlessUpdated) {
          console.log('✅ GoCardless customer updated successfully');
        }
        if (data.openPhoneSynced) {
          console.log('✅ OpenPhone contact synced successfully');
        }
        if (data.phoneChanged && data.phoneUpdateMessageSent) {
          console.log('✅ Phone update message sent successfully');
        }
        
        // Update the users list with the new data
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === editingUser.id 
              ? { ...user, ...formData }
              : user
          )
        );
        
        // Show success toast with integration status
        let successMessage = 'User profile updated successfully!';
        const integrations = [];
        if (data.gocardlessUpdated) integrations.push('GoCardless');
        if (data.openPhoneSynced) integrations.push('OpenPhone');
        if (data.phoneChanged && data.phoneUpdateMessageSent) integrations.push('Phone Update Message');
        
        if (integrations.length > 0) {
          successMessage += `\n\nIntegrations updated: ${integrations.join(', ')}`;
        }
        
        toast.success(successMessage);
        
        setIsEditing(false);
        setEditingUser(null);
        // Clear validation errors after successful save
        clearAvailabilityError();
        clearUniquenessError();
        reset();
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to update user:', errorData);
        toast.error('Failed to update user: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      toast.error('Error updating user. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingUser(null);
    // Clear validation errors when canceling
    clearAvailabilityError();
    clearUniquenessError();
    reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };



  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white mb-2">Loading...</p>
          <p className="text-sm text-white">Checking authentication</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">Please log in to access the admin dashboard.</p>
          <Button onClick={() => router.push('/sign-in')}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos;t have permission to access the admin dashboard.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent rounded-lg">
                  <Users className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground">Users</h1>
                  <p className="text-muted-foreground mt-1">Manage and monitor all registered users</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{users.length} users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-800">
                    {error.type === 'database' && 'Database Connection Error'}
                    {error.type === 'auth' && 'Authentication Error'}
                    {error.type === 'network' && 'Network Error'}
                    {error.type === 'unknown' && 'Error'}
                  </h3>
                  <p className="text-sm text-red-600 mt-1">{error.message}</p>
                </div>
                {error.retryable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryFetch}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 bg-background border-border focus:ring-2 focus:ring-ring focus:border-ring"
                    autoComplete="off"
                    spellCheck="false"
                    data-form-type="other"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 h-10 bg-background border-border focus:ring-2 focus:ring-ring focus:border-ring"
                    autoComplete="off"
                    data-form-type="other"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 h-10 bg-background border-border focus:ring-2 focus:ring-ring focus:border-ring"
                    autoComplete="off"
                    data-form-type="other"
                  />
                </div>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            {(searchTerm || startDate || endDate) && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/billing">View Billing</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-white mb-2">Loading users...</p>
                  <p className="text-sm text-white">Please wait while we fetch user data</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">Unable to load users</h3>
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  {error.retryable && (
                    <Button onClick={retryFetch} disabled={loading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-card-foreground mb-2">No users found</h3>
                  <p className="text-muted-foreground">No users match your current filters.</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-card-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-muted-foreground">{user.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.companyName || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(user.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                          </div>
                        </TableCell>
                                                 <TableCell className="text-right">
                           <div className="flex items-center justify-end space-x-2">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setSelectedUser(user)}
                               title="View Details"
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => startEditing(user)}
                               title="Edit User"
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !error && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
                         )}
           </CardContent>
         </Card>

         {/* Edit User Dialog */}
         <Dialog open={isEditing} onOpenChange={setIsEditing}>
           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
               <DialogTitle className="flex items-center space-x-2">
                 <Edit className="h-5 w-5" />
                 <span>Edit User Profile</span>
               </DialogTitle>
               <DialogDescription>
                 Update user information. All changes will be saved immediately.
               </DialogDescription>
             </DialogHeader>
             
             <div className="space-y-6">
               {/* Personal Information */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                 
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="email">Email Address</Label>
                     <Input
                       {...register("email")}
                       type="email"
                       id="email"
                       placeholder="Enter email address"
                       onChange={handleEmailChange}
                     />
                     {availabilityError && <p className="text-xs text-red-600">{availabilityError}</p>}
                     {!availabilityError && errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                     {isCheckingAvailability && (
                       <p className="text-xs text-gray-600 flex items-center gap-1">
                         <svg className="h-3 w-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                           <path
                             fillRule="evenodd"
                             d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                             clipRule="evenodd"
                           />
                         </svg>
                         Checking email availability...
                       </p>
                     )}
                     {!availabilityError && !isCheckingAvailability && watch('email') && isEmailValid && (
                       <p className="text-xs text-gray-600 flex items-center gap-1">
                         <svg className="h-3 w-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                           <path
                             fillRule="evenodd"
                             d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                             clipRule="evenodd"
                           />
                         </svg>
                         Email is available
                       </p>
                     )}
                   </div>

                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     <div className="space-y-2">
                       <Label htmlFor="firstName">First Name</Label>
                       <Input {...register("firstName")} type="text" id="firstName" placeholder="Enter first name" />
                       {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
                     </div>

                     <div className="space-y-2">
                       <Label htmlFor="lastName">Last Name</Label>
                       <Input {...register("lastName")} type="text" id="lastName" placeholder="Enter last name" />
                       {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
                     </div>
                   </div>

                   <div className="mt-4 space-y-2">
                     <Label htmlFor="companyName">
                       Company Name <span className="text-gray-500">(optional)</span>
                     </Label>
                     <Input {...register("companyName")} type="text" id="companyName" placeholder="Enter company name" />
                     {errors.companyName && <p className="text-xs text-red-600">{errors.companyName.message}</p>}
                   </div>

                   <div className="mt-4 space-y-2">
                     <Label htmlFor="phone">Phone Number</Label>
                     <Input
                       {...register("phone")}
                       type="tel"
                       id="phone"
                       placeholder="Enter phone number"
                       onChange={handlePhoneChange}
                     />
                     {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                     {uniquenessError && <p className="text-xs text-red-600">{uniquenessError}</p>}
                     {isCheckingUniqueness && (
                       <p className="text-xs text-gray-600 flex items-center gap-1">
                         <svg className="h-3 w-3 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                           <path
                             fillRule="evenodd"
                             d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                             clipRule="evenodd"
                           />
                         </svg>
                         Checking phone uniqueness...
                       </p>
                     )}
                   </div>


                 </div>
               </div>

               {/* Address Information */}
               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                 
                 <div className="space-y-4">
                   {/* Billing Address Line 1 */}
                   <div className="space-y-2">
                     <Label htmlFor="addressLine1">Billing address line 1</Label>
                     <Input
                       {...register("addressLine1")}
                       type="text"
                       id="addressLine1"
                       placeholder="Enter billing address"
                     />
                     {errors.addressLine1 && <p className="text-xs text-red-600">{errors.addressLine1.message}</p>}
                   </div>

                   {/* Billing Address Line 2 */}
                   <div className="space-y-2">
                     <Label htmlFor="addressLine2">
                       Billing address line 2 <span className="text-gray-500">(optional)</span>
                     </Label>
                     <Input
                       {...register("addressLine2")}
                       type="text"
                       id="addressLine2"
                       placeholder="Enter additional address details"
                     />
                     {errors.addressLine2 && <p className="text-xs text-red-600">{errors.addressLine2.message}</p>}
                   </div>

                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                     {/* City */}
                     <div className="space-y-2">
                       <Label htmlFor="city">Town or City</Label>
                       <Input
                         {...register("city")}
                         type="text"
                         id="city"
                         placeholder="Enter city"
                       />
                       {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
                     </div>

                     {/* State */}
                     <div className="space-y-2">
                       <Label htmlFor="state">
                         State/Province <span className="text-gray-500">(optional)</span>
                       </Label>
                       <Input
                         {...register("state")}
                         type="text"
                         id="state"
                         placeholder="Enter state"
                       />
                       {errors.state && <p className="text-xs text-red-600">{errors.state.message}</p>}
                     </div>
                   </div>

                   {/* Postcode - Separate row */}
                   <div className="space-y-2">
                     <Label htmlFor="postcode">Postcode/Zipcode</Label>
                     <Input
                       {...register("postcode")}
                       type="text"
                       id="postcode"
                       placeholder="Enter postcode"
                     />
                     {errors.postcode && <p className="text-xs text-red-600">{errors.postcode.message}</p>}
                   </div>
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-end space-x-3 pt-6">
               <Button
                 variant="outline"
                 onClick={cancelEdit}
                 disabled={editLoading}
                 className="px-6"
               >
                 <X className="h-4 w-4 mr-2" />
                 Cancel
               </Button>
               <Button
                 onClick={handleSubmit(saveUserEdit)}
                 disabled={editLoading}
                 className="px-6"
               >
                 {editLoading ? (
                   <>
                     <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                     Saving...
                   </>
                 ) : (
                   <>
                     <Save className="h-4 w-4 mr-2" />
                     Save Changes
                   </>
                 )}
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div>
     </AdminLayout>
   );
 }
