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
  LogIn
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

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
}

interface ErrorState {
  type: 'database' | 'auth' | 'network' | 'unknown';
  message: string;
  retryable: boolean;
}

export default function UserDashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [goCardlessFilter, setGoCardlessFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('🔍 Admin page useEffect - user:', user);
    console.log('🔍 Admin page useEffect - isLoading:', isLoading);
    console.log('🔍 Admin page useEffect - user role:', user?.role);
    
    // Wait for loading to complete
    if (isLoading) {
      return;
    }
    
    // If no user, redirect to login
    if (!user) {
      console.log('❌ No user found, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }

    // If user is not admin, redirect to dashboard
    if (user.role !== 'admin') {
      console.log('❌ User is not admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    // Redirect admin to dashboard by default
    if (user.role === 'admin') {
      console.log('✅ User is admin, redirecting to admin dashboard');
      router.push('/admin/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { status: statusFilter }),
        ...(verifiedFilter && verifiedFilter !== 'all' && { verified: verifiedFilter }),
        ...(goCardlessFilter && goCardlessFilter !== 'all' && { hasGoCardless: goCardlessFilter })
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

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      if (response.ok) {
        fetchUsers();
      } else {
        console.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const updateUserVerification = async (userId: string, isVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          ...authService.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified })
      });
      if (response.ok) {
        fetchUsers();
      } else {
        console.error('Failed to update user verification');
      }
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (!user.isVerified) {
      return <Badge variant="secondary">Unverified</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="verified">Verification</Label>
                <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gocardless">GoCardless</Label>
                <Select value={goCardlessFilter} onValueChange={setGoCardlessFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="true">With GoCardless</SelectItem>
                    <SelectItem value="false">Without GoCardless</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                <Link href="/admin/zoho-invoices">View Zoho Invoices</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-border"></div>
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
                      <TableHead>Status</TableHead>
                      <TableHead>GoCardless</TableHead>
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
                          <div className="flex flex-col space-y-1">
                            {getStatusBadge(user)}
                            <div className="flex space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => updateUserStatus(user.id, !user.isActive)}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={() => updateUserVerification(user.id, !user.isVerified)}
                              >
                                {user.isVerified ? 'Unverify' : 'Verify'}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.goCardlessCustomerId ? (
                            <div className="text-sm">
                              <Badge variant="outline">Connected</Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                {user.mandateStatus || 'No mandate'}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">Not Connected</Badge>
                          )}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
      </div>
    </AdminLayout>
  );
} 