'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import TransactionChart from '@/components/TransactionChart';
import TransactionSummary from '@/components/TransactionSummary';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <ProtectedRoute useDashboardSkeleton={true}>
      <DashboardLayout>
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
                  <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
                  <p className="text-blue-100">Here&apos;s your transaction analytics dashboard</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Activity className="h-8 w-8 text-white/80" />
                <div className="text-right">
                  <p className="text-sm text-blue-100">Live Analytics</p>
                  <p className="text-lg font-semibold">Real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="mb-8">
          <TransactionSummary />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trends */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-400 mr-2" />
                  Monthly Trends
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

          {/* Transaction Status */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <PieChart className="h-6 w-6 text-green-400 mr-2" />
                Transaction Status
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <BarChart3 className="h-6 w-6 text-purple-400 mr-2" />
                Weekly Performance
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

          {/* Revenue Growth */}
          <Card className="shadow-lg bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center">
                <Activity className="h-6 w-6 text-indigo-400 mr-2" />
                Revenue Growth
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
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default DashboardPage; 