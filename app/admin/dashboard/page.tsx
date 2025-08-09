'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ArrowUpRight,
  PieChart as PieChartIcon
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

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

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  dueDate: string;
  createdDate: string;
}

interface ChartData {
  monthlyData: Array<{
    month: string;
    paid: number;
    pending: number;
    failed: number;
  }>;
  weeklyData: Array<{
    day: string;
    amount: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface DashboardChartProps {
  type: 'line' | 'area' | 'bar' | 'pie';
  title: string;
  height?: number;
  data: ChartData;
}

const DashboardChart: React.FC<DashboardChartProps> = ({
  type,
  title,
  height = 300,
  data
}) => {
  // Check if data is empty
  const isDataEmpty = () => {
    switch (type) {
      case 'line':
      case 'area':
        return !data.monthlyData || data.monthlyData.length === 0 || 
               data.monthlyData.every(item => item.paid === 0 && item.pending === 0 && item.failed === 0);
      case 'bar':
        return !data.weeklyData || data.weeklyData.length === 0 || 
               data.weeklyData.every(item => item.amount === 0);
      case 'pie':
        return !data.statusData || data.statusData.length === 0 || 
               data.statusData.every(item => item.value === 0);
      default:
        return true;
    }
  };

  // Get appropriate icon for empty state
  const getEmptyStateIcon = () => {
    switch (type) {
      case 'line':
      case 'area':
        return <TrendingUp className="h-12 w-12 text-muted-foreground" />;
      case 'bar':
        return <BarChart3 className="h-12 w-12 text-muted-foreground" />;
      case 'pie':
        return <PieChartIcon className="h-12 w-12 text-muted-foreground" />;
      default:
        return <Activity className="h-12 w-12 text-muted-foreground" />;
    }
  };

  // Get appropriate message for empty state
  const getEmptyStateMessage = () => {
    switch (type) {
      case 'line':
      case 'area':
        return 'No transaction data available';
      case 'bar':
        return 'No weekly performance data available';
      case 'pie':
        return 'No transaction status data available';
      default:
        return 'No data available';
    }
  };

  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
        {getEmptyStateIcon()}
        <h3 className="text-lg font-medium text-card-foreground mt-4 mb-2">
          {getEmptyStateMessage()}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {type === 'pie' 
            ? 'Transaction status data will appear here once you have billing records.'
            : 'Chart data will appear here once transactions are available.'
          }
        </p>
      </div>
    );
  };

