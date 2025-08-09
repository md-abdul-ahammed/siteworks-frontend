'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Shield, 
  Users, 
  DollarSign,
  CreditCard,
  UserCheck,
  UserX,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import TransactionChart from '@/components/TransactionChart';
import TransactionSummary from '@/components/TransactionSummary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    usersWithGoCardless: number;
    recentRegistrations: number;
    totalRevenue: number;
    totalTransactions: number;
  };
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
    goCardlessCustomerId?: string;
    mandateStatus?: string;
  }>;
}

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 AdminDashboardPage useEffect - user:', user);
    console.log('🔍 AdminDashboardPage useEffect - isLoading:', isLoading);
    console.log('🔍 AdminDashboardPage useEffect - user role:', user?.role);
    
    if (user && user.role === 'admin') {
      console.log('✅ User is admin, fetching dashboard data...');
      fetchDashboardData();
    } else if (!isLoading && user && user.role !== 'admin') {
      console.log('❌ User is not admin, redirecting...');
      router.push('/dashboard');
    } else if (!isLoading && !user) {
      console.log('❌ No user found, redirecting to sign-in...');
      router.push('/sign-in');
    }
  }, [user, isLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const authTokens = localStorage.getItem('auth_tokens');
      const token = authTokens ? JSON.parse(authTokens).accessToken : null;
      
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.dashboard);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-white mb-2">Loading dashboard...</p>
            <p className="text-sm text-white">Please wait while we fetch your data</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                    {getInitials(user?.firstName || '', user?.lastName || '')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-blue-100">Platform overview and user management</p>
                  <div className="flex items-center mt-2">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm text-blue-100">Administrator</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <Activity className="h-8 w-8 text-white/80" />
                <div className="text-right">
                  <p className="text-sm text-blue-100">System Status</p>
                  <p className="text-lg font-semibold">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-card-foreground">{dashboardData.overview.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{dashboardData.overview.recentRegistrations} this month</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold text-card-foreground">{dashboardData.overview.activeUsers}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {((dashboardData.overview.activeUsers / dashboardData.overview.totalUsers) * 100).toFixed(1)}% of total
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {formatCurrency(dashboardData.overview.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {dashboardData.overview.totalTransactions} transactions
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* GoCardless Users */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Direct Debit Users</p>
                    <p className="text-2xl font-bold text-card-foreground">{dashboardData.overview.usersWithGoCardless}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {((dashboardData.overview.usersWithGoCardless / dashboardData.overview.totalUsers) * 100).toFixed(1)}% of users
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-400 mr-2" />
                  User Growth
                </CardTitle>
                <div className="text-sm text-muted-foreground">Last 6 months</div>
              </div>
            </CardHeader>
            <CardContent>
              <TransactionChart 
                type="line" 
                title="" 
                height={300}
              />
            </CardContent>
          </Card>

          {/* User Status Distribution */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <PieChart className="h-6 w-6 text-green-400 mr-2" />
                User Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionChart 
                type="pie" 
                title="" 
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trends */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <BarChart3 className="h-6 w-6 text-purple-400 mr-2" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionChart 
                type="bar" 
                title="" 
                height={300}
              />
            </CardContent>
          </Card>

          {/* Platform Activity */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <Activity className="h-6 w-6 text-indigo-400 mr-2" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionChart 
                type="area" 
                title="" 
                height={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Users */}
        {dashboardData && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-card-foreground">Recent Users</CardTitle>
                  <p className="text-muted-foreground">Latest user registrations</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/users')}
                >
                  View All Users
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.companyName && (
                          <p className="text-sm text-muted-foreground">{user.companyName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {user.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                        {user.isVerified ? (
                          <Badge variant="outline">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                        {user.goCardlessCustomerId && (
                          <Badge variant="outline">Direct Debit</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