  const renderChart = () => {
    // Show empty state if no data
    if (isDataEmpty()) {
      return renderEmptyState();
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value, name) => [`£${value}`, name]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="paid"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Paid"
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Pending"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data.monthlyData}>
              <defs>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
                  color: '#F9FAFB',
                }}
                formatter={(value, name) => [`£${value}`, name]}
              />
              <Area
                type="monotone"
                dataKey="paid"
                stackId="1"
                stroke="#10B981"
                fill="url(#colorPaid)"
                name="Paid"
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke="#F59E0B"
                fill="url(#colorPending)"
                name="Pending"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `£${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.4)',
                  color: '#F9FAFB',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                labelStyle={{
                  color: '#F9FAFB',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}
                formatter={(value, name) => [
                  `£${new Intl.NumberFormat('en-GB').format(Number(value))}`,
                  'Revenue'
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar
                dataKey="amount"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                name="Daily Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={data.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.4)',
                  color: '#F9FAFB',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                labelStyle={{
                  color: '#F9FAFB !important',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}
                itemStyle={{
                  color: '#F9FAFB !important',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                formatter={(value, name) => [
                  <span key="value" style={{ color: '#F9FAFB' }}>
                    £{new Intl.NumberFormat('en-GB').format(Number(value))}
                  </span>,
                  <span key="name" style={{ color: '#F9FAFB' }}>{name}</span>
                ]}
                labelFormatter={(label) => (
                  <span style={{ color: '#F9FAFB' }}>{label} Status</span>
                )}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">{title}</h3>
      {renderChart()}
    </div>
  );
};

const AdminDashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('db');
  const [chartData, setChartData] = useState<ChartData>({
    monthlyData: [],
    weeklyData: [],
    statusData: []
  });
  const [, setInvoices] = useState<Invoice[]>([]);

  const processInvoiceDataForCharts = useCallback((invoiceData: Invoice[]): ChartData => {
    // Process monthly data for line/area charts
    const monthlyStats: { [key: string]: { paid: number; pending: number; failed: number } } = {};
    
    // Process weekly data for bar chart (last 7 days)
    const weeklyStats: { [key: string]: number } = {};
    
    // Process status data for pie chart
    const statusStats: { [key: string]: { value: number; color: string } } = {
      'Paid': { value: 0, color: '#10B981' },
      'Pending': { value: 0, color: '#F59E0B' },
      'Overdue': { value: 0, color: '#EF4444' },
      'Draft': { value: 0, color: '#6B7280' }
    };

    invoiceData.forEach(invoice => {
      const createdDate = new Date(invoice.createdDate);
      const monthKey = createdDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
      const dayKey = createdDate.toLocaleDateString('en-GB', { weekday: 'short' });
      const amount = invoice.amount || 0;
      const status = invoice.status?.toLowerCase() || 'pending';

      // Monthly data
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { paid: 0, pending: 0, failed: 0 };
      }

      if (status === 'paid') {
        monthlyStats[monthKey].paid += amount;
      } else if (status === 'overdue') {
        monthlyStats[monthKey].failed += amount;
      } else {
        monthlyStats[monthKey].pending += amount;
      }

      // Weekly data (last 7 days)
      const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo <= 7) {
        if (!weeklyStats[dayKey]) {
          weeklyStats[dayKey] = 0;
        }
        weeklyStats[dayKey] += amount;
      }

      // Status data
      if (status === 'paid') {
        statusStats['Paid'].value += amount;
      } else if (status === 'overdue') {
        statusStats['Overdue'].value += amount;
      } else if (status === 'draft') {
        statusStats['Draft'].value += amount;
      } else {
        statusStats['Pending'].value += amount;
      }
    });

    // Convert to chart format
    const monthlyData = Object.entries(monthlyStats)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months

    const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      .map(day => ({
        day,
        amount: weeklyStats[day] || 0
      }));

    const statusData = Object.entries(statusStats)
      .filter(([, stats]) => stats.value > 0)
      .map(([name, stats]) => ({
        name,
        value: stats.value,
        color: stats.color
      }));

    return {
      monthlyData,
      weeklyData,
      statusData
    };
  }, []);

  const fetchZohoInvoiceData = useCallback(async (token: string) => {
    try {
      console.log('📊 Fetching Zoho invoice data for charts...');
      
      const params = new URLSearchParams({
        source: 'zoho'
      });

      const response = await fetch(`/api/admin/zoho/invoices?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }

      const data = await response.json();
      const invoiceData = data.invoices || [];
      setInvoices(invoiceData);
      
      // Process invoice data for charts
      const processedChartData = processInvoiceDataForCharts(invoiceData);
      setChartData(processedChartData);
      
      console.log('📊 Processed chart data:', processedChartData);
    } catch (error) {
      console.error('Error fetching Zoho invoice data:', error);
    }
  }, [processInvoiceDataForCharts]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authTokens = localStorage.getItem('auth_tokens');
      const token = authTokens ? JSON.parse(authTokens).accessToken : null;
      
      // Use Zoho data source for UI testing (similar to billing page)
      const params = new URLSearchParams({
        source: 'zoho'
      });
      
      const response = await fetch(`/api/admin/dashboard?${params}`, {
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
      setDataSource(data.source || 'db');
      
      console.log('📊 Dashboard data source:', data.source);
      console.log('📊 Dashboard data:', data.dashboard);

      // Fetch Zoho invoice data for charts
      if (data.source === 'zoho') {
        await fetchZohoInvoiceData(token);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchZohoInvoiceData]);

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
  }, [user, isLoading, router, fetchDashboardData]);

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
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm text-blue-100">Administrator</span>
                    </div>
                    {dataSource === 'zoho' && (
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        <span className="text-sm text-blue-100 bg-blue-500/20 px-2 py-1 rounded">
                          UI Testing Mode (Zoho Data)
                        </span>
                      </div>
                    )}
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

        {/* User Growth - Full Width */}
        <div className="mb-8">
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-400 mr-2" />
                  User Growth
                </CardTitle>
                <div className="text-sm text-muted-foreground">Last 12 months</div>
              </div>
            </CardHeader>
            <CardContent>
              <DashboardChart 
                type="line" 
                title="" 
                height={300}
                data={chartData}
              />
            </CardContent>
          </Card>
        </div>

        {/* Other Charts - 50/50 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Status Distribution */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <PieChart className="h-6 w-6 text-green-400 mr-2" />
                User Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardChart 
                type="pie" 
                title="" 
                height={300}
                data={chartData}
              />
            </CardContent>
          </Card>

          {/* Revenue Trends */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <BarChart3 className="h-6 w-6 text-purple-400 mr-2" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardChart 
                type="bar" 
                title="" 
                height={300}
                data={chartData}
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
                  <p className="text-muted-foreground">
                    {dataSource === 'zoho' ? 'Latest customers from Zoho (UI Testing)' : 'Latest user registrations'}
                  </p>
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
